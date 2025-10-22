// src/IntroSplash.jsx
import React, { useEffect, useRef, useState } from "react";

export default function IntroSplash({
  src,                 // URL of your video
  poster,              // optional image before play
  showOnce = true,     // only show the first time
  storageKey = "intro_seen_v1", // change this to re-show later
  autoHideMs = null,   // optional: force hide after X milliseconds
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef(null);

  const hide = () => {
    if (fading) return;
    setFading(true);
    if (showOnce) localStorage.setItem(storageKey, "1");
    setTimeout(() => setVisible(false), 400);
  };

  useEffect(() => {
    if (showOnce && localStorage.getItem(storageKey) === "1") {
      setVisible(false);
    }
  }, [showOnce, storageKey]);

  useEffect(() => {
    if (!autoHideMs || !visible) return;
    const t = setTimeout(hide, autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        playsInline
        onEnded={hide}
        className="w-full h-full object-contain"
      />
      <button
        onClick={hide}
        className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md border border-white/30"
      >
        Skip Intro
      </button>
    </div>
  );
}
