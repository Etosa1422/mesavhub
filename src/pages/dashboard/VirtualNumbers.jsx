"use client"

// ── REWRITTEN: form-based pattern (Select Country → Select Service → Rent) ──

import { useState, useEffect, useRef, useCallback } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { getMyRentals, rentNumber, getRental, cancelRental, getServicesForCountry, getAvailableCountries } from "../../services/virtualNumberService"
import {
  Phone,
  Search,
  Copy,
  CheckCircle,
  Clock,
  ChevronDown,
  X,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { CSS_COLORS } from "../../components/constant/colors"

// ─── Data ─────────────────────────────────────────────────────────────────────
// Countries are loaded from the backend API on mount
const US_ONLY = [{ code: "US", dial: "+1", flag: "🇺🇸", name: "United States" }]

// Minimal emoji map for rental cards (mapRental fallback when services not loaded)
const SERVICE_META = {
  instagram:  { emoji: "📸", label: "Instagram"   },
  facebook:   { emoji: "👥", label: "Facebook"    },
  whatsapp:   { emoji: "💬", label: "WhatsApp"    },
  telegram:   { emoji: "✈️", label: "Telegram"    },
  twitter:    { emoji: "🐦", label: "Twitter / X" },
  tiktok:     { emoji: "🎵", label: "TikTok"      },
  youtube:    { emoji: "▶️", label: "YouTube"     },
  snapchat:   { emoji: "👻", label: "Snapchat"    },
  discord:    { emoji: "🎮", label: "Discord"     },
  linkedin:   { emoji: "💼", label: "LinkedIn"    },
  gmail:      { emoji: "📧", label: "Gmail"       },
  microsoft:  { emoji: "🪟", label: "Microsoft"   },
  amazon:     { emoji: "📦", label: "Amazon"      },
  uber:       { emoji: "🚗", label: "Uber"        },
  paypal:     { emoji: "💳", label: "PayPal"      },
}

// ─── Rental mapper (backend → frontend shape) ────────────────────────────────
const mapRental = (r) => ({
  id:       r.id,
  number:   r.phone_number,
  country: {
    code:  r.country_code,
    name:  r.country_name,
    flag:  r.country_flag,
    dial:  r.country_dial,
  },
  service: SERVICE_META[r.service]
    ? { id: r.service, ...SERVICE_META[r.service] }
    : { id: r.service, label: r.service_label || r.service, emoji: "\uD83D\uDCF1" },
  rentedAt:  new Date(r.created_at),
  expiresAt: new Date(r.expires_at),
  price:  parseFloat(r.price),
  otp:    r.otp_code ?? null,
  status: r.status,
})

// ─── Countdown ────────────────────────────────────────────────────────────────
const useCountdown = (expiresAt) => {
  const [timeLeft, setTimeLeft] = useState("")
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    const tick = () => {
      const diff = expiresAt - Date.now()
      if (diff <= 0) { setTimeLeft("Expired"); setExpired(true); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return { timeLeft, expired }
}

// ─── Active Rental Card ───────────────────────────────────────────────────────
const ActiveRentalCard = ({ item, onRemove, onCancel, fmt }) => {
  const { timeLeft, expired } = useCountdown(item.expiresAt)
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [copiedOtp, setCopiedOtp] = useState(false)

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text)
    setter(true)
    toast.success("Copied!")
    setTimeout(() => setter(false), 2000)
  }

  const hasOtp = Boolean(item.otp)

  const statusBadge = hasOtp
    ? <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50"><CheckCircle className="w-3 h-3" />Code received</span>
    : expired
      ? <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/8">Expired</span>
      : <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
          <Clock className="w-3 h-3" />{timeLeft}
        </span>

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      hasOtp
        ? "bg-brand-50/40 dark:bg-brand-950/10 border-brand-200 dark:border-brand-800/30"
        : expired && !hasOtp
          ? "bg-gray-50 dark:bg-white/2 border-gray-100 dark:border-white/5 opacity-60"
          : "bg-white dark:bg-[#0f0f1a] border-gray-100 dark:border-white/8 shadow-sm"
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-lg leading-none">
            {item.service.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{item.service.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
              <span>{item.country.flag}</span>{item.country.name}
              <span className="text-gray-300 dark:text-white/15">·</span>
              <span className="font-semibold text-gray-500 dark:text-gray-400">{fmt ? fmt(item.price) : item.price.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {statusBadge}
          {!expired && !hasOtp && (
            <button
              onClick={() => onCancel(item.id)}
              title="Cancel rental"
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {expired && (
            <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Phone number row */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-[#0a0a0f] rounded-xl border border-gray-100 dark:border-white/5 mb-3">
        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1 tracking-wide">{item.number}</span>
        <button onClick={() => copy(item.number, setCopiedNumber)} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          {copiedNumber ? <CheckCircle className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
        </button>
      </div>

      {/* OTP area */}
      {hasOtp ? (
        <div className="flex items-center justify-between bg-white dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 rounded-xl px-4 py-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-1">Verification Code</p>
            <p className="text-2xl font-bold tracking-[0.3em] text-brand-700 dark:text-brand-200 font-mono">{item.otp}</p>
          </div>
          <button
            onClick={() => copy(item.otp, setCopiedOtp)}
            className="flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: CSS_COLORS.primary }}
          >
            {copiedOtp ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedOtp ? "Copied!" : "Copy"}
          </button>
        </div>
      ) : expired ? (
        <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-white/3 rounded-xl px-4 py-2.5">
          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <p className="text-xs text-gray-400">No code received — number expired</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 border border-dashed border-gray-200 dark:border-white/10">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Awaiting SMS…</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Enter <span className="font-mono font-semibold text-gray-500 dark:text-gray-400">{item.number}</span> in {item.service.label}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Country Dropdown ─────────────────────────────────────────────────────────
const CountryDropdown = ({ selected, onChange, countries }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.dial.includes(query)
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/8 rounded-2xl text-sm hover:border-gray-300 dark:hover:border-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{selected.dial}</span>
            <span className="text-gray-800 dark:text-gray-200">{selected.name}</span>
          </span>
        ) : (
          <span className="text-gray-400">Select country…</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-30 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search country…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#0a0a0f] rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-sm text-gray-400 py-4">No results</p>
              : filtered.map(c => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c); setOpen(false); setQuery("") }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left ${selected?.code === c.code ? "bg-brand-50 dark:bg-brand-950/30" : ""}`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 w-12 flex-shrink-0">{c.dial}</span>
                  <span className="text-gray-700 dark:text-gray-200 flex-1 truncate">{c.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Service Selector ─────────────────────────────────────────────────────────
const ServiceSelector = ({ selected, onChange, services, loading, fmt, hasCountry }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = services.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))

  const countBadgeClass = (count) => {
    if (count >= 50) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    if (count >= 10) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
    return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => { if (!loading) setOpen(true) }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-[#0a0a0f] border rounded-2xl transition-all ${
          loading ? "opacity-60 cursor-not-allowed" :
          open
            ? "border-brand-400 dark:border-brand-600 ring-2 ring-brand-500/20 cursor-text"
            : "border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15 cursor-text"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
            <span className="text-sm text-gray-400">Loading services…</span>
          </>
        ) : selected && !open ? (
          <>
            <span className="text-base leading-none">{SERVICE_META[selected.id]?.emoji ?? "📱"}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{selected.label}</span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{fmt ? fmt(selected.price) : selected.price.toFixed(2)}</span>
            <button
              onClick={e => { e.stopPropagation(); onChange(null); setQuery("") }}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </>
        ) : (
          <>
            <input
              autoFocus={open}
              type="text"
              placeholder={
                loading
                  ? "Loading services…"
                  : services.length
                    ? "Search service…"
                    : hasCountry
                      ? "No services available for this country"
                      : "Select a country first"
              }
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-30 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0
              ? <p className="text-center text-sm text-gray-400 py-4">No results</p>
              : filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => { onChange(s); setQuery(""); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left ${selected?.id === s.id ? "bg-brand-50 dark:bg-brand-950/30" : ""}`}
                >
                  <span className="text-base leading-none flex-shrink-0">{SERVICE_META[s.id]?.emoji ?? "📱"}</span>
                  <span className="text-gray-700 dark:text-gray-200 flex-1 truncate">{s.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${countBadgeClass(s.count)}`}>
                    {s.count > 999 ? "999+" : s.count}
                  </span>
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400 flex-shrink-0 w-14 text-right">
                    {fmt ? fmt(s.price) : s.price.toFixed(2)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const VirtualNumbers = () => {
  const { selectedCurrency, convertToSelectedCurrency, currencies, user: contextUser } = useOutletContext() || {}
  const currenciesLoaded = Array.isArray(currencies) && currencies.length > 0
  const currSymbol = currenciesLoaded ? (selectedCurrency?.symbol || '₦') : '₦'
  const fmt = (price) => {
    if (!currenciesLoaded) return `₦${Number(price).toFixed(2)}`
    const converted = convertToSelectedCurrency ? convertToSelectedCurrency(price, 'NGN') : price
    return `${currSymbol}${Number(converted).toFixed(2)}`
  }
  const navigate = useNavigate()
  const [balance, setBalance] = useState(contextUser?.balance ?? null)
  useEffect(() => {
    if (contextUser?.balance !== undefined) setBalance(contextUser.balance)
  }, [contextUser])
  const [tab, setTab] = useState("all")
  const [countries, setCountries] = useState([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [country, setCountry] = useState(null)
  const [service, setService] = useState(null)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [maxPrice, setMaxPrice] = useState("")
  const [isRenting, setIsRenting] = useState(false)
  const [rentals, setRentals] = useState([])
  const [loadingRentals, setLoadingRentals] = useState(true)
  const pollRef = useRef({})

  // ── Fetch countries on mount ────────────────────────────────────────
  useEffect(() => {
    getAvailableCountries()
      .then(({ data }) => { if (data.success) setCountries(data.data) })
      .catch(() => {})
      .finally(() => setCountriesLoading(false))
  }, [])
  // Fetch services whenever country changes
  useEffect(() => {
    if (!country) { setServices([]); setService(null); return }

    setServicesLoading(true)
    setService(null)
    getServicesForCountry(country.code)
      .then(({ data }) => {
        if (data.success) setServices(data.data)
      })
      .catch(() => toast.error("Couldn't load services for this country."))
      .finally(() => setServicesLoading(false))
  }, [country])

  // ── Poll a single rental every 5 s until OTP arrives ──────────────────────
  // Keeps polling for up to 20 min from rentedAt so late-arriving codes are caught.
  const startPolling = useCallback((id, rentedAt) => {
    if (pollRef.current[id]) return // already polling
    pollRef.current[id] = setInterval(async () => {
      try {
        const { data } = await getRental(id)
        const r = data.data
        if (r.otp_code) {
          clearInterval(pollRef.current[id])
          delete pollRef.current[id]
          setRentals(prev => prev.map(x => x.id === id ? { ...x, otp: r.otp_code, status: "completed" } : x))
          toast.success(`✅ Code received: ${r.otp_code}`, { duration: 5000 })
        } else {
          // Update status in UI (expired, cancelled, etc.) but keep polling
          // until 20 min have elapsed from the original rental start.
          if (r.status !== "active") {
            setRentals(prev => prev.map(x => x.id === id ? { ...x, status: r.status } : x))
          }
          const elapsed = Date.now() - new Date(rentedAt).getTime()
          if (elapsed > 20 * 60 * 1000) {
            clearInterval(pollRef.current[id])
            delete pollRef.current[id]
          }
        }
      } catch {
        // network blip — keep polling
      }
    }, 5000)
  }, [])

  // ── Load existing rentals on mount ──────────────────────────────────────────
  useEffect(() => {
    getMyRentals()
      .then(({ data }) => {
        if (data.success) {
          const mapped = data.data.map(mapRental)
          setRentals(mapped)
          // Resume polling for any still awaiting OTP (including recently-expired)
          mapped
            .filter(r => !r.otp && (r.status === "active" || (r.status === "expired" && Date.now() - r.rentedAt < 20 * 60 * 1000)))
            .forEach(r => startPolling(r.id, r.rentedAt))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRentals(false))

    return () => {
      Object.values(pollRef.current).forEach(clearInterval)
    }
  }, [startPolling])

  const countryList = tab === "us" ? US_ONLY : countries

  const handleTabChange = (t) => {
    setTab(t)
    setCountry(t === "us" ? US_ONLY[0] : null)
  }

  const canAfford = balance === null || !service || balance >= service.price
  const canRent = country && service && !isRenting && canAfford

  const handleRent = async () => {
    if (!country || !service || isRenting) return
    if (balance !== null && balance < service.price) {
      toast.error("Insufficient balance. Please add funds to continue.")
      return
    }
    setIsRenting(true)
    try {
      const { data } = await rentNumber({
        country_code:  country.code,
        country_name:  country.name,
        country_flag:  country.flag,
        country_dial:  country.dial,
        service:       service.id,
        service_label: service.label,
      })
      if (data.success) {
        const rental = mapRental(data.data)
        setRentals(prev => [rental, ...prev])
        // Deduct from local balance
        setBalance(prev => prev !== null ? Math.max(0, prev - service.price) : null)
        toast.success(`${country.flag} ${rental.number} is ready — waiting for SMS…`)
        startPolling(rental.id, rental.rentedAt)
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "Failed to rent number. Please try again."
      toast.error(msg)
    } finally {
      setIsRenting(false)
    }
  }

  const handleCancel = async (id) => {
    if (pollRef.current[id]) {
      clearInterval(pollRef.current[id])
      delete pollRef.current[id]
    }
    try {
      const { data } = await cancelRental(id)
      if (data?.refunded) {
        setBalance(prev => prev !== null ? prev + data.refunded : null)
        toast.success(`Number cancelled — ${fmt(data.refunded)} refunded to your balance.`)
      } else {
        toast.success("Number cancelled.")
      }
    } catch {
      toast.success("Number cancelled.")
    }
    setRentals(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="w-full min-h-full bg-gray-50/60 dark:bg-[#07070f]">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: CSS_COLORS.primary }}>
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Virtual Numbers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Rent a real phone number, get your SMS code, verify any service.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { n: "1", icon: "🌍", title: "Choose country", desc: "Pick where your number is from" },
              { n: "2", icon: "📱", title: "Select service", desc: "Instagram, WhatsApp, any app" },
              { n: "3", icon: "✉️", title: "Receive code", desc: "Your SMS code appears in seconds" },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: CSS_COLORS.primary }}>
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{icon} {title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hidden sm:block">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* ── Left: Order Form ──────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Region toggle */}
            <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 p-1 flex shadow-sm">
              {[
                { key: "us",  label: "🇺🇸 US Numbers",       desc: "Best rates" },
                { key: "all", label: "🌍 All Countries",     desc: `${countries.length ? countries.length + "+" : "148+"} countries` },
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tab === key ? "text-white shadow-md" : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  style={tab === key ? { backgroundColor: CSS_COLORS.primary } : {}}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${tab === key ? "text-white/70" : "text-gray-400"}`}>{desc}</span>
                </button>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm divide-y divide-gray-50 dark:divide-white/5">

              {/* Country */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: CSS_COLORS.primary }}>1</span>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Country</label>
                </div>
                <CountryDropdown selected={country} onChange={setCountry} countries={countryList} />
              </div>

              {/* Service */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: CSS_COLORS.primary }}>2</span>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Service</label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Max</span>
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/8 rounded-lg px-2 py-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{currSymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="any"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-14 bg-transparent text-xs text-gray-700 dark:text-gray-300 outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
                <ServiceSelector
                  selected={service}
                  onChange={setService}
                  services={services.filter(s => {
                    if (!maxPrice || isNaN(parseFloat(maxPrice))) return true
                    const displayPrice = convertToSelectedCurrency ? convertToSelectedCurrency(s.price, 'NGN') : s.price
                    return displayPrice <= parseFloat(maxPrice)
                  })}
                  loading={servicesLoading}
                  fmt={fmt}
                  hasCountry={!!country}
                />
              </div>

              {/* Summary + CTA */}
              <div className="p-5 space-y-4">
                {service ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Service",  value: `${SERVICE_META[service.id]?.emoji ?? "📱"} ${service.label}` },
                      { label: "Country",  value: `${country.flag} ${country.name}` },
                      { label: "Price",    value: fmt ? fmt(service.price) : `₦${service.price.toFixed(2)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-white/3 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/3 border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Select a country and service to see pricing</p>
                  </div>
                )}

                {/* Insufficient balance warning */}
                {service && balance !== null && balance < service.price && (
                  <div className="rounded-xl overflow-hidden border border-red-200 dark:border-red-900/40">
                    <div className="h-0.5 w-full bg-gradient-to-r from-red-400 via-orange-400 to-red-500" />
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">Insufficient Balance</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Cost <span className="font-semibold text-gray-700 dark:text-gray-200">{fmt(service.price)}</span>
                          {" · "}Balance <span className="font-semibold text-gray-700 dark:text-gray-200">{fmt(balance)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/dashboard/add-funds")}
                        className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex-shrink-0"
                      >
                        Top Up <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRent}
                  disabled={!canRent}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] shadow-md"
                  style={{ backgroundColor: CSS_COLORS.primary }}
                >
                  {isRenting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Getting your number…</>
                    : <><Phone className="w-4 h-4" />Rent Number</>  
                  }
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  Balance is checked before renting · Instant delivery
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "⚡", title: "Instant Delivery",   desc: "Numbers provisioned in seconds" },
                { icon: "🔒", title: "Private & Secure",   desc: "Your data is never stored" },
                { icon: "🌍", title: "150+ Countries",      desc: "Global coverage via top providers" },
                { icon: "💳", title: "Fair Pricing",       desc: "Real provider rates + small margin" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="text-xl leading-none flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Active Rentals ─────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  My Numbers
                  {!loadingRentals && (
                    <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: CSS_COLORS.primaryExtraLight, color: CSS_COLORS.primary }}>
                      {rentals.length}
                    </span>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Codes saved permanently</span>
            </div>

            {loadingRentals ? (
              <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-gray-300 dark:text-gray-600 animate-spin" />
              </div>
            ) : rentals.length === 0 ? (
              <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 border-dashed flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/8 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No numbers yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Rent a number and your code will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rentals.map(r => (
                  <ActiveRentalCard
                    key={r.id}
                    item={r}
                    onRemove={(id) => setRentals(prev => prev.filter(x => x.id !== id))}
                    onCancel={handleCancel}
                    fmt={fmt}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default VirtualNumbers
