"use client"
import React from "react";
import { Info } from "lucide-react"
import { CSS_COLORS } from "../../components/constant/colors"

function Tutorials() {
  const tutorials = [
    {
      id: 1,
      title: "How to use Mesavhub",
      description: "A comprehensive guide to navigating and utilizing all features of our platform.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 2,
      title: "How to fund your Mesavhub account",
      description: "Learn the various methods to securely add funds to your wallet.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 3,
      title: "How to request a refill",
      description: "Understand the process for requesting refills on your orders.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 4,
      title: "Understanding service statuses",
      description: "A detailed explanation of all order statuses and what they mean.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 5,
      title: "Placing your first order",
      description: "Step-by-step guide to successfully placing your initial order.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 6,
      title: "Advanced tips and tricks",
      description: "Maximize your experience with expert tips and hidden features.",
      youtubeId: null,
      thumbnail: "/placeholder.svg?height=300&width=500",
    },
  ]

  return (
    <div className="w-full min-h-screen p-4 lg:p-6" style={{ backgroundColor: CSS_COLORS.background.page }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-text-DEFAULT">All Tutorials</h1>
          <p className="text-base lg:text-lg text-text-medium max-w-2xl mx-auto">
            Need help using mesavhub? Our tutorials cover everything from funding your wallet to placing your first
            order. Watch and get started in minutes.
          </p>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="rounded-2xl shadow-lg overflow-hidden border border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: CSS_COLORS.background.card }}
            >
              <div className="relative w-full aspect-video bg-gray-200 flex items-center justify-center">
                {/* Using a placeholder image for the video thumbnail */}
                <img
                  src={tutorial.thumbnail || "/placeholder.svg"}
                  alt={`Thumbnail for ${tutorial.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Play button overlay */}
                {tutorial.youtubeId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${tutorial.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-opacity"
                    aria-label={`Watch ${tutorial.title} on YouTube`}
                  >
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21.409 9.353a2.25 2.25 0 0 0-1.957-2.255C18.257 6.31 12 6.31 12 6.31s-6.257 0-7.452.788a2.25 2.25 0 0 0-1.957 2.255C2.543 10.55 2.543 12 2.543 12s0 1.449.994 2.647a2.25 2.25 0 0 0 1.957 2.255C5.743 17.69 12 17.69 12 17.69s6.257 0 7.452-.788a2.25 2.25 0 0 0 1.957-2.255C21.457 13.45 21.457 12 21.457 12s0-1.449-.048-2.647zM10 15.5v-7L16 12l-6 3.5z" />
                    </svg>
                  </a>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span className="text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-full">Coming Soon</span>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-text-DEFAULT">{tutorial.title}</h3>
                <p className="text-sm text-text-medium">{tutorial.description}</p>
                {tutorial.youtubeId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${tutorial.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-text-medium hover:bg-gray-100 transition-colors"
                  >
                    Watch on YouTube
                  </a>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-text-muted cursor-default">
                    Video Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Notice - Replicated from NewOrder component */}
        <div
          className="mt-8 p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-white shadow-lg border border-white/20 backdrop-blur-sm"
          style={{ background: `linear-gradient(135deg, ${CSS_COLORS.primary}, ${CSS_COLORS.primaryDark})` }}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 rounded-2xl flex-shrink-0">
              <Info className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold mb-2">
                Service <span className="text-yellow-300">Updates</span>
              </h3>
              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-semibold mb-2 text-yellow-300">🚨 Important Notice</h4>
                <p className="text-sm lg:text-base text-white/90">
                  For any non-delivered orders, please contact our support team for immediate assistance and refund
                  processing.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Copyright Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">© Copyright 2025 All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Tutorials
