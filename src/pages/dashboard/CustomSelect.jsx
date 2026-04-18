import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader } from 'lucide-react';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  displayProperty = 'name',
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-left flex items-center justify-between hover:border-gray-300 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center text-gray-500">
            <Loader className="animate-spin w-4 h-4 mr-2" />
            Loading...
          </span>
        ) : (
          <>
            <span className="truncate text-gray-700">
              {value ? value[displayProperty] : placeholder}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-green-50 focus:bg-green-50 text-gray-700 border-b border-gray-100 last:border-b-0 cursor-pointer"
            >
              <div className="truncate">{option[displayProperty]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
