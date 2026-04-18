"use client"

import { useState } from "react"
import { Eye, EyeOff, Copy, Check, Globe, Shield, DollarSign, User, Info, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const currencies = [
  { value: "usd", label: "United States Dollars (USD)", symbol: "$" },
  { value: "ngn", label: "Nigerian Naira (NGN)", symbol: "₦" },
  { value: "eur", label: "Euro (EUR)", symbol: "€" },
  { value: "gbp", label: "British Pound (GBP)", symbol: "£" },
]

const nameservers = ["ns1.perfectdns.com", "ns2.perfectdns.com"]

const ChildPanel = () => {
  const [formData, setFormData] = useState({
    domain: "",
    currency: "usd",
    adminUsername: "",
    adminPassword: "",
    confirmPassword: "",
    pricePerMonth: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [copiedNameserver, setCopiedNameserver] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const copyNameserver = async (nameserver) => {
    try {
      await navigator.clipboard.writeText(nameserver)
      setCopiedNameserver(nameserver)
      setTimeout(() => setCopiedNameserver(null), 2000)
    } catch (err) {
      console.error("Failed to copy nameserver:", err)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required"
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = "Please enter a valid domain name"
    }

    if (!formData.adminUsername.trim()) {
      newErrors.adminUsername = "Admin username is required"
    } else if (formData.adminUsername.length < 3) {
      newErrors.adminUsername = "Username must be at least 3 characters"
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = "Admin password is required"
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.pricePerMonth.trim()) {
      newErrors.pricePerMonth = "Price per month is required"
    } else if (isNaN(Number(formData.pricePerMonth)) || Number(formData.pricePerMonth) <= 0) {
      newErrors.pricePerMonth = "Please enter a valid price"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    toast("Child panel setup is coming soon. Please contact support for access.", {
      icon: "🚧",
      duration: 4000,
    })
  }

  const selectedCurrency = currencies.find((c) => c.value === formData.currency)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Child Panel Setup</h1>
          <p className="text-gray-600">Create and configure your reseller panel</p>
        </div>

        {/* Domain Configuration */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl font-bold">Domain Configuration</h2>
            </div>
            <p className="text-green-100 mt-1">Set up your custom domain for the child panel</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="domain" className="block text-sm font-semibold text-gray-700 mb-1">
                Domain Name
              </label>
              <input
                id="domain"
                placeholder="example.com"
                value={formData.domain}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                className={`w-full h-12 px-4 py-2 border-2 rounded-md ${errors.domain ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
              />
              {errors.domain && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.domain}
                </p>
              )}
            </div>

            {/* Nameserver Instructions */}
            <div className="border border-green-200 bg-green-50 rounded-md p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-green-800">
                  <div className="font-semibold mb-2">Please change nameservers to:</div>
                  <div className="space-y-2">
                    {nameservers.map((ns, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                        <code className="font-mono text-sm text-green-700">{ns}</code>
                        <button
                          onClick={() => copyNameserver(ns)}
                          className="px-3 py-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50"
                        >
                          {copiedNameserver === ns ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Configuration */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Panel Configuration</h2>
                <p className="text-gray-600">Configure your panel settings and admin credentials</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Currency Selection */}
              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  className="w-full h-12 px-4 py-2 border-2 border-gray-200 focus:border-green-500 rounded-md"
                >
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              <hr className="border-t border-gray-200" />

              {/* Admin Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Admin Credentials
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="adminUsername" className="block text-sm font-semibold text-gray-700 mb-1">
                      Admin Username
                    </label>
                    <input
                      id="adminUsername"
                      placeholder="Enter admin username"
                      value={formData.adminUsername}
                      onChange={(e) => handleInputChange("adminUsername", e.target.value)}
                      className={`w-full h-12 px-4 py-2 border-2 rounded-md ${errors.adminUsername ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                    />
                    {errors.adminUsername && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.adminUsername}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pricePerMonth" className="block text-sm font-semibold text-gray-700 mb-1">
                      Price per Month
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-mono">
                        {selectedCurrency?.symbol}
                      </span>
                      <input
                        id="pricePerMonth"
                        type="number"
                        placeholder="0.00"
                        value={formData.pricePerMonth}
                        onChange={(e) => handleInputChange("pricePerMonth", e.target.value)}
                        className={`w-full h-12 pl-8 px-4 py-2 border-2 rounded-md ${errors.pricePerMonth ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      />
                    </div>
                    {errors.pricePerMonth && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.pricePerMonth}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="adminPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                      Admin Password
                    </label>
                    <div className="relative">
                      <input
                        id="adminPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter admin password"
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                        className={`w-full h-12 px-4 py-2 pr-10 border-2 rounded-md ${errors.adminPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-gray-50 rounded-r-md"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.adminPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.adminPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm admin password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`w-full h-12 px-4 py-2 pr-10 border-2 rounded-md ${errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-gray-50 rounded-r-md"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary and Submit */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>

            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{formData.domain || "Not specified"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{selectedCurrency?.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admin Username:</span>
                <span className="font-medium">{formData.adminUsername || "Not specified"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Price:</span>
                <span className="font-semibold text-green-600">
                  {selectedCurrency?.symbol}
                  {formData.pricePerMonth || "0.00"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 px-4 py-2 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-md shadow-lg transition-all duration-200 disabled:opacity-70 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating Panel...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Submit Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Custom Domain</h3>
              <p className="text-sm text-gray-600">Use your own domain for professional branding</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Secure Panel</h3>
              <p className="text-sm text-gray-600">Advanced security features and admin controls</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Flexible Pricing</h3>
              <p className="text-sm text-gray-600">Set your own prices and profit margins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildPanel