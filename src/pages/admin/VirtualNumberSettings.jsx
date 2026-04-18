import { useState, useEffect } from "react";
import { Check, Loader2, Eye, EyeOff, Phone } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "../../services/adminService";
import toast from "react-hot-toast";

const VirtualNumberSettings = () => {
  const [vnSettings, setVnSettings] = useState({
    sms_activate_api_key: '',
    five_sim_api_key: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_webhook_url: '',
    sms_provider_order: 'smspool,grizzly_sms,onlinesim,five_sim,twilio',
    virtual_number_markup: '1.30',
    usd_to_ngn_rate: '1600',
    twilio_base_price_usd: '1.30',
    smspool_api_key: '',
    grizzly_sms_api_key: '',
    onlinesim_api_key: '',
  });
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => {
      if (!s) return;
      setVnSettings({
        sms_activate_api_key:  s.sms_activate_api_key  ?? '',
        five_sim_api_key:      s.five_sim_api_key      ?? '',
        twilio_account_sid:    s.twilio_account_sid    ?? '',
        twilio_auth_token:     s.twilio_auth_token     ?? '',
        twilio_webhook_url:    s.twilio_webhook_url    ?? '',
        sms_provider_order:    s.sms_provider_order    ?? 'smspool,grizzly_sms,onlinesim,five_sim,twilio',
        virtual_number_markup: s.virtual_number_markup ?? '1.30',
        usd_to_ngn_rate:       s.usd_to_ngn_rate       ?? '1600',
        twilio_base_price_usd:   s.twilio_base_price_usd   ?? '1.30',
        smspool_api_key:      s.smspool_api_key      ?? '',
        grizzly_sms_api_key:  s.grizzly_sms_api_key  ?? '',
        onlinesim_api_key:    s.onlinesim_api_key    ?? '',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSiteSettings(vnSettings);
      toast.success('Virtual number settings saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setVnSettings(p => ({ ...p, [key]: value }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Virtual Number Settings</h1>
          <p className="text-sm text-gray-500">Configure SMS provider API keys and pricing</p>
        </div>
      </div>

      {/* Provider order */}
      <div className="bg-white shadow-sm rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">General</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider Priority Order</label>
          <input
            type="text"
            value={vnSettings.sms_provider_order}
            onChange={e => set('sms_provider_order', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="smspool,grizzly_sms,five_sim,twilio"
          />
          <p className="text-xs text-gray-400 mt-1">
            Comma-separated slugs: <code>smspool</code>, <code>grizzly_sms</code>, <code>onlinesim</code>, <code>five_sim</code>, <code>twilio</code>. First is tried first; others are fallback.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Markup Multiplier</label>
          <input
            type="number"
            step="0.01"
            min="1"
            max="10"
            value={vnSettings.virtual_number_markup}
            onChange={e => set('virtual_number_markup', e.target.value)}
            className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">e.g. 1.30 = 30% above provider cost</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">USD → NGN Exchange Rate</label>
          <input
            type="number"
            step="1"
            min="1"
            value={vnSettings.usd_to_ngn_rate}
            onChange={e => set('usd_to_ngn_rate', e.target.value)}
            className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Current market rate for converting provider USD prices to ₦ Naira (e.g. 1600)</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white shadow-sm rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">API Keys</h2>
          <button
            type="button"
            onClick={() => setShowSecrets(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showSecrets ? 'Hide keys' : 'Show keys'}
          </button>
        </div>

        {/* SMSPool */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded">SMSPool</span>
            <a href="https://smspool.net" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">smspool.net →</a>
            <span className="text-xs text-gray-400">Recommended</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={vnSettings.smspool_api_key}
              onChange={e => set('smspool_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your SMSPool API key"
            />
          </div>
        </div>

        {/* GrizzlySMS */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-orange-100 text-orange-700 px-2 py-0.5 rounded">GrizzlySMS</span>
            <a href="https://grizzlysms.com" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">grizzlysms.com →</a>
            <span className="text-xs text-gray-400">Recommended</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={vnSettings.grizzly_sms_api_key}
              onChange={e => set('grizzly_sms_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your GrizzlySMS API key"
            />
          </div>
        </div>

        {/* OnlineSim */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">OnlineSim</span>
            <a href="https://onlinesim.io" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">onlinesim.io →</a>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={vnSettings.onlinesim_api_key}
              onChange={e => set('onlinesim_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your OnlineSim API key"
            />
          </div>
        </div>

        {/* SMS Activate (closed) */}
        <div className="border border-red-100 rounded-xl p-4 space-y-3 opacity-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded">SMS Activate</span>
            <span className="text-xs text-red-500 font-semibold">⚠ Permanently shut down December 22, 2025</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={vnSettings.sms_activate_api_key}
              onChange={e => set('sms_activate_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="N/A — service closed"
              disabled
            />
          </div>
        </div>

        {/* 5sim */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded">5sim</span>
            <a href="https://5sim.net" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">5sim.net →</a>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={vnSettings.five_sim_api_key}
              onChange={e => set('five_sim_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your 5sim API key"
            />
          </div>
        </div>

        {/* Twilio */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-red-100 text-red-700 px-2 py-0.5 rounded">Twilio</span>
            <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">console.twilio.com →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account SID</label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={vnSettings.twilio_account_sid}
                onChange={e => set('twilio_account_sid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ACxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Auth Token</label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={vnSettings.twilio_auth_token}
                onChange={e => set('twilio_auth_token', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Auth token"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Webhook URL</label>
            <input
              type="url"
              value={vnSettings.twilio_webhook_url}
              onChange={e => set('twilio_webhook_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://yourdomain.com/api/virtual-numbers/webhook"
            />
            <p className="text-xs text-gray-400 mt-1">Set this URL in your Twilio phone number's SMS webhook settings</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={vnSettings.twilio_base_price_usd}
              onChange={e => set('twilio_base_price_usd', e.target.value)}
              className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Twilio's per-number cost in USD (e.g. 1.30). Auto-converted to NGN using live exchange rate.</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  );
};

export default VirtualNumberSettings;
