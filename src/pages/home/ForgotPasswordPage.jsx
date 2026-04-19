import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const APP_URL = import.meta.env.VITE_APP_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email."); return; }
    setIsLoading(true);
    try {
      await axios.post(`${APP_URL}/forgot-password`, { email: email.trim() });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen flex items-center px-6 py-20">
      <div className="max-w-md mx-auto w-full">

        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-200 dark:border-brand-900/30 shadow-lg p-10">

          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>

          {!sent ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Forgot password?</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Enter your account email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Check your inbox</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                If <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span> is registered, you'll receive a password reset link shortly. Check your spam folder too.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-6">The link expires in 60 minutes.</p>
              <button
                onClick={() => setSent(false)}
                className="w-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Try a different email
              </button>
            </>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
