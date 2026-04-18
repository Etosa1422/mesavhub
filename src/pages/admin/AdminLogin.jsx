import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import axios from 'axios';
import Button from "../../components/Button";
import { AdminLoginSchema } from '../../utils/validation';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const APP_URL = import.meta.env.VITE_APP_BASE_URL;

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      // Validate form inputs
      await AdminLoginSchema.validate({ email, password }, { abortEarly: false });
      setIsLoading(true);

      // Login Admin
      const response = await axios.post(`${APP_URL}/admin/login`, {
        email: email.trim(),
        password
      });

      // Store token and user data
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));

      toast.success('Admin login successful!');
      navigate('/admin/dashboard');

    } catch (err) {
      // Handle validation errors
      if (err.name === "ValidationError") {
        toast.error(err.inner[0].message);
      } 
      // Handle API errors
      else if (err.response) {
        const errorData = err.response.data;
        const errorMsg = errorData.message || 
                         (errorData.errors ? Object.values(errorData.errors).flat().join(' ') : 'Login failed');
        toast.error(errorMsg);
      } 
      // Handle network errors
      else {
        toast.error(err.message || "Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to access the control panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          <form onSubmit={loginUser} className="space-y-6">
            {/* Login Field (email) */}
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors hover:bg-gray-100"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete={email}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors hover:bg-gray-100"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="w-4 h-4 text-green-600 bg-gray-50 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                to="/admin/forgot-password" 
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${isLoading ? 'opacity-75 cursor-not-allowed scale-100' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </Button>

            {/* Back to Main Site */}
            <div className="text-center pt-2">
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                ← Back to main login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;