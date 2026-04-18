import React, { useEffect, useState } from 'react';
import { fetchApiProviders, fetchServicesFromProvider, importSelectedServices } from '../../services/services';
import toast from 'react-hot-toast';
import { FixedSizeList as List } from 'react-window';

const AddServices = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetchApiProviders();
        setProviders(res.data.data);
      } catch {
        toast.error('Failed to fetch providers.');
      }
    };
    fetchProviders();
  }, []);

  const handleFetchServices = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return toast.error('Select a provider');

    setLoading(true);
    try {
      const res = await fetchServicesFromProvider(selectedProvider);
      if (res.data.status === 'success') {
        setServices(res.data.data);
        toast.success(res.data.message);
        setSelectedServices({});
        setSelectAll(false);
      } else {
        toast.error(res.data.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (id) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const checked = !selectAll;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      services.forEach((s) => {
        newSelected[s.service] = true;
      });
    }
    setSelectedServices(newSelected);
  };

  const handleImportSelected = async () => {
    const selected = services.filter((s) => selectedServices[s.service]);
    if (selected.length === 0) {
      return toast.error('No services selected.');
    }

    const payload = selected;

    setImporting(true);
    try {
      const res = await importSelectedServices(selectedProvider, payload);
      if (res.data.status === 'success') {
        toast.success(res.data.message || 'Services imported.');
        setSelectedServices({});
        setSelectAll(false);
      } else {
        toast.error(res.data.message || 'Failed to import.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import error');
    } finally {
      setImporting(false);
    }
  };

  const TableHeader = () => (
    <div className="grid min-w-[900px] grid-cols-7 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 px-4 py-2">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        <span>Select</span>
      </div>
      <div>ID</div>
      <div>Name</div>
      <div>Category</div>
      <div>Rate</div>
      <div>Min</div>
      <div>Max</div>
    </div>
  );

  const Row = ({ index, style }) => {
    const s = services[index];
    const isChecked = !!selectedServices[s.service];

    return (
      <div
        style={style}
        className="grid min-w-[900px] grid-cols-7 px-4 py-3 items-center text-sm even:bg-gray-50"
      >
        <div>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleSelectService(s.service)}
            className="accent-green-600"
          />
        </div>
        <div>{s.service}</div>
        <div className="truncate">{s.name}</div>
        <div>{s.category}</div>
        <div>${s.rate}</div>
        <div>{s.min}</div>
        <div>{s.max}</div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-xl font-bold mb-5 text-gray-800">Import Services</h2>

      {/* Provider Select & Fetch Button */}
      <form onSubmit={handleFetchServices} className="space-y-4 mb-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Select Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Choose Provider --</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.api_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90'
          }`}
        >
          {loading ? 'Fetching...' : 'Fetch Services'}
        </button>
      </form>

      {/* Services Table */}
      {services.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-800 text-lg">Fetched Services</h3>
            <button
              onClick={handleImportSelected}
              disabled={
                Object.keys(selectedServices).length === 0 || importing
              }
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${
                Object.keys(selectedServices).length === 0 || importing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90'
              }`}
            >
              {importing ? 'Importing...' : 'Import Selected'}
            </button>
          </div>

          <div className="max-h-[500px] overflow-auto">
            <div className="w-full overflow-x-auto">
              <TableHeader />
              <List
                height={450}
                itemCount={services.length}
                itemSize={50}
                width="100%"
              >
                {Row}
              </List>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddServices;
