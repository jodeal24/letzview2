// src/IntroSplash.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * IntroSplash (sound + fade only)
 * - Plays a full-screen video once per visitor
 * - When it ends, fades smoothly into the website
 */
export default function IntroSplash({
  src,                   // Video URL
  poster,                // Optional poster image
  showOnce = true,       // Only show once per visitor
  storageKey = "intro_seen_v1", // Change this to re-show
  fadeDurationMs = 800,  // Fade-out duration in ms
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef(null);

  // Hide overlay completely
  const finish = () => {
    try {
      if (showOnce) localStorage.setItem(storageKey, "1");
    } catch {}
    setVisible(false);
  };

  // Skip showing if already seen
  useEffect(() => {
    try {
      if (showOnce && localStorage.getItem(storageKey) === "1") {
        setVisible(false);
      }
    } catch {}
  }, [showOnce, storageKey]);

  // Try to autoplay with sound; fallback to muted if blocked
  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const tryPlay = async () => {
      v.muted = false;
      try {
        await v.play();
      } catch {
        console.warn("Autoplay with sound blocked — retrying muted.");
        v.muted = true;
        await v.play().catch(() => {});
      }
    };
    tryPlay();
  }, []);

  const onEnded = () => {
    setFading(true);
    setTimeout(finish, fadeDurationMs);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transition: `opacity ${fadeDurationMs}ms ease` }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        playsInline
        onEnded={onEnded}
        controls={false}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
