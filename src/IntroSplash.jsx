// src/IntroSplash.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * IntroSplash
 * - Plays a video full-screen on first visit
 * - When the video ends, shows a centered logo that zooms in
 *   while the overlay fades out to reveal the homepage
 */
export default function IntroSplash({
  src,                   // Video URL (GCS or /public)
  poster,                // Optional poster image for the video
  logoSrc,               // Logo to show AFTER the video
  showOnce = true,       // Only show once per visitor
  storageKey = "intro_seen_v1", // Change this to re-show after updates
  logoDurationMs = 900,  // Duration of logo zoom/fade
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState("video"); // "video" | "logo"
  const [logoAnim, setLogoAnim] = useState(false); // trigger zoom/fade classes
  const videoRef = useRef(null);

  // Hide + remember
  const finish = () => {
    try { if (showOnce) localStorage.setItem(storageKey, "1"); } catch {}
    setVisible(false);
  };

  // Skip entirely if already seen
  useEffect(() => {
    try {
      if (showOnce && localStorage.getItem(storageKey) === "1") {
        setVisible(false);
      }
    } catch {}
  }, [showOnce, storageKey]);

  // Nudge Safari/iOS to start playback
  const onCanPlay = () => {
    try { videoRef.current?.play().catch(() => {}); } catch {}
  };

  // When video ends, show logo and fade everything away
  const onEnded = () => {
    setPhase("logo");
    // allow one frame so transitions apply
    requestAnimationFrame(() => setLogoAnim(true));
    // fade out overlay over the same duration as the logo zoom
    setTimeout(finish, logoDurationMs + 50);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black ${
        phase === "logo" ? "opacity-0" : "opacity-100"
      }`}
      // Make the overlay itself fade out during the logo phase
      style={{
        transition: `opacity ${logoDurationMs}ms ease`,
      }}
      aria-label="Intro overlay"
    >
      {/* Video phase */}
      {phase === "video" && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          playsInline
          onCanPlay={onCanPlay}
          onEnded={onEnded}
          className="w-full h-full object-contain"
        />
      )}

      {/* Logo phase (appears after video ends) */}
      {phase === "logo" && logoSrc && (
        <img
          src={logoSrc}
          alt="Logo"
          className={`absolute w-40 h-40 md:w-56 md:h-56 object-contain`}
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
