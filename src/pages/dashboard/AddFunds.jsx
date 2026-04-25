"use client"

import { useState, useEffect } from "react"
import { CreditCard, ChevronDown, Plus, History, Clock, Loader2, Smartphone, CheckCircle2, Copy, MessageCircle, Bitcoin, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { fetchUserData, initiatePayment, paymentHistory } from "../../services/userService"
import { getSiteSettings } from "../../services/adminService"
import { CSS_COLORS } from "../../components/constant/colors"

const AddFunds = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState({ symbol: "₦", code: "NGN" })
  const [selectedMethod, setSelectedMethod] = useState("flutterwave")
  const [amount, setAmount] = useState("")
  const [activeTab, setActiveTab] = useState("add-funds")
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)

  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [opayDetails, setOpayDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "OPay",
  })
  const [korrapayDetails, setKorrapayDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "KorraPay",
  })
  const [cryptoDetails, setCryptoDetails] = useState({
    walletAddress: "",
    network: "",
    currency: "",
  })
  const [enabledMethods, setEnabledMethods] = useState({
    flutterwave: true,
    kora: true,
    opay: true,
    korrapay: true,
    crypto: true,
  })

  const paymentMethods = [
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Pay securely via card, bank transfer, or mobile money. Instant. Min ₦100.",
      icon: <CreditCard className="w-5 h-5" style={{ color: CSS_COLORS.primary }} />,
      minAmount: 100,
      supportedCurrencies: ["NGN", "USD", "GHS", "KES"],
    },
    {
      id: "kora",
      name: "Korapay",
      description: "Pay securely via card or bank transfer. Instant credit. Min ₦100.",
      icon: <Zap className="w-5 h-5 text-violet-500" />,
      minAmount: 100,
      supportedCurrencies: ["NGN"],
    },
    {
      id: "opay",
      name: "OPay (Manual)",
      description: "Transfer to our OPay account and upload your payment screenshot. Credited within 5–15 minutes. Min ₦500.",
      icon: <Smartphone className="w-5 h-5 text-green-500" />,
      minAmount: 500,
      supportedCurrencies: ["NGN"],
    },
    {
      id: "korrapay",
      name: "KorraPay (Manual)",
      description: "Transfer to our KorraPay account and send your screenshot to admin. Credited within 5–15 minutes. Min ₦500.",
      icon: <CreditCard className="w-5 h-5 text-purple-500" />,
      minAmount: 500,
      supportedCurrencies: ["NGN"],
    },
    {
      id: "crypto",
      name: "Crypto (Manual)",
      description: "Send crypto to our wallet address and send proof to admin. Credited after confirmation. Min $1.",
      icon: <Bitcoin className="w-5 h-5 text-orange-400" />,
      minAmount: 1,
      supportedCurrencies: ["NGN"],
    },
  ]

  const currencies = [
    { code: "NGN", symbol: "₦", name: "Naira" },
    // { code: "USD", symbol: "$", name: "US Dollar" },
    // { code: "GHS", symbol: "₵", name: "Ghana Cedi" },
    // { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  ]

  const visibleMethods = paymentMethods.filter(m => enabledMethods[m.id])

  const currentMethod = visibleMethods.find((method) => method.id === selectedMethod)
  const supportedCurrencies = currencies.filter(currency => 
    currentMethod?.supportedCurrencies?.includes(currency.code)
  )

  const faqItems = [
    {
      id: "payment-methods",
      title: "What payment methods are available?",
      content: "We support Flutterwave for secure payments via cards, bank transfers, and mobile money. All payments are processed securely and instantly.",
    },
    {
      id: "deposit-time",
      title: "How long do deposits take?",
      content: "Card payments are instant. Bank transfers may take a few minutes to process. Once confirmed, your funds will be added to your account immediately.",
    },
    {
      id: "failed-payments",
      title: "What if my payment fails?",
      content: "Check your payment details and try again. If issues persist, contact support with your transaction reference. Funds from failed transactions are typically refunded within 24 hours.",
    },
  ]

  // Fetch user data and transaction history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetchingData(true)
      const [userResponse, historyResponse, siteSettings] = await Promise.all([
          fetchUserData(), 
          paymentHistory(),
          getSiteSettings(),
        ])
        
        setUser(userResponse.data)
        setTransactionHistory(historyResponse.data || [])

        setWhatsappNumber(siteSettings?.whatsapp_number || "")
        setOpayDetails({
          accountName: siteSettings?.opay_account_name || "",
          accountNumber: siteSettings?.opay_account_number || "",
          bankName: siteSettings?.opay_bank_name || "OPay",
        })
        setKorrapayDetails({
          accountName: siteSettings?.korrapay_account_name || "",
          accountNumber: siteSettings?.korrapay_account_number || "",
          bankName: siteSettings?.korrapay_bank_name || "KorraPay",
        })
        setCryptoDetails({
          walletAddress: siteSettings?.crypto_wallet_address || "",
          network: siteSettings?.crypto_network || "",
          currency: siteSettings?.crypto_currency || "",
        })
        setEnabledMethods({
          flutterwave: (siteSettings?.payment_flutterwave_enabled ?? "1") === "1",
          kora: (siteSettings?.payment_kora_enabled ?? "1") === "1",
          opay: (siteSettings?.payment_opay_enabled ?? "1") === "1",
          korrapay: (siteSettings?.payment_korrapay_enabled ?? "1") === "1",
          crypto: (siteSettings?.payment_crypto_enabled ?? "1") === "1",
        })
        
        // Set user's currency if available
        if (userResponse.data?.currency) {
          const userCurrency = currencies.find(c => c.code === userResponse.data.currency)
          if (userCurrency) {
            setSelectedCurrency(userCurrency)
          }
        }
      } catch (err) {
        toast.error("Failed to fetch data. Please refresh the page.")
      } finally {
        setIsFetchingData(false)
      }
    }
    fetchData()
  }, [])

  // Auto-switch to first visible method if the selected one gets disabled
  useEffect(() => {
    const visible = paymentMethods.filter(m => enabledMethods[m.id])
    if (visible.length > 0 && !visible.find(m => m.id === selectedMethod)) {
      setSelectedMethod(visible[0].id)
    }
  }, [enabledMethods])

  const buildWhatsAppLink = (method = 'opay') => {
    const username = user?.username || user?.name || 'unknown'
    if (method === 'crypto') {
      const coin = cryptoDetails.currency || 'crypto'
      const network = cryptoDetails.network ? ` (${cryptoDetails.network})` : ''
      const amountText = amount ? `$${Number(amount).toFixed(2)}` : '[amount]'
      const msg = `Hi, I just sent ${amountText} worth of ${coin}${network} to your wallet. Please credit my account.\nUsername: ${username}`
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
    }
    if (method === 'korrapay') {
      const amountText = amount && Number(amount) >= 500 ? formatCurrency(amount, 'NGN') : '[amount]'
      const msg = `Hi, I just made a KorraPay payment of ${amountText} to ${korrapayDetails.accountNumber} (${korrapayDetails.accountName}). Please credit my account.\nUsername: ${username}`
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
    }
    // default opay
    const amountText = amount && Number(amount) >= 500 ? formatCurrency(amount, 'NGN') : '[amount]'
    const msg = `Hi, I just made an OPay payment of ${amountText} to ${opayDetails.accountNumber} (${opayDetails.accountName}). Please credit my account.\nUsername: ${username}`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
  }

  const handlePayment = async () => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount")
      return
    }

    const numericAmount = Number(amount)
    if (numericAmount < currentMethod?.minAmount) {
      toast.error(`Minimum amount is ${currentMethod?.minAmount} ${selectedCurrency.code}`)
      return
    }

    setIsLoading(true)

    try {
      const paymentData = {
        amount: numericAmount,
        payment_method: selectedMethod,
      }

      const response = await initiatePayment(paymentData)
      
      if (response.success && response.payment_url) {
        // Simply redirect to payment URL - no localStorage needed
        window.location.href = response.payment_url
      } else {
        throw new Error(response.message || 'Payment gateway error')
      }
    } catch (error) {
      console.error('Payment error:', {
        error: error,
        response: error.response,
        message: error.message
      })
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Payment initiation failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "transparent" }}>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="w-full p-4 space-y-6">
          {/* Tab Navigation */}
          <div className="flex rounded-full p-1" style={{ backgroundColor: CSS_COLORS.background.muted }}>
            <button
              onClick={() => setActiveTab("add-funds")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full font-medium transition-all ${
                activeTab === "add-funds" ? "text-white shadow-lg" : "text-gray-600"
              }`}
              style={{
                backgroundColor: activeTab === "add-funds" ? CSS_COLORS.primary : "transparent",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full font-medium transition-all ${
                activeTab === "history" ? "text-white shadow-lg" : "text-gray-600"
              }`}
              style={{
                backgroundColor: activeTab === "history" ? CSS_COLORS.primary : "transparent",
              }}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>

          {activeTab === "add-funds" ? (
            <>
              {/* Deposit Form */}
              <div
                className="rounded-2xl p-6 shadow-sm border border-white/50 backdrop-blur-sm"
                style={{ backgroundColor: CSS_COLORS.background.card }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Deposit Funds</h2>

                <div className="space-y-4">
                  {/* Currency Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                    <div className="relative">
                      <select
                        value={selectedCurrency.code}
                        onChange={(e) => {
                          const currency = currencies.find(c => c.code === e.target.value)
                          setSelectedCurrency(currency || selectedCurrency)
                        }}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                        style={{ backgroundColor: CSS_COLORS.background.muted }}
                        disabled={isLoading}
                      >
                        {supportedCurrencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                    <div className="space-y-2">
                      {visibleMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => { setSelectedMethod(method.id) }}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                            selectedMethod === method.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <span className="mt-0.5 flex-shrink-0">{method.icon}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{method.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{method.description}</p>
                          </div>
                          {selectedMethod === method.id && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={`Enter amount (min ${currentMethod?.minAmount} ${selectedCurrency.code})`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        style={{ backgroundColor: CSS_COLORS.background.muted }}
                        disabled={isLoading}
                        min={currentMethod?.minAmount}
                        step="any"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {selectedCurrency.symbol}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Minimum: {formatCurrency(currentMethod?.minAmount, selectedCurrency.code)}
                    </p>
                  </div>

                  {/* OPay Manual Section */}
                  {selectedMethod === 'opay' && (
                    <>
                      {/* Account Details */}
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-3">Transfer to this account</p>
                        {[
                          ['Bank', opayDetails.bankName],
                          ['Account Name', opayDetails.accountName],
                          ['Account Number', opayDetails.accountNumber],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                            <span className="text-xs text-green-700 font-medium">{label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-gray-800">{value}</span>
                              {label === 'Account Number' && (
                                <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }} className="text-green-600 hover:text-green-800">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {amount && Number(amount) >= 500 && (
                          <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                            <span className="text-xs text-green-700 font-medium">Transfer Amount</span>
                            <span className="text-base font-bold text-green-800">{formatCurrency(amount, 'NGN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Steps */}
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                        {[
                          'Transfer the exact amount to the OPay account above.',
                          'Take a screenshot of your payment confirmation.',
                          'Tap the WhatsApp button below and send your screenshot to the admin.',
                          'Your balance will be credited within 5–15 minutes.',
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                            <p className="text-xs text-gray-600 leading-snug">{step}</p>
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp Button */}
                      <a
                        href={buildWhatsAppLink('opay')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: '#25d366' }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Send Payment Proof on WhatsApp
                      </a>
                    </>
                  )}

                  {/* KorraPay Manual Section */}
                  {selectedMethod === 'korrapay' && (
                    <>
                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">Transfer to this account</p>
                        {[
                          ['Bank', korrapayDetails.bankName],
                          ['Account Name', korrapayDetails.accountName],
                          ['Account Number', korrapayDetails.accountNumber],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-purple-100 last:border-0">
                            <span className="text-xs text-purple-700 font-medium">{label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-gray-800">{value}</span>
                              {label === 'Account Number' && (
                                <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }} className="text-purple-600 hover:text-purple-800">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {amount && Number(amount) >= 500 && (
                          <div className="mt-3 pt-3 border-t border-purple-200 flex items-center justify-between">
                            <span className="text-xs text-purple-700 font-medium">Transfer Amount</span>
                            <span className="text-base font-bold text-purple-800">{formatCurrency(amount, 'NGN')}</span>
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                        {[
                          'Transfer the exact amount to the KorraPay account above.',
                          'Take a screenshot of your payment confirmation.',
                          'Tap the WhatsApp button below and send your screenshot to the admin.',
                          'Your balance will be credited within 5–15 minutes.',
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                            <p className="text-xs text-gray-600 leading-snug">{step}</p>
                          </div>
                        ))}
                      </div>
                      <a
                        href={buildWhatsAppLink('korrapay')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: '#25d366' }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Send Payment Proof on WhatsApp
                      </a>
                    </>
                  )}

                  {/* Crypto Manual Section */}
                  {selectedMethod === 'crypto' && (
                    <>
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-700 mb-3">Send crypto to this wallet</p>
                        {[
                          ['Coin / Token', `${cryptoDetails.currency}${cryptoDetails.network ? ` (${cryptoDetails.network})` : ''}`],
                          ['Wallet Address', cryptoDetails.walletAddress],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between py-2 border-b border-orange-100 last:border-0">
                            <span className="text-xs text-orange-700 font-medium flex-shrink-0 mt-0.5">{label}</span>
                            <div className="flex items-center gap-1.5 ml-4">
                              <span className="text-sm font-bold text-gray-800 break-all text-right font-mono">{value}</span>
                              {label === 'Wallet Address' && (
                                <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }} className="text-orange-600 hover:text-orange-800 flex-shrink-0">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                        {[
                          `Send the equivalent amount in ${cryptoDetails.currency || 'crypto'} to the wallet address above.`,
                          'Take a screenshot of your transaction confirmation.',
                          'Tap the WhatsApp button below and send your screenshot to the admin.',
                          'Your balance will be credited after blockchain confirmation.',
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-400 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                            <p className="text-xs text-gray-600 leading-snug">{step}</p>
                          </div>
                        ))}
                      </div>
                      <a
                        href={buildWhatsAppLink('crypto')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: '#25d366' }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Send Payment Proof on WhatsApp
                      </a>
                    </>
                  )}

                  {/* Flutterwave Pay Button */}
                  {selectedMethod === 'flutterwave' && (
                  <button
                    onClick={handlePayment}
                    disabled={!amount || Number(amount) < currentMethod?.minAmount || isLoading}
                    className="w-full flex items-center justify-center text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: CSS_COLORS.primary }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${amount ? formatCurrency(amount, selectedCurrency.code) : ''}`
                    )}
                  </button>
                  )}
                </div>
              </div>

              {/* FAQ Section */}
              <div
                className="rounded-2xl p-6 shadow-sm border border-white/50 backdrop-blur-sm"
                style={{ backgroundColor: CSS_COLORS.background.card }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Deposit Help</h3>

                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{item.title}</span>
                        <Plus
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedFaq === item.id ? "rotate-45" : ""
                          }`}
                        />
                      </button>
                      {expandedFaq === item.id && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600">{item.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Transaction History */
            <div
              className="rounded-2xl p-6 shadow-sm border border-white/50 backdrop-blur-sm"
              style={{ backgroundColor: CSS_COLORS.background.card }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>

              <div className="space-y-3">
                {isFetchingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : transactionHistory.length > 0 ? (
                  transactionHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {tx.transaction_id}
                        </p>
                        <p className="font-medium text-gray-800 capitalize">
                          {tx.transaction_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(tx.created_at)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tx.description || 'No description'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold" style={{ color: CSS_COLORS.primary }}>
                          {formatCurrency(tx.amount, tx.currency || 'NGN')}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Fee: {formatCurrency(tx.charge)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="w-full p-4 xl:p-6">
          <div className="flex gap-6">
            {/* Left Column - Deposit Form */}
            <div className="flex-1 max-w-2xl">
              {/* Tab Navigation */}
              <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: CSS_COLORS.background.muted }}>
                <button
                  onClick={() => setActiveTab("add-funds")}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-full font-medium transition-all ${
                    activeTab === "add-funds" ? "text-white shadow-lg" : "text-gray-600"
                  }`}
                  style={{
                    backgroundColor: activeTab === "add-funds" ? CSS_COLORS.primary : "transparent",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Funds</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-full font-medium transition-all ${
                    activeTab === "history" ? "text-white shadow-lg" : "text-gray-600"
                  }`}
                  style={{
                    backgroundColor: activeTab === "history" ? CSS_COLORS.primary : "transparent",
                  }}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
              </div>

              {activeTab === "add-funds" ? (
                /* Deposit Form */
                <div
                  className="rounded-2xl p-8 shadow-sm border border-white/50 backdrop-blur-sm"
                  style={{ backgroundColor: CSS_COLORS.background.card }}
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8">Deposit Funds</h2>

                  <div className="space-y-6">
                    {/* Currency Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                      <div className="relative">
                        <select
                          value={selectedCurrency.code}
                          onChange={(e) => {
                            const currency = currencies.find(c => c.code === e.target.value)
                            setSelectedCurrency(currency || selectedCurrency)
                          }}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none text-base"
                          style={{ backgroundColor: CSS_COLORS.background.muted }}
                          disabled={isLoading}
                        >
                          {supportedCurrencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.name} ({currency.symbol})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                      <div className="space-y-2">
                        {visibleMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => { setSelectedMethod(method.id) }}
                            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                              selectedMethod === method.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <span className="mt-0.5 flex-shrink-0">{method.icon}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 text-sm">{method.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{method.description}</p>
                            </div>
                            {selectedMethod === method.id && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={`Enter amount (min ${currentMethod?.minAmount} ${selectedCurrency.code})`}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-base"
                          style={{ backgroundColor: CSS_COLORS.background.muted }}
                          disabled={isLoading}
                          min={currentMethod?.minAmount}
                          step="any"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {selectedCurrency.symbol}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Minimum: {formatCurrency(currentMethod?.minAmount, selectedCurrency.code)}
                      </p>
                    </div>

                    {/* OPay Manual Section */}
                    {selectedMethod === 'opay' && (
                      <>
                        {/* Account Details */}
                        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-4">Transfer to this account</p>
                          {[
                            ['Bank', opayDetails.bankName],
                            ['Account Name', opayDetails.accountName],
                            ['Account Number', opayDetails.accountNumber],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-green-100 last:border-0">
                              <span className="text-sm text-green-700 font-medium">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">{value}</span>
                                {label === 'Account Number' && (
                                  <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }}
                                    className="text-green-600 hover:text-green-800 transition-colors">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {amount && Number(amount) >= 500 && (
                            <div className="mt-4 pt-3 border-t border-green-200 flex items-center justify-between">
                              <span className="text-sm text-green-700 font-medium">Transfer Amount</span>
                              <span className="text-lg font-bold text-green-800">{formatCurrency(amount, 'NGN')}</span>
                            </div>
                          )}
                        </div>

                        {/* Steps */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3">
                          {[
                            'Transfer the exact amount to the OPay account above.',
                            'Take a screenshot of your payment confirmation.',
                            'Tap the WhatsApp button below and send your screenshot to the admin.',
                            'Your balance will be credited within 5–15 minutes.',
                          ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <p className="text-sm text-gray-600 leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>

                        {/* WhatsApp Button */}
                        <a
                          href={buildWhatsAppLink('opay')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white text-lg"
                          style={{ backgroundColor: '#25d366' }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send Payment Proof on WhatsApp
                        </a>
                      </>
                    )}

                    {/* KorraPay Manual Section */}
                    {selectedMethod === 'korrapay' && (
                      <>
                        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-4">Transfer to this account</p>
                          {[
                            ['Bank', korrapayDetails.bankName],
                            ['Account Name', korrapayDetails.accountName],
                            ['Account Number', korrapayDetails.accountNumber],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-purple-100 last:border-0">
                              <span className="text-sm text-purple-700 font-medium">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">{value}</span>
                                {label === 'Account Number' && (
                                  <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }} className="text-purple-600 hover:text-purple-800 transition-colors">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {amount && Number(amount) >= 500 && (
                            <div className="mt-4 pt-3 border-t border-purple-200 flex items-center justify-between">
                              <span className="text-sm text-purple-700 font-medium">Transfer Amount</span>
                              <span className="text-lg font-bold text-purple-800">{formatCurrency(amount, 'NGN')}</span>
                            </div>
                          )}
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3">
                          {[
                            'Transfer the exact amount to the KorraPay account above.',
                            'Take a screenshot of your payment confirmation.',
                            'Tap the WhatsApp button below and send your screenshot to the admin.',
                            'Your balance will be credited within 5–15 minutes.',
                          ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <p className="text-sm text-gray-600 leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>
                        <a
                          href={buildWhatsAppLink('korrapay')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white text-lg"
                          style={{ backgroundColor: '#25d366' }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send Payment Proof on WhatsApp
                        </a>
                      </>
                    )}

                    {/* Crypto Manual Section */}
                    {selectedMethod === 'crypto' && (
                      <>
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-orange-700 mb-4">Send crypto to this wallet</p>
                          {[
                            ['Coin / Token', `${cryptoDetails.currency}${cryptoDetails.network ? ` (${cryptoDetails.network})` : ''}`],
                            ['Wallet Address', cryptoDetails.walletAddress],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between py-2.5 border-b border-orange-100 last:border-0">
                              <span className="text-sm text-orange-700 font-medium flex-shrink-0 mt-0.5">{label}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-sm font-bold text-gray-800 break-all text-right font-mono">{value}</span>
                                {label === 'Wallet Address' && (
                                  <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }} className="text-orange-600 hover:text-orange-800 transition-colors flex-shrink-0">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3">
                          {[
                            `Send the equivalent amount in ${cryptoDetails.currency || 'crypto'} to the wallet address above.`,
                            'Take a screenshot of your transaction confirmation.',
                            'Tap the WhatsApp button below and send your screenshot to the admin.',
                            'Your balance will be credited after blockchain confirmation.',
                          ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-400 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <p className="text-sm text-gray-600 leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>
                        <a
                          href={buildWhatsAppLink('crypto')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity text-white text-lg"
                          style={{ backgroundColor: '#25d366' }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send Payment Proof on WhatsApp
                        </a>
                      </>
                    )}

                    {/* Flutterwave Pay Button */}
                    {selectedMethod === 'flutterwave' && (
                    <button
                      onClick={handlePayment}
                      disabled={!amount || Number(amount) < currentMethod?.minAmount || isLoading}
                      className="w-full flex items-center justify-center text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      style={{ backgroundColor: CSS_COLORS.primary }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${amount ? formatCurrency(amount, selectedCurrency.code) : ''}`
                      )}
                    </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Transaction History */
                <div
                  className="rounded-2xl p-8 shadow-sm border border-white/50 backdrop-blur-sm"
                  style={{ backgroundColor: CSS_COLORS.background.card }}
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Transaction History</h3>

                  <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full">
                      <thead style={{ backgroundColor: CSS_COLORS.background.muted }}>
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Transaction ID</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-700">Charge</th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isFetchingData ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : transactionHistory.length > 0 ? (
                          transactionHistory.map((tx) => (
                            <tr
                              key={tx.id}
                              className="border-t border-gray-200 hover:bg-gray-50"
                            >
                              <td className="py-4 px-6 font-medium text-gray-800 capitalize">
                                {tx.transaction_id}
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-800 capitalize">
                                {tx.transaction_type}
                              </td>
                              <td className="py-4 px-6 text-gray-600">
                                {formatDate(tx.created_at)}
                              </td>
                              <td className="py-4 px-6 text-right font-semibold" style={{ color: CSS_COLORS.primary }}>
                                {formatCurrency(tx.amount, tx.currency || 'NGN')}
                              </td>
                              <td className="py-4 px-6 text-right text-gray-600">
                                {formatCurrency(tx.charge)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-12">
                              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No transactions found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - FAQ */}
            <div className="w-96">
              <div
                className="rounded-2xl p-6 shadow-sm border border-white/50 backdrop-blur-sm sticky top-24"
                style={{ backgroundColor: CSS_COLORS.background.card }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Deposit Information</h3>

                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800 text-sm">{item.title}</span>
                        <Plus
                          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                            expandedFaq === item.id ? "rotate-45" : ""
                          }`}
                        />
                      </button>
                      {expandedFaq === item.id && (
                        <div className="px-4 pb-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mt-3">{item.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddFunds