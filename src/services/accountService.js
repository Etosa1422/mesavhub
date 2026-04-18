import api from "./api";
import { toast } from "react-toastify";

// Fetch account & notifications
export const fetchAccountData = async (setFormData, setNotifications, setError, setIsLoading, formData) => {
  try {
    setIsLoading(true);
    const [accountRes, notificationsRes] = await Promise.all([
      api.get('/account'),
      api.get('/account/notifications')
    ]);

    if (accountRes.data.success && notificationsRes.data.success) {
      setFormData({
        ...formData,
        username: accountRes.data.data.username,
        email: accountRes.data.data.email,
        language: accountRes.data.data.language || "en",
        timezone: accountRes.data.data.timezone || "utc+1",
        twoFactorEnabled: accountRes.data.data.two_factor_enabled || false,
        apiKey: accountRes.data.data.api_key || ""
      });
      setNotifications(notificationsRes.data.data);
      setError(null);
    } else {
      throw new Error(accountRes.data.message || notificationsRes.data.message || 'Failed to fetch account data');
    }
  } catch (err) {
    console.error("Account data fetch error:", err);
    setError(err.response?.data?.message || err.message || 'Failed to load account data');
    toast.error(err.response?.data?.message || err.message || 'Failed to load account data');
  } finally {
    setIsLoading(false);
  }
};

export const copyApiKey = async (apiKey, setApiKeyCopied) => {
  try {
    await navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setApiKeyCopied(false), 2000);
  } catch (err) {
    console.error("Failed to copy API key:", err);
    toast.error("Failed to copy API key");
  }
};

export const changePassword = async (formData, setFormData, setIsChangingPassword) => {
  try {
    setIsChangingPassword(true);
    const response = await api.put('/account/password', {
      current_password: formData.currentPassword,
      new_password: formData.newPassword,
      new_password_confirmation: formData.confirmPassword
    });

    if (response.data.success) {
      toast.success(response.data.message);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } else {
      throw new Error(response.data.message || 'Password change failed');
    }
  } catch (err) {
    console.error("Password change error:", err);
    toast.error(err.response?.data?.message || err.message || 'Password change failed');

    if (err.response?.status === 422) {
      const errors = err.response.data.errors;
      toast.error(Object.values(errors).join('\n'));
    }
  } finally {
    setIsChangingPassword(false);
  }
};

export const changeEmail = async (formData, setFormData, setIsChangingEmail) => {
  try {
    setIsChangingEmail(true);
    const response = await api.put('/account/email', {
      email: formData.newEmail
    });

    if (response.data.success) {
      toast.success(response.data.message);
      setFormData(prev => ({
        ...prev,
        email: prev.newEmail,
        newEmail: ""
      }));
    } else {
      throw new Error(response.data.message || 'Email change failed');
    }
  } catch (err) {
    console.error("Email change error:", err);
    toast.error(err.response?.data?.message || err.message || 'Email change failed');

    if (err.response?.status === 422) {
      const errors = err.response.data.errors;
      toast.error(Object.values(errors).join('\n'));
    }
  } finally {
    setIsChangingEmail(false);
  }
};

export const changeUsername = async (newUsername) => {
  try {
    const response = await fetch('/api/account/username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change username');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const toggleTwoFactor = async (enabled, setFormData) => {
  try {
    const response = await api.put('/account/two-factor', {
      enabled: !enabled
    });

    if (response.data.success) {
      toast.success(response.data.message);
      setFormData(prev => ({
        ...prev,
        twoFactorEnabled: !enabled
      }));
    } else {
      throw new Error(response.data.message || 'Two factor update failed');
    }
  } catch (err) {
    console.error("Two factor error:", err);
    toast.error(err.response?.data?.message || err.message || 'Two factor update failed');
  }
};

export const generateNewApiKey = async (setFormData, setIsGeneratingApiKey) => {
  try {
    setIsGeneratingApiKey(true);
    const response = await api.post('/account/api-key');

    if (response.data.success) {
      toast.success(response.data.message);
      setFormData(prev => ({
        ...prev,
        apiKey: response.data.api_key
      }));
    } else {
      throw new Error(response.data.message || 'API key generation failed');
    }
  } catch (err) {
    console.error("API key error:", err);
    toast.error(err.response?.data?.message || err.message || 'API key generation failed');
  } finally {
    setIsGeneratingApiKey(false);
  }
};

export const savePreferences = async (type, formData, notifications) => {
  try {
    let response;

    if (type === 'language') {
      response = await api.put('/account/preferences', {
        language: formData.language
      });
    } else if (type === 'timezone') {
      response = await api.put('/account/preferences', {
        timezone: formData.timezone
      });
    } else if (type === 'notifications') {
      response = await api.put('/account/notifications', notifications);
    }

    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      throw new Error(response.data.message || 'Preferences update failed');
    }
  } catch (err) {
    console.error("Preferences error:", err);
    toast.error(err.response?.data?.message || err.message || 'Preferences update failed');

    if (err.response?.status === 422) {
      const errors = err.response.data.errors;
      toast.error(Object.values(errors).join('\n'));
    }
  }
};
