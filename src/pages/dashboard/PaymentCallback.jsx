"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { verifyPayment } from "../../services/userService"
import { CSS_COLORS } from "../../components/constant/colors"

const PaymentCallback = () => {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your payment...')
  const [debugInfo, setDebugInfo] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const transactionId = searchParams.get('transaction_id')
        const txRef = searchParams.get('tx_ref')
        // Korapay sends back `reference` as the param name
        const koraRef = searchParams.get('reference')
        const statusParam = searchParams.get('status')

        console.log('Payment Callback - URL Parameters:', {
          transactionId,
          txRef,
          koraRef,
          statusParam,
          allParams: Object.fromEntries(searchParams.entries())
        })

        setDebugInfo(`Transaction ID: ${transactionId}, TX_REF: ${txRef}, Reference: ${koraRef}, Status: ${statusParam}`)

        if (!transactionId && !txRef && !koraRef) {
          throw new Error('No transaction reference found in URL parameters')
        }

        // Prefer Flutterwave's transaction_id, then tx_ref, then Korapay reference
        const reference = transactionId || txRef || koraRef

        console.log('Verifying payment with reference:', reference)

        // Normalise status: Korapay uses 'success', Flutterwave uses 'successful'
        const normalizedStatus = statusParam === 'success' ? 'success' : (statusParam || 'successful')

        const response = await verifyPayment({
          transaction_id: reference,
          status: normalizedStatus,
        })

        console.log('? Verification response:', response)

        if (response.success) {
          setStatus('success')
          setMessage('Payment completed successfully!')
          toast.success('Payment completed successfully!')
          
          setTimeout(() => {
            navigate('/add-funds')
          }, 3000)
        } else {
          throw new Error(response.message || 'Payment verification failed')
        }
      } catch (error) {
        console.error('? Payment verification error:', error)
        setStatus('error')
        const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed'
        setMessage(errorMessage)
        toast.error(errorMessage)
        
        // Show detailed error for debugging
        setDebugInfo(prev => prev + ` | Error: ${errorMessage}`)
      }
    }

    verifyTransaction()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl p-8 shadow-lg border border-white/50 backdrop-blur-sm text-center"
        style={{ backgroundColor: CSS_COLORS.background.card }}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: CSS_COLORS.primary }} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
            {debugInfo && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 break-all">{debugInfo}</p>
              </div>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">Redirecting you back to wallet...</p>
            <button
              onClick={() => navigate('/add-funds')}
              className="w-full py-3 px-4 rounded-full text-white font-semibold"
              style={{ backgroundColor: CSS_COLORS.primary }}
            >
              Go to Wallet Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {debugInfo && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-700 break-all">{debugInfo}</p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/add-funds')}
                className="w-full py-3 px-4 rounded-full text-white font-semibold"
                style={{ backgroundColor: CSS_COLORS.primary }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.open('mailto:support@mesavhub.com', '_blank')}
                className="w-full py-3 px-4 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Contact Support
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback