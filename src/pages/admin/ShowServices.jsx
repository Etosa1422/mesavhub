import React, { useEffect, useState } from 'react';
import { fetchAllSmmServices } from '../../services/services';
import toast from 'react-hot-toast';
import { FixedSizeList as List } from 'react-window';

const ShowServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetchAllSmmServices();
        if (res.data.success === true) {
          setServices(res.data.data);
        } else {
          toast.error(res.data.message || 'Failed to load services.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error loading services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const TableHeader = () => (
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_0.7fr_0.6fr_0.6fr_0.8fr_1fr] gap-x-4 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 px-4 py-2">
      <div>ID</div>
      <div>Title</div>
      <div>Category</div>
      <div>Rate</div>
      <div>Min</div>
      <div>Max</div>
      <div>Type</div>
      <div>Provider</div>
    </div>
  );

  const Row = ({ index, style }) => {
    const s = services[index];
    return (
      <div
        style={style}
        className="grid grid-cols-[0.5fr_2fr_1.5fr_0.7fr_0.6fr_0.6fr_0.8fr_1fr] gap-x-4 px-4 py-3 items-start text-sm even:bg-gray-50"
      >
        <div>{s.api_service_id}</div>

        {/* Title */}
        <div className="whitespace-normal break-words pr-4">
          {s.service_title}
        </div>

        {/* Category */}
        <div className="whitespace-normal break-words pr-4">
          {s.category?.category_title || '-'}
        </div>

        <div>${s.rate_per_1000}</div>
        <div>{s.min_amount}</div>
        <div>{s.max_amount}</div>
        <div>{s.service_type}</div>
        <div>{s.provider?.api_name || '-'}</div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-xl font-bold mb-5 text-gray-800">All Imported Services</h2>

      {loading ? (
        <div>Loading...</div>
      ) : services.length === 0 ? (
        <div className="text-gray-600">No services found.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="max-h-[600px] sm:overflow-x-visible overflow-x-auto">
            {/* Horizontal scroll on mobile */}
            <div className="min-w-[800px]">
              <TableHeader />
              <List
                height={500}
                itemCount={services.length}
                itemSize={70}
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

export default ShowServices;
