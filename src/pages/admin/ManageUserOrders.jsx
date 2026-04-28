"use client"
import { useState, useEffect, useMemo, forwardRef } from "react"
import { useParams } from "react-router-dom"
import {
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Globe,
  CheckCircle,
  ShoppingCart,
  X,
  ClipboardList,
} from "lucide-react"
import { getUserById, fetchUserOrders, deleteOrder, updateOrder, updateOrderStatus } from "../../services/adminService" 

// Utility functions
const cn = (...classes) => classes.filter(Boolean).join(" ")
const normalizeStatus = (status) => status.toLowerCase().replace(/\s+/g, "-")

// Status constants
const ORDER_STATUSES = {
  PROCESSING: "processing",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  PARTIAL: "partial",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
}
const STATUS_OPTIONS = ["All Status", "Processing", "In Progress", "Completed", "Partial", "Cancelled", "Refunded"]

// Corrected Select components
const Select = ({ value, onValueChange, children, className }) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  )
}
const SelectTrigger = ({ children, className }) => (
  <div className={cn("flex items-center justify-between", className)}> {children} </div>
)
const SelectContent = ({ children }) => <>{children}</>
const SelectItem = ({ children, value }) => <option value={value}>{children}</option>

// Simplified UI Components
const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  const Component = asChild ? "span" : "button"
  return (
    <Component
      className={cn(baseClasses, variantClasses[variant || "default"], sizeClasses[size || "default"], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
))
Label.displayName = "Label"

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const Checkbox = forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    checked={checked}
    onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-90 sm:data-[state=open]:slide-in-from-bottom-0">
        {children}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  )
}
const DialogContent = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
    {children}
  </div>
)
const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
const DialogTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)
const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      {children.map((child, index) => {
        if (child.type === DropdownMenuTrigger) {
          return (
            <div key={index} onClick={() => setIsOpen(!isOpen)}>
              {child.props.asChild ? child.props.children : <Button {...child.props}>{child.props.children}</Button>}
            </div>
          )
        }
        if (child.type === DropdownMenuContent && isOpen) {
          return (
            <div
              key={index}
              className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50"
            >
              {child.props.children}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
const DropdownMenuTrigger = ({ children, asChild }) => {
  return asChild ? children : <button>{children}</button>
}
const DropdownMenuContent = ({ children }) => {
  return children
}
const DropdownMenuItem = ({ children, onClick, className }) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

const ActionDropdown = ({ order, isOpen, onToggle, onEdit, onDelete, onChangeStatus, isLoading }) => {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
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
              e.stopPropagation()
              onToggle()
            }}
          />
          <div
            className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 px-1 z-50"
            style={{ width: "auto", minWidth: "max-content" }}
          >
            <div className="flex flex-row gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(order)
                }}
                className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
                style={{ minWidth: "100px" }}
              >
                <Edit3 className="w-4 h-4 text-green-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChangeStatus(order)
                }}
                className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
                style={{ minWidth: "100px" }}
              >
                <RefreshCw className="w-4 h-4 text-orange-600" />
                <span>Status</span>
              </button>
              <div className="border-l border-gray-100 mx-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(order.id)
                }}
                className="px-3 py-2 hover:bg-red-50 flex flex-col items-center gap-1 text-sm font-medium text-red-600 transition-colors duration-200 rounded-lg"
                style={{ minWidth: "100px" }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const OrderStats = ({ orders = [], formatCurrency }) => {
  const totalCharge = orders.reduce((sum, order) => sum + parseFloat(order.price || order.charge || 0), 0)
  const completedOrdersCount = orders.filter(
    (order) => normalizeStatus(order.status) === ORDER_STATUSES.COMPLETED,
  ).length
  const totalQuantity = orders.reduce((sum, order) => sum + parseInt(order.quantity || 0, 10), 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Globe className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">All orders received</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedOrdersCount}</div>
          <p className="text-xs text-muted-foreground">Orders successfully delivered</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Charge</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCharge)}</div>
          <p className="text-xs text-muted-foreground">Total amount charged</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuantity}</div>
          <p className="text-xs text-muted-foreground">Total items/services ordered</p>
        </CardContent>
      </Card>
    </div>
  )
}

