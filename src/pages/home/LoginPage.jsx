import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import { loginSchema } from "../../utils/validation";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const APP_URL = import.meta.env.VITE_APP_BASE_URL;

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate({ login, password }, { abortEarly: false });
      setIsLoading(true);
      const response = await axios.post(`${APP_URL}/login`, { login: login.trim(), password });
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      if (err.name === "ValidationError") {
        toast.error(err.inner[0].message);
      } else if (err.response) {
        const errorData = err.response.data;
        const errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join(" ") : "Login failed");
        toast.error(errorMsg);
      } else {
        toast.error(err.message || "Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen flex items-center px-6 py-20">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-brand-900/30 shadow-lg dark:shadow-none">

          {/* Left panel */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-900/50 dark:to-brand-950/60 p-10 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Welcome back</h2>
            <p className="text-brand-100 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Sign in to manage your orders, track deliveries, and access your full Mesavhub dashboard.
            </p>
            <div className="space-y-3">
              {["Instant order tracking", "All-country SMS verifications", "24/7 support access"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 dark:text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - Form */}
          <div className="bg-white dark:bg-[#0f0f1a] p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Sign in</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              New here?{" "}
              <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Create an account
              </Link>
            </p>

            <form onSubmit={loginUser} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Username or email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-brand-600 dark:text-brand-400 text-xs hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
