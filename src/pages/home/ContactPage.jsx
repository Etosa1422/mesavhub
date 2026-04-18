import { useState } from "react";
import { Mail, MessageSquare, Clock, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-40" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase tracking-widest mb-6">
            <Mail className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400">Have a question, issue, or partnership inquiry? Fill out the form below and we will get back to you promptly.</p>
        </div>
      </section>

      {/* Main */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-1">Email Support</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">support@mesavhub.com</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-1">Response Time</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">We typically respond within 2�6 hours. For urgent order issues, submit a ticket directly from your dashboard.</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-1">Ticket System</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-3">Already have an account? The fastest way to get help is opening a ticket in your dashboard.</p>
              <Link to="/dashboard/support" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">Open a ticket &rarr;</Link>
            </div>
            <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-5">
              <p className="text-xs text-brand-700 dark:text-brand-400 leading-relaxed">
                <strong>Before contacting us</strong>, check our <Link to="/faq" className="underline">FAQ page</Link> � your question may already be answered there.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h2 className="text-gray-900 dark:text-white font-black text-xl mb-2">Message Sent!</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                    Thanks for reaching out. We will get back to you at <strong className="text-gray-700 dark:text-gray-200">{form.email}</strong> within a few hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Subject</label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
                    >
                      <option value="">Select a subject...</option>
                      <option value="order">Order Issue</option>
                      <option value="billing">Billing / Payment</option>
                      <option value="account">Account Issue</option>
                      <option value="api">API / Integration</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Message</label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your question or issue in detail..."
                      className="w-full bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-400 dark:focus:border-brand-600 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;