const OrderTable = ({
  orders,
  selectedOrder,
  onEdit,
  onChangeStatus,
  onDelete,
  isLoading,
  formatCurrency,
  formatDate,
  getStatusColor,
  activeDropdownId,
  setActiveDropdownId,
}) => {
  const handleToggleDropdown = (orderId) => {
    if (activeDropdownId === orderId) {
      setActiveDropdownId(null)
    } else {
      setActiveDropdownId(orderId)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="p-4 border-b border-gray-100 bg-green-600">
          <h3 className="text-white font-semibold">Orders ({orders.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{order.id}</span>
                          <h4 className="font-semibold text-gray-900">{order.service?.name || "N/A"}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(order.price ?? order.charge)}</span>
                          <span className="text-xs text-gray-500"> Qty: {order.quantity} </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  <ActionDropdown
                    order={order}
                    isOpen={activeDropdownId === order.id}
                    onToggle={() => handleToggleDropdown(order.id)}
                    onEdit={onEdit}
                    onChangeStatus={onChangeStatus}
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
              <th className="px-4 py-4 text-left text-sm font-semibold">Order ID</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Charge</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Quantity</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Link</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Created</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500 font-medium">No orders found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(order.price ?? order.charge)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{order.quantity}</td>
                  <td className="px-4 py-4 text-sm text-green-600">
                    <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      View
                    </a>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-4">
                    <ActionDropdown
                      order={order}
                      isOpen={activeDropdownId === order.id}
                      onToggle={() => handleToggleDropdown(order.id)}
                      onEdit={onEdit}
                      onChangeStatus={onChangeStatus}
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

function EditOrderModal({ order, onClose, onSave, isSaving }) {
  const [editedOrder, setEditedOrder] = useState(order)

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedOrder((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onSave(editedOrder)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Order {order?.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Link
            </Label>
            <Input
              id="link"
              name="link"
              value={editedOrder?.link || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="charge" className="text-right">
              Charge
            </Label>
            <Input
              id="charge"
              name="price"
              type="number"
              value={editedOrder?.price ?? editedOrder?.charge ?? 0}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={editedOrder?.quantity || 0}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status_description" className="text-right">
              Description
            </Label>
            <Textarea
              id="status_description"
              name="status_description"
              value={editedOrder?.status_description || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChangeOrderStatusModal({ order, onClose, onSave, isSaving, statusOptions }) {
  const [newStatus, setNewStatus] = useState(order?.status || "")
  const [statusDescription, setStatusDescription] = useState(order?.status_description || "")
  const [reason, setReason] = useState(order?.reason || "")

  const handleSave = () => {
    onSave({ id: order.id, newStatus, statusDescription, reason })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Order Status for {order?.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newStatus" className="text-right">
              New Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="col-span-3">{newStatus}</SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status.toLowerCase().replace(/\s+/g, "-")}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="statusDescription" className="text-right">
              Description
            </Label>
            <Textarea
              id="statusDescription"
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ManageUserOrders() {
  const params = useParams()
  const userId = params.id
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [userResponse, ordersResponse] = await Promise.all([getUserById(userId), fetchUserOrders(userId)])

        if (userResponse?.data) {
          setUser(userResponse.data)
        } else {
          throw new Error("User data not found")
        }

        let ordersData = []
        if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse
        } else if (Array.isArray(ordersResponse?.data)) {
          ordersData = ordersResponse.data
        } else if (ordersResponse?.data) {
          ordersData = ordersResponse.data.orders || []
        }
        setOrders(ordersData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load data")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchData()
  }, [userId])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case ORDER_STATUSES.PROCESSING:
        return "bg-green-100 text-green-800"
      case ORDER_STATUSES.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800"
      case ORDER_STATUSES.COMPLETED:
        return "bg-green-100 text-green-800"
      case ORDER_STATUSES.PARTIAL:
        return "bg-green-100 text-green-800"
      case ORDER_STATUSES.CANCELLED:
        return "bg-red-100 text-red-800"
      case ORDER_STATUSES.REFUNDED:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.reason?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "All Status" || normalizeStatus(order.status) === normalizeStatus(statusFilter)

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const handleEditOrder = (order) => {
    setCurrentOrder(order)
    setIsEditModalOpen(true)
    setActiveDropdownId(null)
  }

  const handleChangeOrderStatus = (order) => {
    setCurrentOrder(order)
    setIsStatusModalOpen(true)
    setActiveDropdownId(null)
  }

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id)
        setOrders((prev) => prev.filter((order) => order.id !== id))
      } catch (err) {
        console.error("Error deleting order:", err)
        alert("Failed to delete order: " + err.message)
      } finally {
        setActiveDropdownId(null)
      }
    }
  }

  const handleSaveOrder = async (updatedOrder) => {
    try {
      setIsSaving(true)
      const updated = await updateOrder(updatedOrder)
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)))
      setIsEditModalOpen(false)
      setCurrentOrder(null)
    } catch (err) {
      console.error("Error updating order:", err)
      alert("Failed to update order: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveOrderStatus = async ({ id, newStatus, statusDescription, reason }) => {
    try {
      setIsSaving(true)
      const updatedOrder = await updateOrderStatus(id, newStatus, statusDescription, reason)
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...updatedOrder } : order)))
      setIsStatusModalOpen(false)
      setCurrentOrder(null)
    } catch (err) {
      console.error("Error updating order status:", err)
      alert("Failed to update order status: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-green-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 my-2 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Orders for {user?.first_name}</h2>
        <p className="text-gray-600">Configure and monitor user orders.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus-visible:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] focus:ring-green-500">{statusFilter}</SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="md:hidden p-2 border rounded-md" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <ClipboardList className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showMobileFilters && (
        <div className="md:hidden bg-gray-50 p-3 rounded-md mb-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus-visible:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter} className="w-full focus:ring-green-500">
              <SelectTrigger>{statusFilter}</SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <OrderStats orders={filteredOrders} formatCurrency={formatCurrency} />

      <div className="mt-6">
        <OrderTable
          orders={filteredOrders}
          onEdit={handleEditOrder}
          onChangeStatus={handleChangeOrderStatus}
          onDelete={handleDeleteOrder}
          isLoading={isSaving}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
        />
      </div>

      {isEditModalOpen && currentOrder && (
        <EditOrderModal
          order={currentOrder}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveOrder}
          isSaving={isSaving}
        />
      )}

      {isStatusModalOpen && currentOrder && (
        <ChangeOrderStatusModal
          order={currentOrder}
          onClose={() => setIsStatusModalOpen(false)}
          onSave={handleSaveOrderStatus}
          isSaving={isSaving}
          statusOptions={STATUS_OPTIONS.slice(1)} // Exclude "All Status" for actual status change
        />
      )}
    </div>
  )
}
