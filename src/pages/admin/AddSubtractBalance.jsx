"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  X,
  DollarSign,
  Plus,
  Minus,
  Check,
  FileText,
  ArrowLeft,
} from "lucide-react"
import { getUserById, adjustUserBalance } from "../../services/adminService"
import toast, { Toaster } from "react-hot-toast"

export default function AddSubtractBalance({ onCancel }) {
  const [user, setUser] = useState(null)
  const [amount, setAmount] = useState("")
  const [isAdding, setIsAdding] = useState(true)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id)
        setUser(res.data)
      } catch (err) {
        setError(err.message || "Failed to load user")
      }
    }

    fetchUser()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.trim())

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.")
      return
    }

    setLoading(true)

    try {
      await adjustUserBalance({
        user_id: user.id,
        amount: parsedAmount,
        type: isAdding ? "add" : "subtract",
        note,
      })

      toast.success("Balance adjusted successfully.")
      setAmount("")
      setNote("")
      setIsAdding(true)
      onCancel()
    } catch (err) {
      console.error(err)
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong while adjusting balance."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {error ? `Error: ${error}` : "Loading user..."}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 relative">
      <Toaster position="top-right" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-sm text-green-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100 mt-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            Add/Subtract Balance
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Adjust balance for{" "}
            <span className="font-semibold text-green-700">@{user.username}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Current Balance: {Number(user.balance).toFixed(2)} {user.currency}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="self-end sm:self-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700"
          aria-label="Close balance adjustment form"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({user.currency})
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            step="0.01"
            min="0.01"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Operation</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                isAdding ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                !isAdding ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Minus className="w-4 h-4" />
              Subtract
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Note (Optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for balance adjustment..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-y text-sm placeholder-gray-400"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 ${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            } text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-base shadow-md hover:shadow-lg`}
          >
            <Check className="w-5 h-5" />
            {loading
              ? "Processing..."
              : isAdding
              ? "Add Balance"
              : "Subtract Balance"}
          </button>
        </div>
      </form>
    </div>
  )
}
