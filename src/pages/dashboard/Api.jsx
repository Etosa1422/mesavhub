import { useState, useEffect } from "react";
import { Info, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  generateApiKey,
  fetchSmmServices,
  placeApiOrder,
  checkOrderStatus,
  checkMultiOrderStatus,
  requestRefill,
  getApiBalance,
  fetchApiOrderHistory,
  fetchUserData
} from "../../services/APIService";
import { CSS_COLORS } from "../../components/constant/colors";

function API() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState({
    initial: true,
    generateKey: false,
    test: false
  });
  const [services, setServices] = useState([]);
  const [copiedItem, setCopiedItem] = useState("");
  const [testConfig, setTestConfig] = useState({
    endpoint: "/services",
    params: JSON.stringify({ key: "", action: "services" }, null, 2),
    response: null
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await fetchUserData();
        const storedApiKey = localStorage.getItem('api_key') || userResponse?.data?.api_key || userResponse?.api_key;
        
        if (storedApiKey) {
          setApiKey(storedApiKey);
          localStorage.setItem('api_key', storedApiKey);
          
          // Update test config with the API key
          setTestConfig(prev => {
            try {
              const currentParams = JSON.parse(prev.params || '{}');
              return {
                ...prev,
                params: JSON.stringify({ ...currentParams, key: storedApiKey }, null, 2)
              };
            } catch (e) {
              return {
                ...prev,
                params: JSON.stringify({ key: storedApiKey }, null, 2)
              };
            }
          });
          
          // Try to fetch services if we have an API key
          try {
            const servicesResponse = await fetchSmmServices();
            if (servicesResponse && Array.isArray(servicesResponse) && servicesResponse.length > 0) {
              setServices(servicesResponse);
            }
          } catch (servicesError) {
            console.warn("Could not load services:", servicesError);
            // Don't show error toast for services, as API key might not be generated yet
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        // Don't show error toast on initial load - user might not have API key yet
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };

    fetchInitialData();
  }, []);

  const handleGenerateApiKey = async () => {
    try {
      setLoading(prev => ({ ...prev, generateKey: true }));
      const response = await generateApiKey();
      const newApiKey = response.api_key || response.data?.api_key;
      
      if (!newApiKey) {
        throw new Error("API key not received from server");
      }
      
      setApiKey(newApiKey);
      localStorage.setItem('api_key', newApiKey);
      
      // Update test config with the new API key
      setTestConfig(prev => {
        try {
          const currentParams = JSON.parse(prev.params || '{}');
          return {
            ...prev,
            params: JSON.stringify({ ...currentParams, key: newApiKey }, null, 2)
          };
        } catch (e) {
          return {
            ...prev,
            params: JSON.stringify({ key: newApiKey }, null, 2)
          };
        }
      });
      
      // Try to fetch services after generating key
      try {
        const servicesResponse = await fetchSmmServices({ key: newApiKey });
        if (servicesResponse && Array.isArray(servicesResponse) && servicesResponse.length > 0) {
          setServices(servicesResponse);
        }
      } catch (servicesError) {
        console.warn("Could not load services:", servicesError);
      }
      
      toast.success("API key generated successfully");
    } catch (error) {
      console.error("API key generation error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to generate API key");
    } finally {
      setLoading(prev => ({ ...prev, generateKey: false }));
    }
  };

  const copyToClipboard = (text, itemName) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemName);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedItem(""), 2000);
  };

  const testApiEndpoint = async () => {
    if (!apiKey) {
      toast.error("You need an API key to test endpoints");
      return;
    }

    setLoading(prev => ({ ...prev, test: true }));
    setTestConfig(prev => ({ ...prev, response: null }));

    try {
      const params = JSON.parse(testConfig.params);
      let response;

      switch(testConfig.endpoint) {
        case '/services':
          response = await fetchSmmServices(params);
          break;
        case '/orders':
          response = await placeApiOrder(params);
          break;
        case '/orders/status':
          response = await checkOrderStatus(params.order);
          break;
        case '/orders/multi-status':
          response = await checkMultiOrderStatus(params.orders?.split(',') || []);
          break;
        case '/refill':
          response = await requestRefill(params.order);
          break;
        case '/balance':
          response = await getApiBalance();
          break;
        case '/orders/history':
          response = await fetchApiOrderHistory({
            status: params.status,
            search: params.search,
            page: params.page || 1
          });
          break;
        default:
          throw new Error("Invalid endpoint");
      }

      setTestConfig(prev => ({ ...prev, response }));
    } catch (error) {
      setTestConfig(prev => ({
        ...prev,
        response: {
          error: error.message || "API request failed",
          details: error
        }
      }));
      toast.error("API test failed");
    } finally {
      setLoading(prev => ({ ...prev, test: false }));
    }
  };

  const apiSections = [
    {
      title: "API Overview",
      type: "overview",
      data: [
        { param: "HTTP Method", desc: "POST" },
        { param: "Base URL", desc: `${window.location.origin}/api/v2` },
        { param: "API Key", desc: apiKey || "Generate below", copyValue: apiKey },
        { param: "Response Format", desc: "JSON" },
      ],
    },
    {
      title: "Service List",
      type: "endpoint",
      endpoint: "/services",
      action: "services",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "services" },
      ],
      exampleResponse: services.length > 0 ? services : [
        {
          service: 1,
          name: "Instagram Followers",
          type: "Default",
          category: "Instagram",
          rate: "0.90",
          min: "50",
          max: "10000",
          refill: true,
          cancel: true,
        }
      ],
    },
    {
      title: "Place Order",
      type: "endpoint",
      endpoint: "/orders",
      action: "add",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "add" },
        { param: "service", desc: "Service ID" },
        { param: "link", desc: "Target URL" },
        { param: "quantity", desc: "Order quantity" },
        { param: "runs", desc: "Runs (optional, for drip feed)" },
        { param: "interval", desc: "Interval in minutes (optional, for drip feed)" },
        { param: "drip_feed", desc: "Enable drip feed (optional, boolean)" },
      ],
      exampleResponse: {
        order: 12345,
        provider_order_id: "provider_123"
      },
    },
    {
      title: "Check Order Status",
      type: "endpoint",
      endpoint: "/orders/status",
      action: "status",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "status" },
        { param: "order", desc: "Order ID" },
      ],
      exampleResponse: {
        charge: 10.50,
        start_count: 1000,
        status: "completed",
        status_description: "Order completed successfully",
        remains: 0,
        currency: "USD",
        provider_order_id: "provider_123"
      },
    },
    {
      title: "Check Multiple Orders Status",
      type: "endpoint",
      endpoint: "/orders/multi-status",
      action: "multi-status",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "multi-status" },
        { param: "orders", desc: "Comma-separated order IDs (e.g., '123,456,789')" },
      ],
      exampleResponse: {
        "123": {
          charge: 10.50,
          start_count: 1000,
          status: "completed",
          remains: 0,
          currency: "USD"
        },
        "456": {
          charge: 25.00,
          start_count: 500,
          status: "in progress",
          remains: 300,
          currency: "USD"
        }
      },
    },
    {
      title: "Get Balance",
      type: "endpoint",
      endpoint: "/balance",
      action: "balance",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "balance" },
      ],
      exampleResponse: {
        balance: 150.75,
        currency: "USD"
      },
    },
    {
      title: "Request Refill",
      type: "endpoint",
      endpoint: "/refill",
      action: "refill",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "refill" },
        { param: "order", desc: "Order ID" },
      ],
      exampleResponse: {
        refill: 12345,
        provider_refill_id: "refill_123"
      },
    },
    {
      title: "Order History",
      type: "endpoint",
      endpoint: "/orders/history",
      action: "history",
      parameters: [
        { param: "key", desc: "Your API key" },
        { param: "action", desc: "history" },
        { param: "status", desc: "Filter by status (optional)" },
        { param: "search", desc: "Search term (optional)" },
        { param: "page", desc: "Page number (optional, default: 1)" },
      ],
      exampleResponse: {
        data: [
          {
            id: 123,
            service_id: 5,
            link: "https://example.com",
            quantity: 1000,
            price: 10.50,
            status: "completed",
            created_at: "2024-01-01T00:00:00Z"
          }
        ],
        meta: {
          current_page: 1,
          last_page: 5,
          per_page: 20,
          total: 100
        }
      },
    },
  ];

  const renderSection = (section) => {
    if (section.type === "overview") {
      return (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{section.title}</h3>
          <div className="space-y-2">
            {section.data.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between py-2 border-b">
                <span className="font-medium text-sm md:text-base">{item.param}</span>
                <div className="flex items-center mt-1 sm:mt-0">
                  <span className="mr-2 text-sm md:text-base">{item.desc}</span>
                  {item.copyValue && (
                    <button 
                      onClick={() => copyToClipboard(item.copyValue, item.param)}
                      className="text-green-500 hover:text-green-700"
                    >
                      {copiedItem === item.param ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-semibold mb-2 sm:mb-0">{section.title}</h3>
            <span className="bg-gray-100 px-2 py-1 rounded text-xs md:text-sm">POST {section.endpoint}</span>
          </div>
          
          <h4 className="font-medium mb-2 text-sm md:text-base">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">Parameter</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {section.parameters.map((param, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-mono text-gray-900">{param.param}</td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{param.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h4 className="font-medium text-sm md:text-base">Example Response</h4>
            <button
              onClick={() => copyToClipboard(JSON.stringify(section.exampleResponse, null, 2), section.title)}
              className="flex items-center text-xs md:text-sm text-green-500 hover:text-green-700"
            >
              {copiedItem === section.title ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
              Copy
            </button>
          </div>
          <pre className="bg-gray-800 text-gray-100 p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm">
            <code>{JSON.stringify(section.exampleResponse, null, 2)}</code>
          </pre>
        </div>
      </div>
    );
  };

  if (loading.initial) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-green-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">API Documentation</h1>
      
      {!apiKey && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm md:text-base font-medium text-green-800">API Key Required</h3>
              <div className="mt-2 text-sm md:text-base text-green-700">
                <p>You need an API key to access our endpoints.</p>
              </div>
              <div className="mt-3 md:mt-4">
                <button
                  onClick={handleGenerateApiKey}
                  disabled={loading.generateKey}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading.generateKey && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  Generate API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {apiSections.map((section, index) => (
          <div key={index} className="space-y-4 md:space-y-6">
            {renderSection(section)}
          </div>
        ))}
      </div>

      {apiKey && (
        <div className="mt-8 md:mt-12 bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">API Test Console</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Endpoint</label>
              <select
                value={testConfig.endpoint}
                onChange={(e) => {
                  const selectedSection = apiSections.find(s => s.endpoint === e.target.value);
                  const defaultParams = { 
                    key: apiKey || "",
                    action: selectedSection?.action || ""
                  };
                  
                  // Add endpoint-specific default params
                  if (e.target.value === '/orders') {
                    defaultParams.service = "";
                    defaultParams.link = "";
                    defaultParams.quantity = "";
                  } else if (e.target.value === '/orders/status' || e.target.value === '/refill') {
                    defaultParams.order = "";
                  } else if (e.target.value === '/orders/multi-status') {
                    defaultParams.orders = "";
                  } else if (e.target.value === '/orders/history') {
                    defaultParams.page = 1;
                    defaultParams.status = "";
                    defaultParams.search = "";
                  }
                  
                  setTestConfig(prev => ({
                    ...prev,
                    endpoint: e.target.value,
                    params: JSON.stringify(defaultParams, null, 2)
                  }));
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md"
              >
                {apiSections.filter(s => s.type === "endpoint").map((section, idx) => (
                  <option key={idx} value={section.endpoint}>{section.endpoint}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Parameters (JSON)</label>
              <textarea
                value={testConfig.params}
                onChange={(e) => setTestConfig(prev => ({ ...prev, params: e.target.value }))}
                rows={4}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 mt-1 block w-full text-xs md:text-sm border border-gray-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={testApiEndpoint}
              disabled={loading.test}
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading.test && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Test Endpoint
            </button>
          </div>

          {testConfig.response && (
            <div className="mt-4 md:mt-6">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <h3 className="text-base md:text-lg font-medium">Response</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(testConfig.response, null, 2), "test-response")}
                  className="flex items-center text-xs md:text-sm text-green-500 hover:text-green-700"
                >
                  {copiedItem === "test-response" ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                  Copy
                </button>
              </div>
              <pre className="bg-gray-800 text-gray-100 p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm">
                <code>{JSON.stringify(testConfig.response, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-gray-200">
        <p className="text-center text-xs md:text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Your SMM Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default API;