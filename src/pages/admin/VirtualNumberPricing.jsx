import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, X, Save, Phone } from 'lucide-react';
import {
  getVirtualNumberPrices,
  createVirtualNumberPrice,
  updateVirtualNumberPrice,
  deleteVirtualNumberPrice,
} from '../../services/virtualNumberPricingService';

// ── helpers ───────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  service: '',
  country_code: '',
  fixed_price: '',
  markup: '',
  note: '',
};

function ruleDescription(rule) {
  const svc = rule.service ?? '(all services)';
  const cc  = rule.country_code ?? '(all countries)';
  return `${svc} / ${cc}`;
}

function pricingDisplay(rule) {
  if (rule.fixed_price != null) return `₦${Number(rule.fixed_price).toFixed(2)} fixed`;
  if (rule.markup  != null) return `×${Number(rule.markup).toFixed(4)} profit`;
  return '—';
}

// ── component ─────────────────────────────────────────────────────────────────

export default function VirtualNumberPricing() {
  const [rules, setRules]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule]   = useState(null);   // null = creating new
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // ── data ──────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    try {
      const data = await getVirtualNumberPrices();
      setRules(data ?? []);
    } catch {
      toast.error('Failed to load pricing rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── modal helpers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditRule(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditRule(rule);
    setForm({
      service:      rule.service      ?? '',
      country_code: rule.country_code ?? '',
      fixed_price:  rule.fixed_price  != null ? String(rule.fixed_price) : '',
      markup:       rule.markup       != null ? String(rule.markup)       : '',
      note:         rule.note         ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditRule(null); };

  // ── submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      service:      form.service.trim()      || null,
      country_code: form.country_code.trim().toUpperCase() || null,
      fixed_price:  form.fixed_price !== '' ? parseFloat(form.fixed_price) : null,
      markup:       form.markup      !== '' ? parseFloat(form.markup)      : null,
      note:         form.note.trim()         || null,
    };

    // Must have at least one price control
    if (payload.fixed_price == null && payload.markup == null) {
      toast.error('Enter a fixed price or a markup multiplier.');
      setSaving(false);
      return;
    }

    try {
      if (editRule) {
        const updated = await updateVirtualNumberPrice(editRule.id, {
          fixed_price: payload.fixed_price,
          markup:      payload.markup,
          note:        payload.note,
        });
        setRules(prev => prev.map(r => (r.id === updated.id ? updated : r)));
        toast.success('Rule updated.');
      } else {
        const created = await createVirtualNumberPrice(payload);
        setRules(prev => [...prev, created]);
        toast.success('Rule created.');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (rule) => {
    if (!window.confirm(`Delete rule for "${ruleDescription(rule)}"?`)) return;
    try {
      await deleteVirtualNumberPrice(rule.id);
      setRules(prev => prev.filter(r => r.id !== rule.id));
      toast.success('Rule deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Virtual Number Pricing</h1>
            <p className="text-sm text-gray-500">
              Override per-service / per-country prices in <strong>₦ Naira</strong>. Provider USD prices are auto-converted
              using the exchange rate set in Virtual Number Settings. Then the global profit markup is applied.
              Rules here override that markup for specific services.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Priority note */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
        <strong>Priority:</strong> service + country &gt; service only &gt; country only &gt; global markup env var
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-500 py-12 text-center">Loading…</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No pricing rules yet. All services use the global markup.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1.5fr_2fr_auto] gap-x-4 px-5 py-3 text-xs font-semibold text-white bg-gradient-to-r from-green-600 to-green-700">
            <div>Service</div>
            <div>Country</div>
            <div>Type</div>
            <div>Value</div>
            <div>Note</div>
            <div>Actions</div>
          </div>

          {rules.map((rule, i) => (
            <div
              key={rule.id}
              className={`grid grid-cols-[1.5fr_1.2fr_1fr_1.5fr_2fr_auto] gap-x-4 px-5 py-3.5 items-center text-sm ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-800">
                {rule.service ?? <span className="text-gray-400 italic">all services</span>}
              </div>
              <div className="text-gray-700">
                {rule.country_code ?? <span className="text-gray-400 italic">all countries</span>}
              </div>
              <div>
                {rule.fixed_price != null ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">fixed</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">markup</span>
                )}
              </div>
              <div className="font-mono text-gray-800">{pricingDisplay(rule)}</div>
              <div className="text-gray-500 truncate">{rule.note ?? '—'}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(rule)}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(rule)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Service + Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Service slug <span className="text-gray-400">(leave blank = all)</span>
                  </label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                    placeholder="e.g. instagram"
                    disabled={!!editRule}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Country code <span className="text-gray-400">(leave blank = all)</span>
                  </label>
                  <input
                    type="text"
                    value={form.country_code}
                    onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}
                    placeholder="e.g. US"
                    maxLength={2}
                    disabled={!!editRule}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              {editRule && (
                <p className="text-xs text-gray-400 -mt-2">
                  Service and country cannot be changed on an existing rule. Delete and recreate to change them.
                </p>
              )}

              {/* Pricing type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fixed price (₦) <span className="text-gray-400">(overrides markup)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.fixed_price}
                    onChange={e => setForm(f => ({ ...f, fixed_price: e.target.value, markup: '' }))}
                    placeholder="e.g. 1500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Profit multiplier <span className="text-gray-400">(1.5 = 50% profit over NGN cost)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.01"
                    value={form.markup}
                    onChange={e => setForm(f => ({ ...f, markup: e.target.value, fixed_price: '' }))}
                    placeholder="e.g. 1.3"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Special rate for US Instagram"
                  maxLength={255}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
