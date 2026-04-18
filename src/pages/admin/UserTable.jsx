"use client"

import { 
  Search, 
  MoreVertical, 
  AlertCircle, 
  UserPlus,  
  User,
  CheckCircle,
  Smartphone,
  Shield,
  Mail  
} from "lucide-react"
import ActionDropdown from "./ActionDropdown"

const UserTable = ({
  users,
  selectedUser,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onSyncServices,
  onDelete,
  isLoading,
  formatCurrency,
  activeDropdownUserId,
  setActiveDropdownUserId,
}) => {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="p-4 border-b border-gray-100 bg-green-600">
          <h3 className="text-white font-semibold">Users ({users.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            users.map((user, index) => (
              <div key={user.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <h4 className="font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">@{user.username}</p>
                        <p className="text-xs text-gray-600 mb-2">{user.email}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(user)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              user.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active" ? "Active" : "Banned"}
                          </span>
                        </div>
                    
                      </div>
                    </div>
                  </div>
                  <ActionDropdown
                    user={user}
                    isOpen={activeDropdownUserId === user.id}
                    onToggle={() => {
                      setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id)
                    }}
                    onViewDetails={onViewDetails}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold">
                <input type="checkbox" className="rounded border-green-300" />
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold">No.</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">User</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Contact</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Balance</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{user.email}</span>
                      <span className="text-xs text-gray-500">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(user)}
                      </span>
                      <span className="text-xs text-gray-500">{user.total_orders} orders</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Banned"}
                    </span>
                  </td>
               
                  <td className="px-4 py-4">
                    <ActionDropdown
                      user={user}
                      isOpen={activeDropdownUserId === user.id}
                      onToggle={() => {
                        setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id)
                      }}
                      onViewDetails={onViewDetails}
                      onEdit={onEdit}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                      isLoading={isLoading}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserTable