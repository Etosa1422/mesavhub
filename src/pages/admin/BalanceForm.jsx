"use client"

import { useState } from "react"
import { X, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import { adjustUserBalance } from "../../services/adminService"

const BalanceForm = ({ user, onCancel }) => {
  const [amount, setAmount] = useState("")
  const [action, setAction] = useState("add")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    setLoading(true)

    try {
      const response = await adjustUserBalance(user.id, action, parseFloat(amount), notes)
      toast.success(response.message || response.status === 'success' ? 'Balance adjusted successfully' : response.message || "Balance adjusted successfully.")
      setAmount("")
      setNotes("")
      onCancel?.()
    } catch (error) {
      if (error.response) {
        const res = error.response.data
        if (res.errors) {
          Object.entries(res.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`)
          })
        } else {
          toast.error(res.message || "Something went wrong.")
        }
      } else {
        toast.error("Network error.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Adjust Balance for {user.username}
          </h2>
          <p className="text-gray-600 mt-1 text-sm">Add or subtract from user's balance.</p>
        </div>
        <button
          onClick={onCancel}
          className="self-end sm:self-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            >
              <option value="add">Add Funds</option>
              <option value="subtract">Subtract Funds</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this transaction..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-y text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
        >
          <DollarSign className="w-4 h-4" />
          {loading ? "Processing..." : action === "add" ? "Add Funds" : "Subtract Funds"}
        </button>
      </form>
    </div>
  )
}

export default BalanceForm
