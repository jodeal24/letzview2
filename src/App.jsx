// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Play, Globe, UploadCloud, Plus, Video, Film, Captions, Headphones,
  X, ChevronRight, ChevronLeft, Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import IntroSplash from "./IntroSplash";
import { fetchCatalog } from "./dataClient";

// ------------------------- i18n copy -------------------------
const MESSAGES = {
  en: {
    appName: "LëtzView",
    search: "Search",
    series: "Series",
    seasons: "Seasons",
    season: "Season",
    episodes: "Episodes",
    play: "Play",
    audio: "Audio",
    subtitles: "Subtitles",
    off: "Off",
    language: "Language",
    interfaceLanguage: "Interface language",
    familyTagline: "Family-friendly streaming, simple and elegant",
    libraryEmpty: "Your library is empty. Add a series from the admin.",
  },
  fr: {
    appName: "LëtzView",
    search: "Rechercher",
    series: "Séries",
    seasons: "Saisons",
    season: "Saison",
    episodes: "Épisodes",
    play: "Lecture",
    audio: "Audio",
    subtitles: "Sous-titres",
    off: "Désactivé",
    language: "Langue",
    interfaceLanguage: "Langue de l’interface",
    familyTagline: "Streaming familial — simple et esthétique",
    libraryEmpty: "Votre bibliothèque est vide. Ajoutez une série via l’admin.",
  },
  de: {
    appName: "LëtzView",
    search: "Suchen",
    series: "Serien",
    seasons: "Staffeln",
    season: "Staffel",
    episodes: "Episoden",
    play: "Abspielen",
    audio: "Audio",
    subtitles: "Untertitel",
    off: "Aus",
    language: "Sprache",
    interfaceLanguage: "Interface-Sprache",
    familyTagline: "Familienfreundliches Streaming — schlicht & schön",
    libraryEmpty: "Ihre Bibliothek ist leer. Fügen Sie eine Serie über Admin hinzu.",
  },
  lb: {
    appName: "LëtzView",
    search: "Sichen",
    series: "Serie(n)",
    seasons: "Staffelen",
    season: "Staffel",
    episodes: "Episoden",
    play: "Ofspillen",
    audio: "Audio",
    subtitles: "Ënnertitelen",
    off: "Aus",
    language: "Sprooch",
    interfaceLanguage: "Sprooch vun der Interface",
    familyTagline: "Familljefrëndlecht Streaming — einfach & ästhetesch",
    libraryEmpty: "Deng Bibliothéik ass eidel. Setz eng Serie derbäi via Admin.",
  },
};

// ------------------------- translation helper -------------------------
// Return the best string for the current lang with fallbacks.
// Works with both legacy strings and new {en:"", fr:""} objects.
function tx(val, lang = "en") {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || Object.values(val)[0] || "";
}

// ------------------------- helpers -------------------------
const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

// ------------------------- UI bits -------------------------
const Section = ({ title, children, icon: Icon }) => (
  <section className="mt-8">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5" />}
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </section>
);

