"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Activity,
  Check,
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Palette,
  CreditCard,
} from "lucide-react";
import {
  getAdminSettings,
  updateAdminProfile,
  updateAdminSecurity,
  getAdminActivityLogs,
  getSiteSettings,
  updateSiteSettings,
} from "../../services/adminService"; 

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Global states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    type: "",
  });

  // Security state
  const [security, setSecurity] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Activity logs
  const [activities, setActivities] = useState([]);

  // Appearance
  const [fontFamily, setFontFamily] = useState('Fredoka');
  const [savingAppearance, setSavingAppearance] = useState(false);

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    whatsapp_number: "",
    opay_account_name: "",
    opay_account_number: "",
    opay_bank_name: "OPay",
    korrapay_account_name: "",
    korrapay_account_number: "",
    korrapay_bank_name: "KorraPay",
    crypto_wallet_address: "",
    crypto_network: "",
    crypto_currency: "",
    payment_flutterwave_enabled: "1",
    payment_opay_enabled: "1",
    payment_korrapay_enabled: "1",
    payment_crypto_enabled: "1",
  });
  const [savingPayment, setSavingPayment] = useState(false);


  const FONTS = [
    { value: 'Fredoka',     label: 'Fredoka',      sample: 'Rounded & friendly' },
    { value: 'Poppins',     label: 'Poppins',      sample: 'Clean & modern' },
    { value: 'Nunito Sans', label: 'Nunito Sans',  sample: 'Soft & readable' },
    { value: 'Roboto Slab', label: 'Roboto Slab',  sample: 'Strong & bold' },
    { value: 'Sahitya',     label: 'Sahitya',      sample: 'Elegant & classic' },
  ];

  // Load profile + security info on mount
  useEffect(() => {
    loadProfileSettings();
    getSiteSettings().then(s => {
      if (s?.font_family) setFontFamily(s.font_family);
      const loaded = {
        whatsapp_number: s?.whatsapp_number || "",
        opay_account_name: s?.opay_account_name || "",
        opay_account_number: s?.opay_account_number || "",
        opay_bank_name: s?.opay_bank_name || "OPay",
        korrapay_account_name: s?.korrapay_account_name || "",
        korrapay_account_number: s?.korrapay_account_number || "",
        korrapay_bank_name: s?.korrapay_bank_name || "KorraPay",
        crypto_wallet_address: s?.crypto_wallet_address || "",
        crypto_network: s?.crypto_network || "",
        crypto_currency: s?.crypto_currency || "",
        payment_flutterwave_enabled: s?.payment_flutterwave_enabled ?? "1",
        payment_opay_enabled: s?.payment_opay_enabled ?? "1",
        payment_korrapay_enabled: s?.payment_korrapay_enabled ?? "1",
        payment_crypto_enabled: s?.payment_crypto_enabled ?? "1",
      };
      setPaymentSettings(loaded);

      // Seed toggle defaults to DB if keys were never saved before
      const needsSeed = [
        'payment_flutterwave_enabled','payment_opay_enabled',
        'payment_korrapay_enabled','payment_crypto_enabled',
      ].some(k => s?.[k] === undefined || s?.[k] === null);
      if (needsSeed) {
        updateSiteSettings({
          payment_flutterwave_enabled: loaded.payment_flutterwave_enabled,
          payment_opay_enabled: loaded.payment_opay_enabled,
          payment_korrapay_enabled: loaded.payment_korrapay_enabled,
          payment_crypto_enabled: loaded.payment_crypto_enabled,
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  // Load profile and basic info
  const loadProfileSettings = async () => {
    try {
      setLoadingProfile(true);
      const data = await getAdminSettings();
      setProfile({
        name: data.profile.name,
        email: data.profile.email,
        type: data.profile.type,
      });
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load activity logs
  const loadActivityLogs = async () => {
    try {
      setLoadingActivity(true);
      const data = await getAdminActivityLogs();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setSavingAppearance(true);
      await updateSiteSettings({ font_family: fontFamily });
      document.body.style.fontFamily = `'${fontFamily}', sans-serif`;
      setSuccess('Appearance saved. Font will apply to all users on next page load.');
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save appearance');
    } finally {
      setSavingAppearance(false);
    }
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingPayment(true);
      await updateSiteSettings(paymentSettings);
      setSuccess('Payment settings saved.');
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save payment settings');
    } finally {
      setSavingPayment(false);
    }
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);

    if (tab === "activity") {
      loadActivityLogs();
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      await updateAdminProfile(profile);
      setSuccess("Profile updated successfully.");
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle security update
  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoadingSecurity(true);
      await updateAdminSecurity(security);
      setSuccess("Password updated successfully.");
      setSecurity({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoadingSecurity(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === "profile") {
      setProfile((prev) => ({ ...prev, [name]: value }));
    } else {
      setSecurity((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Settings
        </h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1.5 hover:bg-red-100 rounded-lg"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto p-1.5 hover:bg-green-100 rounded-lg"
              >
                <X className="h-4 w-4 text-green-500" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-none">
          <button
            onClick={() => handleTabChange("profile")}
            className={`py-4 px-5 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
              activeTab === "profile"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => handleTabChange("security")}
            className={`py-4 px-5 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
              activeTab === "security"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => handleTabChange("activity")}
            className={`py-4 px-5 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
              activeTab === "activity"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Logs
          </button>
          <button
            onClick={() => handleTabChange("appearance")}
            className={`py-4 px-5 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
              activeTab === "appearance"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </button>
          <button
            onClick={() => handleTabChange("payment")}
            className={`py-4 px-5 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 ${
              activeTab === "payment"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Settings
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Admin Type
                  </label>
                  <input
                    type="text"
                    value={profile.type}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  {loadingProfile && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Security Settings
            </h2>
            <form onSubmit={handleSecurityUpdate}>
              <div className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={security.current_password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={security.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={security.password_confirmation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loadingSecurity}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  {loadingSecurity && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === "activity" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Activity Logs
            </h2>
            {loadingActivity ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {activity.ip_address}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No activity logs found</p>
              </div>
            )}
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Appearance</h2>
            <p className="text-sm text-gray-500 mb-6">Choose the font used across the entire site for all users.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {FONTS.map(font => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    fontFamily === font.value
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <p className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: `'${font.value}', sans-serif` }}>
                    {font.label}
                  </p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: `'${font.value}', sans-serif` }}>
                    {font.sample} — Aa Bb Cc 123
                  </p>
                  {fontFamily === font.value && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleSaveAppearance}
              disabled={savingAppearance}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {savingAppearance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Font
            </button>
          </div>
        )}
        {/* Payment Settings Tab */}
        {activeTab === "payment" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Payment Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Configure manual payment details shown to users on the Add Funds page.</p>
            <form onSubmit={handleSavePaymentSettings}>
              {/* Active Payment Methods */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-1">Active Payment Methods</h3>
                <p className="text-xs text-gray-500 mb-4">Toggle which methods users can see on the Add Funds page.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'payment_flutterwave_enabled', label: 'Flutterwave', desc: 'Card, bank transfer, mobile money' },
                    { key: 'payment_opay_enabled', label: 'OPay (Manual)', desc: 'Manual bank transfer via OPay' },
                    { key: 'payment_korrapay_enabled', label: 'KorraPay (Manual)', desc: 'Manual bank transfer via KorraPay' },
                    { key: 'payment_crypto_enabled', label: 'Crypto (Manual)', desc: 'Crypto wallet payment' },
                  ].map(({ key, label, desc }) => {
                    const isOn = paymentSettings[key] === "1";
                    return (
                      <div key={key} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                        isOn ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentSettings(p => ({ ...p, [key]: isOn ? "0" : "1" }))}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                            isOn ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isOn ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">WhatsApp Contact</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number <span className="text-gray-400 font-normal">(international format, no +)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 2348031234567"
                      value={paymentSettings.whatsapp_number}
                      onChange={e => setPaymentSettings(p => ({ ...p, whatsapp_number: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* OPay */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">OPay Details</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input type="text" placeholder="e.g. Mesa SMM Panel"
                      value={paymentSettings.opay_account_name}
                      onChange={e => setPaymentSettings(p => ({ ...p, opay_account_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" placeholder="e.g. 9012345678"
                      value={paymentSettings.opay_account_number}
                      onChange={e => setPaymentSettings(p => ({ ...p, opay_account_number: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank / Wallet Name</label>
                    <input type="text" placeholder="e.g. OPay"
                      value={paymentSettings.opay_bank_name}
                      onChange={e => setPaymentSettings(p => ({ ...p, opay_bank_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* KorraPay */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">KorraPay Details</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input type="text" placeholder="e.g. Mesa SMM Panel"
                      value={paymentSettings.korrapay_account_name}
                      onChange={e => setPaymentSettings(p => ({ ...p, korrapay_account_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" placeholder="e.g. 9012345678"
                      value={paymentSettings.korrapay_account_number}
                      onChange={e => setPaymentSettings(p => ({ ...p, korrapay_account_number: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank / Wallet Name</label>
                    <input type="text" placeholder="e.g. KorraPay"
                      value={paymentSettings.korrapay_bank_name}
                      onChange={e => setPaymentSettings(p => ({ ...p, korrapay_bank_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* Crypto */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Crypto Details</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                    <input type="text" placeholder="e.g. TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={paymentSettings.crypto_wallet_address}
                      onChange={e => setPaymentSettings(p => ({ ...p, crypto_wallet_address: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coin / Token</label>
                    <input type="text" placeholder="e.g. USDT"
                      value={paymentSettings.crypto_currency}
                      onChange={e => setPaymentSettings(p => ({ ...p, crypto_currency: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                    <input type="text" placeholder="e.g. TRC20"
                      value={paymentSettings.crypto_network}
                      onChange={e => setPaymentSettings(p => ({ ...p, crypto_network: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Payment Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
