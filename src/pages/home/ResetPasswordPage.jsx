import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import axios from "axios";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const APP_URL = import.meta.env.VITE_APP_BASE_URL;

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link.");
      navigate("/forgot-password");
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== passwordConfirmation) { toast.error("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      await axios.post(`${APP_URL}/reset-password`, {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password. The link may have expired.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen flex items-center px-6 py-20">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-200 dark:border-brand-900/30 shadow-lg p-10">

          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center mb-6">
            {done ? <CheckCircle className="w-6 h-6 text-brand-600 dark:text-brand-400" /> : <Lock className="w-6 h-6 text-brand-600 dark:text-brand-400" />}
          </div>

          {!done ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Set new password</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Choose a strong password for <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Password reset!</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="block w-full text-center bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
              >
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
