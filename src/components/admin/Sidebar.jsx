import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  List, 
  Zap,
  ShoppingBag,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  BarChart3,
  Settings,
  Database,
  Ticket,
  Bell,
  X,
  Shield,
  Phone,
  Key
} from 'lucide-react';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen
}) => {

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', to: '/admin/dashboard' },
    { icon: Users, label: 'All Users', to: '/admin/manage-users' },
    { icon: Plus, label: 'Add Services', to: '/admin/add-services' },
    { icon: List, label: 'Show Services', to: '/admin/show-services' },
    { icon: Zap, label: 'Manage API Providers', to: '/admin/api-providers' },
    { icon: TrendingUp, label: 'Bulk Price Increase', to: '/admin/bulk-price-increase' },
    { icon: Phone, label: 'VN Pricing', to: '/admin/virtual-number-pricing' },
    { icon: Key, label: 'VN Settings', to: '/admin/vn-settings' },
    { icon: DollarSign, label: 'Transactions', to: '/admin/transactions' },
    { icon: ShoppingBag, label: 'Orders', to: '/admin/orders' },
    { icon: Ticket, label: 'Ticket', to: '/admin/tickets' },
    { icon: Bell, label: 'Updates', to: '/admin/updates' },
    { icon: Mail, label: 'Send Mail', to: '/admin/send-mail' },
    // { icon: Database, label: 'System Logs', to: '/admin/system-logs' }, 
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-lg border-r border-gray-200/50
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      overflow-y-auto
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Mesavhub" className="h-20 w-auto" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg">Admin Panel</span>
              <span className="text-xs text-gray-500">Control Center</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              end={item.to === '/admin'} // exact match for dashboard
              onClick={() => {
                // Close sidebar on mobile after clicking a link
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-green-600'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">System Status</div>
                <div className="text-xs text-gray-600">All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
