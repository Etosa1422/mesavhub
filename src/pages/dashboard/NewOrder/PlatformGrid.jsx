"use client"
import React from "react"
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Video,
  Music,
  Twitch,
  Send,
  Linkedin,
  Headphones,
  Camera,
  MessageSquare,
  MessageCircle,
  Heart,
  Phone,
  Mail,
  Gamepad2,
  Monitor,
  Smartphone,
  Mic,
  Play,
  Radio,
  Github,
  Globe,
} from "lucide-react"

const socialPlatforms = [
  { name: "Instagram", icon: Instagram, bgColor: "#e4405f" },
  { name: "Facebook", icon: Facebook, bgColor: "#1877f2" },
  { name: "Youtube", icon: Youtube, bgColor: "#ff0000" },
  { name: "Twitter/X", icon: Twitter, bgColor: "#1da1f2" },
  { name: "TikTok", icon: Video, bgColor: "#111111" },
  { name: "LinkedIn", icon: Linkedin, bgColor: "#0077b5" },
  { name: "Spotify", icon: Headphones, bgColor: "#1db954" },
  { name: "Snapchat", icon: Camera, bgColor: "#f59e0b", darkText: true },
  { name: "Telegram", icon: Send, bgColor: "#0088cc" },
  { name: "SoundCloud", icon: Music, bgColor: "#ff5500" },
  { name: "Twitch", icon: Twitch, bgColor: "#9146ff" },
  { name: "Discord", icon: MessageSquare, bgColor: "#5865f2" },
  { name: "Reddit", icon: MessageCircle, bgColor: "#ff4500" },
  { name: "Pinterest", icon: Heart, bgColor: "#bd081c" },
  { name: "WhatsApp", icon: Phone, bgColor: "#25d366" },
  { name: "GitHub", icon: Github, bgColor: "#333333" },
  { name: "Clubhouse", icon: Mic, bgColor: "#d97706", darkText: true },
  { name: "Vimeo", icon: Play, bgColor: "#1ab7ea" },
  { name: "Podcast", icon: Radio, bgColor: "#9b59b6" },
  { name: "Gaming", icon: Gamepad2, bgColor: "#e74c3c" },
  { name: "Web Traffic", icon: Globe, bgColor: "#6b7280" },
  { name: "App Downloads", icon: Smartphone, bgColor: "#34495e" },
  { name: "Live Stream", icon: Monitor, bgColor: "#e67e22" },
  { name: "Email", icon: Mail, bgColor: "#3498db" },
]

const Pill = ({ platform }) => {
  const Icon = platform.icon
  const textColor = platform.darkText ? "#1f2937" : "#ffffff"
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all duration-150 select-none"
      style={{ backgroundColor: platform.bgColor, color: textColor }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{platform.name}</span>
    </div>
  )
}

const PlatformGrid = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {socialPlatforms.map((platform, index) => (
          <Pill key={index} platform={platform} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {socialPlatforms.map((platform, index) => (
        <Pill key={index} platform={platform} />
      ))}
    </div>
  )
}

export default PlatformGrid
