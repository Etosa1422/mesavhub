"use client"

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPayment } from "../../services/userService";
import toast from "react-hot-toast";

const TransactionCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const status = searchParams.get("status");
        const txRef = searchParams.get("tx_ref");
        const transactionId = searchParams.get("transaction_id");

        console.log("Payment callback received:", { status, txRef, transactionId });

        // Handle all statuses in a case-insensitive way
        const normalizedStatus = status ? status.toLowerCase() : '';

        // Handle cancelled payments immediately
        if (normalizedStatus === "cancelled") {
          setStatus("cancelled");
          localStorage.removeItem('pendingTransaction');
          setIsLoading(false);
          return;
        }

        // Handle failed payments
        if (normalizedStatus === "failed") {
          setStatus("failed");
          localStorage.removeItem('pendingTransaction');
          setIsLoading(false);
          return;
        }

        if (!txRef && !transactionId) {
          throw new Error("Missing transaction reference");
        }

        // Handle successful payments (both 'successful' and 'completed')
        if (normalizedStatus === "successful" || normalizedStatus === "completed") {
          const response = await verifyPayment({ 
            transaction_id: txRef,
            status: normalizedStatus
          });
          
          if (!response.success) {
            throw new Error(response.message || "Payment verification failed");
          }

          setTransaction(response.data);
          setStatus("completed");
          localStorage.removeItem('pendingTransaction');
        } else {
          setStatus("unknown");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
        toast.error(error.message || "Payment verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    verifyTransaction();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">We're verifying your transaction, please wait...</p>
        </div>
      </div>
    );
  }

  // Successful payment
  if (status === "completed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your account has been credited.
          </p>
          
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: transaction.currency || 'NGN',
                  }).format(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{transaction.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(transaction.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Return to your Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Cancelled payment
  if (status === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <XCircle className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            You cancelled the payment process. No funds were deducted from your account.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/dashboard/add-funds")}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed payment
  if (status === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">
            Your payment was not completed. Please try again.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/dashboard/add-funds")}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error or unknown status
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <XCircle className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Status Unknown</h2>
        <p className="text-gray-600 mb-6">
          We couldn't determine the status of your payment. Please check your transaction history or contact support.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/dashboard/support")}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Contact Support
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCallback;