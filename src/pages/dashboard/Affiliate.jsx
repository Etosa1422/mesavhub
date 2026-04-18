"use client"

import { useState } from "react"
import React, { useEffect } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Share2,
  Download,
  RefreshCw,
} from "lucide-react"
import { toast } from 'react-hot-toast'
import {
  fetchAffiliateData,
  generateAffiliateLink,
  fetchAffiliateStats,
  fetchAffiliatePayouts,
  requestAffiliatePayout
} from "../../services/userService"

const socialPlatforms = [
  { name: "Facebook", icon: "??", color: "bg-green-600" },
  { name: "Twitter", icon: "??", color: "bg-sky-500" },
  { name: "Instagram", icon: "??", color: "bg-pink-500" },
  { name: "WhatsApp", icon: "??", color: "bg-green-500" },
  { name: "Telegram", icon: "??", color: "bg-green-500" },
]

const Affiliate = () => {
  const [copiedLink, setCopiedLink] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [affiliateData, setAffiliateData] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [stats, setStats] = useState({
    visits: 0,
    registrations: 0,
    referrals: 0,
    conversion_rate: 0,
    total_earnings: 0,
    available_earnings: 0,
    paid_earnings: 0
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [affiliateRes, payoutsRes, statsRes] = await Promise.all([
        fetchAffiliateData(),
        fetchAffiliatePayouts(),
        fetchAffiliateStats()
      ])
      
      // Handle response structures
      const affiliateData = affiliateRes?.data || affiliateRes || {}
      const payoutsData = payoutsRes?.data || (Array.isArray(payoutsRes) ? payoutsRes : [])
      const statsData = statsRes?.data || statsRes || {}
      
      setAffiliateData(affiliateData)
      setPayouts(Array.isArray(payoutsData) ? payoutsData : [])
      setStats({
        visits: Number(statsData.visits) || 0,
        registrations: Number(statsData.registrations) || 0,
        referrals: Number(statsData.referrals) || 0,
        conversion_rate: Number(statsData.conversion_rate) || 0,
        total_earnings: Number(statsData.total_earnings) || 0,
        available_earnings: Number(statsData.available_earnings) || 0,
        paid_earnings: Number(statsData.paid_earnings) || 0
      })
    } catch (err) {
      setError(err.message || "Failed to load data")
      toast.error(err.message || "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const referralLink = affiliateData?.referral_link || ""
  const commissionRate = Number(affiliateData?.commission_rate) || 0
  const minimumPayout = Number(affiliateData?.minimum_payout) || 0

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopiedLink(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast.error('Failed to copy link')
    }
  }

  const shareToSocial = (platform) => {
    const message = `Join Mesavhub and get amazing social media services! Use my referral link: ${referralLink}`
    const encodedMessage = encodeURIComponent(message)

    const urls = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      WhatsApp: `https://wa.me/?text=${encodedMessage}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodedMessage}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400")
    }
  }

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true)
      const response = await generateAffiliateLink()
      const data = response?.data || response || {}
      
      setAffiliateData({
        has_program: true,
        referral_link: data.referral_link,
        commission_rate: data.commission_rate || 4.0,
        minimum_payout: data.minimum_payout || 2000.00,
        referral_code: data.referral_code
      })
      
      toast.success(response?.message || data?.message || 'Affiliate program created successfully!')
      
      // Refresh data
      await loadData()
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to generate link"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    try {
      setIsLoading(true)
      const response = await requestAffiliatePayout()
      const message = response?.message || response?.data?.message || 'Payout request submitted successfully!'
      toast.success(message)
      await loadData() // Refresh all data
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to request payout"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadData()
    toast.success('Data refreshed!')
  }

  const exportPayouts = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Amount', 'Status', 'Transaction ID']
      const rows = payouts.map(payout => [
        new Date(payout.created_at).toLocaleDateString(),
        `?${(Number(payout.amount) || 0).toLocaleString()}`,
        payout.status,
        payout.transaction_id || 'N/A'
      ])
      
      let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n")
      
      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "payouts-history.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Payouts exported successfully')
    } catch (err) {
      toast.error('Failed to export payouts')
    }
  }

  if (isLoading && !affiliateData) return <div className="flex justify-center items-center h-64">Loading...</div>
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Program</h1>
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow">
            <p className="text-lg leading-relaxed">
              <span className="font-semibold">
                Tell People About Mesavhub And Earn By Simply Sharing Your Unique Affiliate Link.
              </span>
              <br />
              You Will Get A <span className="font-bold text-yellow-300">{commissionRate}% LIFETIME</span> Commission On
              Every Deposit Made By People That Sign Up With Your Link.
              <br />
              <span className="font-semibold">Happy Earning ????</span>
            </p>
          </div>
        </div>

        {!affiliateData?.has_program ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-bold mb-4">You don't have an affiliate program yet</h2>
            <button
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
            >
              {isLoading ? 'Creating...' : 'Create My Affiliate Program'}
            </button>
          </div>
        ) : (
          <>
            {/* Main Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Referral Link Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-700">Referral Link</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-green-600 break-all">{referralLink}</code>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyReferralLink}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
                    >
                      {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copiedLink ? "Copied!" : "Copy Link"}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Commission Rate Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-700">Commission Rate</h2>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{commissionRate}%</div>
                  <p className="text-sm text-gray-600">Lifetime commission on all deposits</p>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${commissionRate * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Minimum Payout Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-700">Minimum Payout</h2>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">?{minimumPayout.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Minimum amount for withdrawal</p>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {affiliateData?.auto_payout ? 'Auto payout available' : 'Manual payout'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Share Your Link</h2>
                  <p className="text-gray-600">Share your referral link on social media platforms</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => shareToSocial(platform.name)}
                    className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-800">Performance Statistics</h2>
                  <p className="text-gray-600">Track your affiliate performance and earnings</p>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium flex items-center hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats?.visits || 0}</div>
                  <div className="text-sm text-gray-600">Visits</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats?.registrations || 0}</div>
                  <div className="text-sm text-gray-600">Registrations</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats?.referrals || 0}</div>
                  <div className="text-sm text-gray-600">Referrals</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof stats?.conversion_rate === 'number' 
                      ? stats.conversion_rate.toFixed(2) 
                      : (Number(stats?.conversion_rate) || 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>

                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">?{(Number(stats?.total_earnings) || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">?{(Number(stats?.available_earnings) || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Available Earnings</div>
                </div>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold text-gray-800">Payout History</h2>
                    <p className="text-gray-600">Track your withdrawal history and status</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportPayouts}
                      disabled={payouts.length === 0}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium flex items-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={handleRequestPayout}
                      disabled={isLoading || (Number(stats?.available_earnings) || 0) < Number(minimumPayout)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Request Payout'}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="py-3 px-4 font-semibold text-gray-700">Payout Date</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Payout Amount</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Payout Status</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts?.length > 0 ? (
                        payouts.map((payout, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(payout.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-semibold text-green-600">?{(Number(payout.amount) || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  payout.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payout.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">{payout.transaction_id || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="text-gray-500">
                                <p className="font-medium">No payouts yet</p>
                                <p className="text-sm">Start referring users to earn commissions</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tips and Guidelines */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Affiliate Tips</h2>
                <p className="text-gray-600">Maximize your earnings with these proven strategies</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Best Practices:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">?</span>
                      Share your link on social media platforms regularly
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">?</span>
                      Create engaging content about social media growth
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">?</span>
                      Target users interested in social media marketing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">?</span>
                      Be transparent about using referral links
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Commission Structure:</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Commission Rate</span>
                      <span className="font-bold text-green-600">{commissionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Minimum Payout</span>
                      <span className="font-bold text-green-600">?{minimumPayout.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Payment Schedule</span>
                      <span className="font-bold text-green-600">{affiliateData?.payout_schedule || 'Weekly'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Affiliate