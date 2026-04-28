"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Loader2, Edit2, X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react"
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../services/adminService"

const TYPE_CONFIG = {
  info:    { label: "Info",    icon: Info,          bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700",  badge: "bg-blue-100 text-blue-700" },
  success: { label: "Success", icon: CheckCircle,   bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  warning: { label: "Warning", icon: AlertTriangle, bg: "bg-yellow-50", border: "border-yellow-200",text: "text-yellow-700",badge: "bg-yellow-100 text-yellow-700" },
  error:   { label: "Error",   icon: AlertCircle,   bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",   badge: "bg-red-100 text-red-700" },
}

const EMPTY_FORM = { title: "", message: "", type: "info", is_active: true }

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [editingId, setEditingId]         = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetchAnnouncements()
      setAnnouncements(res.data || [])
    } catch {
      toast.error("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (ann) => {
    setEditingId(ann.id)
    setForm({ title: ann.title, message: ann.message, type: ann.type, is_active: ann.is_active })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const res = await updateAnnouncement(editingId, form)
        setAnnouncements(prev => prev.map(a => a.id === editingId ? res.data : a))
        toast.success("Announcement updated")
      } else {
        const res = await createAnnouncement(form)
        setAnnouncements(prev => [res.data, ...prev])
        toast.success("Announcement sent to all users!")
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save announcement")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (ann) => {
    try {
      const res = await updateAnnouncement(ann.id, { is_active: !ann.is_active })
      setAnnouncements(prev => prev.map(a => a.id === ann.id ? res.data : a))
      toast.success(res.data.is_active ? "Announcement activated" : "Announcement deactivated")
    } catch {
      toast.error("Failed to update")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return
    try {
      await deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success("Deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="p-4 xl:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Announcements</h1>
            <p className="text-sm text-gray-500">Send popup messages to all dashboard users</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: key }))}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                          form.type === key
                            ? `${cfg.border} ${cfg.text} ${cfg.bg}`
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Scheduled Maintenance"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write the message that users will see..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  required
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Active (show to users)</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`transition-colors ${form.is_active ? "text-green-500" : "text-gray-400"}`}
                >
                  {form.is_active
                    ? <ToggleRight className="w-8 h-8" />
                    : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              {/* Preview */}
              {form.title && form.message && (
                <div className={`rounded-xl border p-4 ${TYPE_CONFIG[form.type].bg} ${TYPE_CONFIG[form.type].border}`}>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
                  {(() => {
                    const Icon = TYPE_CONFIG[form.type].icon
                    return (
                      <div className="flex gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${TYPE_CONFIG[form.type].text}`} />
                        <div>
                          <p className={`font-semibold text-sm ${TYPE_CONFIG[form.type].text}`}>{form.title}</p>
                          <p className="text-gray-600 text-sm mt-1">{form.message}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Send to Users"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-1">Create one to show a popup to all users</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info
            const Icon = cfg.icon
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${!ann.is_active ? "opacity-60" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{ann.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
                    {!ann.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{ann.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ann.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(ann)}
                    title={ann.is_active ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-xl transition-colors ${ann.is_active ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {ann.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
