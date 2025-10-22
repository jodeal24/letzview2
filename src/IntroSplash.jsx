// src/IntroSplash.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * IntroSplash (with sound)
 * - Plays full-screen video once per visitor (sound ON)
 * - At the end, shows your logo zooming & fading while revealing the homepage
 */
export default function IntroSplash({
  src,                   // Video URL
  poster,                // Optional poster image
  logoSrc,               // Logo to show AFTER video ends
  showOnce = true,       // Only show once per visitor
  storageKey = "intro_seen_v1", // Change this to re-show
  logoDurationMs = 1000, // How long the zoom+fade lasts
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState("video"); // "video" | "logo"
  const [logoAnim, setLogoAnim] = useState(false);
  const videoRef = useRef(null);

  // Hide overlay
  const finish = () => {
    try {
      if (showOnce) localStorage.setItem(storageKey, "1");
    } catch {}
    setVisible(false);
  };

  // Don’t show again if already seen
  useEffect(() => {
    try {
      if (showOnce && localStorage.getItem(storageKey) === "1") {
        setVisible(false);
      }
    } catch {}
  }, [showOnce, storageKey]);

  // Try to play video with sound
  useEffect(() => {
    if (phase === "video" && videoRef.current) {
      const v = videoRef.current;
      v.muted = false;
      const play = async () => {
        try {
          await v.play();
        } catch (err) {
          console.warn("Autoplay blocked; showing overlay muted.", err);
          v.muted = true;
          await v.play().catch(() => {});
        }
      };
      play();
    }
  }, [phase]);

  const onEnded = () => {
    setPhase("logo");
    requestAnimationFrame(() => setLogoAnim(true));
    setTimeout(finish, logoDurationMs + 100);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black ${
        phase === "logo" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transition: `opacity ${logoDurationMs}ms ease`,
      }}
    >
      {/* Video phase */}
      {phase === "video" && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          playsInline
          controls={false}
          onEnded={onEnded}
          className="w-full h-full object-contain"
        />
      )}

      {/* Logo phase */}
      {phase === "logo" && logoSrc && (
        <img
          src={logoSrc}
          alt="Logo"
          className="absolute w-40 h-40 md:w-56 md:h-56 object-contain"
          style={{
            transform: logoAnim ? "scale(1.25)" : "scale(1)",
            opacity: logoAnim ? 0 : 1,
            transition: `transform ${logoDurationMs}ms ease, opacity ${logoDurationMs}ms ease`,
          }}
        />
      )}
    </div>
  );
}