const PosterCard = ({ item, onClick, lang }) => (
  <Card className="bg-white/5 hover:bg-white/10 transition rounded-2xl overflow-hidden cursor-pointer" onClick={onClick}>
    <div
      className="aspect-[2/3] w-40 md:w-44 lg:w-48 bg-white/5"
      style={{ backgroundImage: `url(${item.posterUrl || ""})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
    <CardContent className="p-3">
      <div className="text-sm font-medium line-clamp-2">{tx(item.title, lang)}</div>
    </CardContent>
  </Card>
);

const Row = ({ title, items, onItem, lang }) => {
  const scrollRef = useRef(null);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" })}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" })}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2">
        {items.map((s) => (
          <PosterCard key={s.id} item={s} onClick={() => onItem(s)} lang={lang} />
        ))}
      </div>
    </div>
  );
};

// ------------------------- Hero Carousel (poster-only) -------------------------
function HeroCarousel({ items = [], onClickItem, lang }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!items?.length || items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  const go = (next) => {
    if (!items?.length) return;
    setI((v) => (v + next + items.length) % items.length);
  };

  const current = items[i];

  return (
    <div className="relative aspect-video rounded-2xl border border-black/5 overflow-hidden bg-white/40">
      <motion.button
        key={current?.id || "empty"}
        onClick={() => current && onClickItem?.(current)}
        className="w-full h-full"
        initial={{ opacity: 0.3, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{
          // 🔒 Poster-first, never use backdrop
          backgroundImage: current?.posterUrl ? `url(${current.posterUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label={tx(current?.title, lang) || "series"}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
        <div className="absolute left-4 bottom-4 right-4 text-left">
          <div className="inline-block px-2 py-1 rounded-md text-xs md:text-sm bg-black/40 text-white">
            {items.length ? `${i + 1}/${items.length}` : "—"}
          </div>
          {current?.title && (
            <div className="mt-2 text-white font-semibold text-lg md:text-2xl drop-shadow">
              {tx(current.title, lang)}
            </div>
          )}
        </div>
      </motion.button>

      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60"
            onClick={() => go(1)}
            aria-label="Next"
          >
            <ChevronRight />
          </Button>
        </>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-black/70" : "w-2 bg-black/30"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------- Player -------------------------
function Player({ episode, t, onClose, lang }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [audioSelection, setAudioSelection] = useState("video");
  const [subSelection, setSubSelection] = useState("off");

  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a) return;

    const sync = () => {
      if (Math.abs(a.currentTime - v.currentTime) > 0.3) a.currentTime = v.currentTime;
      if (v.paused && !a.paused) a.pause();
      if (!v.paused && a.paused) a.play().catch(() => {});
    };

    const onPlay = () => { if (audioSelection !== "video") a.play().catch(() => {}); };
    const onPause = () => { if (audioSelection !== "video") a.pause(); };
    const onSeek = () => { if (audioSelection !== "video") a.currentTime = v.currentTime; };

    const int = setInterval(sync, 500);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeking", onSeek);
    v.addEventListener("ratechange", () => { if (audioSelection !== "video") a.playbackRate = v.playbackRate; });

    return () => {
      clearInterval(int);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeking", onSeek);
    };
  }, [audioSelection]);

  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v || !a) return;
    if (audioSelection === "video") {
      v.muted = false;
      a.pause();
    } else {
      v.muted = true;
      a.currentTime = v.currentTime;
      a.playbackRate = v.playbackRate;
      if (!v.paused) a.play().catch(() => {});
    }
  }, [audioSelection]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black text-white">
        <div className="relative">
          <video ref={videoRef} className="w-full bg-black" controls poster={episode.backdropUrl || episode.posterUrl}>
            <source src={episode.videoUrl} />
            {episode.subtitles?.filter((s) => s.lang === subSelection).map((s, idx) => (
              <track key={idx} label={s.lang} kind="subtitles" srcLang={s.lang} src={s.url} default />
            ))}
          </video>
          <audio ref={audioRef} src={audioSelection === "video" ? undefined : episode.audios?.[parseInt(audioSelection)]?.url} />
          <Button variant="secondary" size="icon" className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 border-white/20" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-black to-zinc-900">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-1">{tx(episode.title, lang)}</h3>
            {episode.description && <p className="text-sm text-white/80">{tx(episode.description, lang)}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              <span className="text-sm w-24">{t.audio}</span>
              <Select value={audioSelection} onValueChange={setAudioSelection}>
                <SelectTrigger className="bg-white/10 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="video">
                    {t.off} ({t.audio} in video)
                  </SelectItem>
                  {episode.audios?.map((a, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Captions className="w-4 h-4" />
              <span className="text-sm w-24">{t.subtitles}</span>
              <Select value={subSelection} onValueChange={setSubSelection}>
                <SelectTrigger className="bg-white/10 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10">
                  <SelectItem value="off">{t.off}</SelectItem>
                  {episode.subtitles?.map((s, idx) => (
                    <SelectItem key={idx} value={s.lang}>
                      {s.lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------- Main App -------------------------
export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("sj_lang") || "en");
  const t = MESSAGES[lang] || MESSAGES.en;
  useEffect(() => {
    localStorage.setItem("sj_lang", lang);
    document.title = t.appName || "LëtzView";
  }, [lang, t.appName]);

  // Firestore catalog
  const [db, setDB] = useState({ series: [] });
  useEffect(() => {
    fetchCatalog()
      .then((list) => setDB({ series: Array.isArray(list) ? list : [] }))
      .catch(console.error);
  }, []);

  const [query, setQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    if (!selectedSeries) return;
    // refresh selectedSeries reference with latest db data
    const latest = db.series.find((s) => s.id === selectedSeries.id);
    if (latest) setSelectedSeries(latest);
  }, [db, selectedSeries]);

  const filteredSeries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return db.series;
    return db.series.filter((s) => {
      const title = tx(s.title, lang).toLowerCase();
      const desc = tx(s.description, lang)?.toLowerCase?.() || "";
      return title.includes(q) || desc.includes(q);
    });
  }, [db, query, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-rose-50 text-zinc-900">
      {/* 🎬 Intro video overlay (plays once, fades out) */}
      <IntroSplash
        src="https://storage.googleapis.com/letzview-media/Intro%20Video.mp4" // ← your video URL
        poster="/logo.png"
        showOnce={true}
        storageKey="intro_seen_v4"
        fadeDurationMs={800}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/60 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="LëtzView logo" className="w-20 h-20 rounded-2xl object-contain" />
            <div>
              <div className="text-xl font-bold tracking-tight">{t.appName}</div>
              <div className="text-xs text-zinc-600">{t.familyTagline}</div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2 mr-2">
            <div className="relative w-64">
              <Input className="pl-8" placeholder={t.search + "…"} value={query} onChange={(e) => setQuery(e.target.value)} />
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>

          {/* Language Switcher */}
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-[110px] bg-white/80 border-black/10">
              <Globe className="w-4 h-4 mr-1" />
              <SelectValue placeholder={t.language} />
            </SelectTrigger>
            <SelectContent className="bg-white border-black/10">
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="fr">FR</SelectItem>
              <SelectItem value="de">DE</SelectItem>
              <SelectItem value="lb">LB</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero / Featured Row */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 border border-black/5 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.series}</h1>
              <p className="text-zinc-700 mb-4">{db.series.length ? "" : t.libraryEmpty}</p>
            </div>
            <div className="block">
              <HeroCarousel items={db.series} onClickItem={setSelectedSeries} lang={lang} />
            </div>
          </div>
        </div>

        {/* Rows */}
        <Row title={t.series} items={filteredSeries} onItem={setSelectedSeries} lang={lang} />
      </main>

      {/* Series Drawer */}
      <AnimatePresence>
        {selectedSeries && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-30 flex">
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="ml-auto h-full w-full max-w-3xl bg-white rounded-l-2xl overflow-y-auto"
            >
              <div className="relative">
                {selectedSeries.backdropUrl ? (
                  <div
                    className="h-48 md:h-64 w-full"
                    style={{ backgroundImage: `url(${selectedSeries.backdropUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                ) : (
                  <div className="h-48 md:h-64 w-full bg-gradient-to-br from-indigo-100 to-sky-100" />
                )}
                <Button variant="secondary" size="icon" className="absolute top-3 right-3" onClick={() => setSelectedSeries(null)}>
                  <X />
                </Button>
              </div>
              <div className="p-5">
                <div className="flex gap-4">
                  <div
                    className="w-28 flex-shrink-0 rounded-xl overflow-hidden"
                    style={{ backgroundImage: `url(${selectedSeries.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <div className="aspect-[2/3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{tx(selectedSeries.title, lang)}</h3>
                    {tx(selectedSeries.description, lang) && <p className="text-zinc-700 mb-3">{tx(selectedSeries.description, lang)}</p>}

                    <div className="space-y-5">
                      {selectedSeries.seasons?.sort((a, b) => a.number - b.number).map((season) => (
                        <div key={season.id}>
                          <div className="font-semibold mb-2">
                            {t.season} {season.number}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {season.episodes?.sort((a, b) => a.number - b.number).map((ep) => (
                              <Card
                                key={ep.id}
                                className="bg-white/60 hover:bg-white/80 transition cursor-pointer"
                                onClick={() => setSelectedEpisode(ep)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-16 h-10 rounded bg-gradient-to-br from-indigo-200 to-sky-200" />
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {ep.number}. {tx(ep.title, lang)}
                                      </div>
                                      {ep.description && <div className="text-sm text-zinc-600 line-clamp-2">{tx(ep.description, lang)}</div>}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEpisode(ep);
                                        }}
                                        title={t.play}
                                      >
                                        <Play />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Modal */}
      {selectedEpisode && <Player episode={selectedEpisode} t={t} lang={lang} onClose={() => setSelectedEpisode(null)} />}

      <footer className="border-t border-black/5 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-zinc-600 flex items-center justify-between">
          <div>© {new Date().getFullYear()} LëtzView</div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t.interfaceLanguage}: {lang.toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  );
}
