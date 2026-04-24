"use client";

import {
  Eye,
  Edit3,
  Power,
  RefreshCw,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionDropdown = ({
  user,
  isOpen,
  onToggle,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onSyncServices,
  onDelete,
  isLoading,
}) => {
  const navigate = useNavigate();

  const handleView = () => {
    // Use onViewDetails if provided, otherwise navigate
    if (onViewDetails) {
      onViewDetails(user);
    } else {
      navigate(`/admin/users/${user.id}/View`);
    }
    onToggle();
  }; 

  const handleEdit = () => {
    // Use onEdit if provided, otherwise navigate
    if (onEdit) {
      onEdit(user);
    } else {
      navigate(`/admin/users/${user.id}/Edit`);
    }
    onToggle();
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          />
          <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 px-1 z-50 w-36 sm:w-auto">
            {/* Mobile: vertical list. Desktop: horizontal row */}
            <div className="flex flex-col sm:flex-row gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleView();
                }}
                className="px-3 py-2 hover:bg-gray-50 flex items-center sm:flex-col gap-2 sm:gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg w-full sm:w-auto sm:min-w-[80px]"
              >
                <Eye className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>View</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="px-3 py-2 hover:bg-gray-50 flex items-center sm:flex-col gap-2 sm:gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg w-full sm:w-auto sm:min-w-[80px]"
              >
                <Edit3 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(user.id);
                  onToggle();
                }}
                className="px-3 py-2 hover:bg-gray-50 flex items-center sm:flex-col gap-2 sm:gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg w-full sm:w-auto sm:min-w-[80px]"
              >
                <Power
                  className={`w-4 h-4 flex-shrink-0 ${
                    user.status === "active" ? "text-red-600" : "text-green-600"
                  }`}
                />
                <span>{user.status === "active" ? "Ban" : "Activate"}</span>
              </button>

              <div className="border-t sm:border-t-0 sm:border-l border-gray-100 my-1 sm:my-0 sm:mx-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user.id);
                  onToggle();
                }}
                className="px-3 py-2 hover:bg-red-50 flex items-center sm:flex-col gap-2 sm:gap-1 text-sm font-medium text-red-600 transition-colors duration-200 rounded-lg w-full sm:w-auto sm:min-w-[80px]"
              >
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionDropdown;
