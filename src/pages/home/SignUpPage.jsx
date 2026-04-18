import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
// import ReCAPTCHA from 'react-google-recaptcha';
import { signupSchema } from '../../utils/validation';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [captchaToken, setCaptchaToken] = useState(null); // ✅ new state for captcha
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const APP_URL = import.meta.env.VITE_APP_BASE_URL;
  // const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY; // ✅ from .env

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      // ✅ Validate form inputs
      await signupSchema.validate(
        { username, email, firstname, lastname, password, confirmPassword },
        { abortEarly: false }
      );

      // ✅ Ensure reCAPTCHA completed
      // if (!captchaToken) {
      //   toast.error("Please complete the reCAPTCHA before submitting.");
      //   return;
      // }

      setIsLoading(true);

      // Send registration data to backend (reCAPTCHA disabled)
      const response = await axios.post(`${APP_URL}/register`, {
        username: username.trim(),
        email: email.trim(),
        first_name: firstname.trim(),
        last_name: lastname.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      if (err.name === "ValidationError") {
        toast.error(err.inner[0].message);
      } else if (err.response) {
        const errorData = err.response.data;
        console.error('Registration error response:', err.response.status, errorData);
        // Show the first validation error, or the message, or the exception, or a fallback
        const errorMsg =
          (errorData.errors ? Object.values(errorData.errors).flat()[0] : null) ||
          errorData.message ||
          errorData.exception ||
          errorData.error ||
          `Registration failed (${err.response.status})`;
        toast.error(errorMsg, { duration: 6000 });
      } else {
        toast.error(err.message || "Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors";
  const inputClassPr = "w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors";

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] py-20 px-6 min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-brand-900/30 shadow-lg dark:shadow-none">

          {/* Left panel */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-900/50 dark:to-brand-950/60 p-10 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-6">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Join Mesavhub today</h2>
            <p className="text-brand-100 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Create your free account and start ordering social media services instantly from anywhere in the world.
            </p>
            <div className="space-y-3">
              {[
                "Instant account activation",
                "100+ services available",
                "Secure & fast checkout",
                "24/7 support access",
              ].map((item) => (
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
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Create account</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Already have an account?{" "}
              <Link to="/" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign in</Link>
            </p>

            <form onSubmit={registerUser} className="space-y-4">

              {/* Username */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className={inputClass}
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className={inputClass}
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassPr}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClassPr}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* ✅ reCAPTCHA */}
              {/* <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div> */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : "Create Account"}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SignUpPage;
