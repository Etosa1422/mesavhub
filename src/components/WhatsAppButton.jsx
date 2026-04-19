import { useState, useEffect } from "react";
import { getSiteSettings } from "../services/adminService";

const WhatsAppButton = () => {
  const [phone, setPhone] = useState("8143783280");
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        if (s?.whatsapp_number) setPhone(s.whatsapp_number);
      })
      .catch(() => {});
  }, []);

  if (!phone) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent("Hi, I need support!")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#25d366",
        boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        textDecoration: "none",
      }}
      onFocus={() => setTooltip(true)}
      onBlur={() => setTooltip(false)}
    >
      {/* Pulse ring */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "#25d366",
          opacity: 0.35,
          animation: "wa-pulse 2s ease-out infinite",
        }}
      />

      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="white"
        style={{ position: "relative", zIndex: 1 }}
      >
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.663 4.613 1.813 6.52L4 29l7.695-1.793A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.94 9.94 0 0 1-5.03-1.357l-.36-.214-4.57 1.064 1.085-4.46-.234-.374A9.944 9.944 0 0 1 6 15c0-5.523 4.477-10 10-10zm-3.207 5.5c-.2 0-.52.075-.793.375-.272.3-1.04 1.016-1.04 2.476s1.065 2.874 1.213 3.073c.148.2 2.074 3.165 5.02 4.31.7.28 1.247.446 1.673.572.703.207 1.343.178 1.849.108.563-.079 1.735-.71 1.98-1.395.246-.686.246-1.273.172-1.395-.074-.123-.272-.197-.57-.346-.298-.148-1.76-.869-2.034-.968-.272-.099-.47-.148-.668.148-.198.297-.767.968-.94 1.166-.173.198-.347.223-.644.074-.298-.148-1.257-.463-2.394-1.477-.885-.788-1.482-1.762-1.655-2.059-.173-.298-.018-.459.13-.607.133-.133.297-.347.446-.52.148-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.148-.668-1.61-.915-2.203-.24-.577-.484-.499-.668-.508l-.57-.009z" />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <span
          style={{
            position: "absolute",
            right: "64px",
            bottom: "50%",
            transform: "translateY(50%)",
            backgroundColor: "#111827",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            padding: "6px 12px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          Chat on WhatsApp
        </span>
      )}

      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </a>
  );
};

export default WhatsAppButton;
