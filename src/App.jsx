import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  Globe,
  LogIn,
  LogOut,
  UploadCloud,
  Plus,
  Video,
  Film,
  Captions,
  Headphones,
  Settings,
  X,
  ChevronRight,
  ChevronLeft,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * LëtzView — Netflix/Disney-like front end:
 * - Series → Seasons → Episodes
 * - Language switcher
 * - Player with subtitles + multi-audio (external <audio> sync)
 * - Admin-only upload (localStorage for demo)
 */

// ------------------------- Simple i18n -------------------------
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
    admin: "Admin",
    login: "Log in",
    logout: "Log out",
    adminOnly: "Admin only",
    addSeries: "Add Series",
    addSeason: "Add Season",
    addEpisode: "Add Episode",
    title: "Title",
    description: "Description",
    posterUrl: "Poster URL",
    backdropUrl: "Backdrop URL (optional)",
    videoUrl: "Video URL (.mp4 / .m3u8)",
    subtitleUrl: "Subtitles (.vtt)",
    subtitleLang: "Subtitle language code",
    audioLabel: "Audio label (e.g., English)",
    audioUrl: "Audio URL (mp3/m4a)",
    language: "Language",
    interfaceLanguage: "Interface language",
    chooseLanguage: "Choose language",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    password: "Password",
    wrongPassword: "Wrong password",
    familyTagline: "Family-friendly streaming, simple and elegant",
    libraryEmpty: "Your library is empty. Add a series from Admin → Add Series.",
    deleteSeries: "Delete series",
    deleteEpisode: "Delete episode",
    confirmDeleteSeries: "Delete this series and all its seasons/episodes?",
    confirmDeleteEpisode: "Delete this episode?",
    editSeries: "Edit series",
    addSeasonHere: "Add Season (here)",
    seasonAdded: n => `Season ${n} added.`,
  },
  pt: {
    appName: "LëtzView",
    search: "Pesquisar",
    series: "Séries",
    seasons: "Temporadas",
    season: "Temporada",
    episodes: "Episódios",
    play: "Reproduzir",
    audio: "Áudio",
    subtitles: "Legendas",
    off: "Desligado",
    admin: "Admin",
    login: "Entrar",
    logout: "Sair",
    adminOnly: "Somente administrador",
    addSeries: "Adicionar Série",
    addSeason: "Adicionar Temporada",
    addEpisode: "Adicionar Episódio",
    title: "Título",
    description: "Descrição",
    posterUrl: "URL do poster",
    backdropUrl: "URL do backdrop (opcional)",
    videoUrl: "URL do vídeo (.mp4 / .m3u8)",
    subtitleUrl: "Legendas (.vtt)",
    subtitleLang: "Código do idioma da legenda",
    audioLabel: "Rótulo do áudio (ex.: Português)",
    audioUrl: "URL do áudio (mp3/m4a)",
    language: "Idioma",
    interfaceLanguage: "Idioma da interface",
    chooseLanguage: "Escolher idioma",
    confirm: "Confirmar",
    cancel: "Cancelar",
    save: "Guardar",
    password: "Palavra-passe",
    wrongPassword: "Palavra-passe incorreta",
    familyTagline: "Streaming para a família — simples e elegante",
    libraryEmpty: "A sua biblioteca está vazia. Adicione uma série em Admin → Adicionar Série.",
    deleteSeries: "Apagar série",
    deleteEpisode: "Apagar episódio",
    confirmDeleteSeries: "Apagar esta série e todas as temporadas/episódios?",
    confirmDeleteEpisode: "Apagar este episódio?",
    editSeries: "Editar série",
    addSeasonHere: "Adicionar Temporada (aqui)",
    seasonAdded: n => `Temporada ${n} adicionada.`,
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
    admin: "Admin",
    login: "Se connecter",
    logout: "Se déconnecter",
    adminOnly: "Administrateur uniquement",
    addSeries: "Ajouter une série",
    addSeason: "Ajouter une saison",
    addEpisode: "Ajouter un épisode",
    title: "Titre",
    description: "Description",
    posterUrl: "URL de l’affiche",
    backdropUrl: "URL du fond (facultatif)",
    videoUrl: "URL de la vidéo (.mp4 / .m3u8)",
    subtitleUrl: "Sous-titres (.vtt)",
    subtitleLang: "Code langue des sous-titres",
    audioLabel: "Libellé audio (ex.: Français)",
    audioUrl: "URL audio (mp3/m4a)",
    language: "Langue",
    interfaceLanguage: "Langue de l’interface",
    chooseLanguage: "Choisir la langue",
    confirm: "Confirmer",
    cancel: "Annuler",
    save: "Enregistrer",
    password: "Mot de passe",
    wrongPassword: "Mauvais mot de passe",
    familyTagline: "Streaming familial — simple et esthétique",
    libraryEmpty: "Votre bibliothèque est vide. Ajoutez une série via Admin → Ajouter une série.",
    deleteSeries: "Supprimer la série",
    deleteEpisode: "Supprimer l’épisode",
    confirmDeleteSeries: "Supprimer cette série et toutes ses saisons/épisodes ?",
    confirmDeleteEpisode: "Supprimer cet épisode ?",
    editSeries: "Modifier la série",
    addSeasonHere: "Ajouter une saison (ici)",
    seasonAdded: n => `Saison ${n} ajoutée.`,
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
    admin: "Admin",
    login: "Anmelden",
    logout: "Abmelden",
    adminOnly: "Nur Admin",
    addSeries: "Serie hinzufügen",
    addSeason: "Staffel hinzufügen",
    addEpisode: "Episode hinzufügen",
    title: "Titel",
    description: "Beschreibung",
    posterUrl: "Poster-URL",
    backdropUrl: "Backdrop-URL (optional)",
    videoUrl: "Video-URL (.mp4 / .m3u8)",
    subtitleUrl: "Untertitel (.vtt)",
    subtitleLang: "Untertitel-Sprachcode",
    audioLabel: "Audio-Bezeichnung (z. B. Deutsch)",
    audioUrl: "Audio-URL (mp3/m4a)",
    language: "Sprache",
    interfaceLanguage: "Interface-Sprache",
    chooseLanguage: "Sprache wählen",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    save: "Speichern",
    password: "Passwort",
    wrongPassword: "Falsches Passwort",
    familyTagline: "Familienfreundliches Streaming — schlicht & schön",
    libraryEmpty: "Ihre Bibliothek ist leer. Fügen Sie eine Serie über Admin → Serie hinzufügen hinzu.",
    deleteSeries: "Serie löschen",
    deleteEpisode: "Episode löschen",
    confirmDeleteSeries: "Diese Serie mit allen Staffeln/Episoden löschen?",
    confirmDeleteEpisode: "Diese Episode löschen?",
    editSeries: "Serie bearbeiten",
    addSeasonHere: "Staffel hinzufügen (hier)",
    seasonAdded: n => `Staffel ${n} hinzugefügt.`,
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
    admin: "Admin",
    login: "Aloggen",
    logout: "Ausloggen",
    adminOnly: "Nëmmen Admin",
    addSeries: "Serie derbäisetzen",
    addSeason: "Staffel derbäisetzen",
    addEpisode: "Episod derbäisetzen",
    title: "Titel",
    description: "Beschreiwung",
    posterUrl: "Poster-URL",
    backdropUrl: "Hannergrond-URL (optional)",
    videoUrl: "Video-URL (.mp4 / .m3u8)",
    subtitleUrl: "Ënnertitelen (.vtt)",
    subtitleLang: "Sproochcode vun den Ënnertitelen",
    audioLabel: "Audio-Label (z. B. Lëtzebuergesch)",
    audioUrl: "Audio-URL (mp3/m4a)",
    language: "Sprooch",
    interfaceLanguage: "Sprooch vun der Interface",
    chooseLanguage: "Sprooch wielen",
    confirm: "Confirméieren",
    cancel: "Ofbriechen",
    save: "Späicheren",
    password: "Passwuert",
    wrongPassword: "Falscht Passwuert",
    familyTagline: "Familljefrëndlecht Streaming — einfach & ästhetesch",
    libraryEmpty: "Deng Bibliothéik ass eidel. Setz eng Serie derbäi iwwer Admin → Serie derbäisetzen.",
    deleteSeries: "Serie läschen",
    deleteEpisode: "Episod läschen",
    confirmDeleteSeries: "Dës Serie mat alle Staffelen/Episoden läschen?",
    confirmDeleteEpisode: "Dës Episod läschen?",
    editSeries: "Serie änneren",
    addSeasonHere: "Staffel derbäisetzen (hei)",
    seasonAdded: n => `Staffel ${n} derbäigesat.`,
  },
};

// ------------------------- Demo storage -------------------------
const STORAGE_KEY = "letzview_db_v1"; // ASCII-safe key

function loadDB() {
  try {
    // migrate from old key once if present
    const old = localStorage.getItem("streamjoy_db_v1");
    if (old && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, old);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { series: [] };
  } catch {
    return { series: [] };
  }
}
function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ------------------------- Safe ID helper -------------------------
// Works even if crypto.randomUUID() is unavailable
const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

// ------------------------- UI Helpers -------------------------
const Section = ({ title, children, icon: Icon }) => (
  <section className="mt-8">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5" />}
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </section>
);

const PosterCard = ({ item, onClick }) => (
  <Card className="bg-white/5 hover:bg-white/10 transition rounded-2xl overflow-hidden cursor-pointer" onClick={onClick}>
    <div
      className="aspect-[2/3] w-40 md:w-44 lg:w-48 bg-white/5"
      style={{ backgroundImage: `url(${item.posterUrl || ""})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
    <CardContent className="p-3">
      <div className="text-sm font-medium line-clamp-2">{item.title}</div>
    </CardContent>
  </Card>
);

const Row = ({ title, items, onItem }) => {
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
          <PosterCard key={s.id} item={s} onClick={() => onItem(s)} />
        ))}
      </div>
    </div>
  );
};

// ------------------------- Player with multi-audio & subs -------------------------
function Player({ episode, t, onClose }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [audioSelection, setAudioSelection] = useState("video"); // "video" or index
  const [subSelection, setSubSelection] = useState("off"); // lang or "off"

  // Keep audio element synced to video when using external audio track
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
          {/* External audio element for alternate languages */}
          <audio ref={audioRef} src={audioSelection === "video" ? undefined : episode.audios?.[parseInt(audioSelection)]?.url} />

          <Button variant="secondary" size="icon" className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 border-white/20" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-black to-zinc-900">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-1">{episode.title}</h3>
            {episode.description && <p className="text-sm text-white/80">{episode.description}</p>}
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

// ------------------------- Admin Panels -------------------------
function AdminPanel({ db, setDB, t }) {
  const [openSeries, setOpenSeries] = useState(null);

  const addSeries = (s) => {
    const next = { ...db, series: [...db.series, { ...s, id: uid(), seasons: [] }] };
    setDB(next);
    saveDB(next);
  };
  const addSeason = (seriesId, number) => {
    const next = { ...db };
    const s = next.series.find((x) => x.id === seriesId);
    if (!s) return;
    s.seasons.push({ id: uid(), number, episodes: [] });
    setDB(next);
    saveDB(next);
  };
  const addEpisode = (seriesId, seasonId, ep) => {
    const next = { ...db };
    const s = next.series.find((x) => x.id === seriesId);
    const se = s?.seasons.find((x) => x.id === seasonId);
    if (!se) return;
    se.episodes.push({ id: uid(), ...ep });
    setDB(next);
    saveDB(next);
  };

  return (
    <div className="space-y-6">
      <Section title={`${t.addSeries}`} icon={Film}>
        <SeriesForm t={t} onSubmit={addSeries} />
      </Section>

      <Section title={`${t.addSeason} / ${t.addEpisode}`} icon={Video}>
        <div className="grid md:grid-cols-2 gap-6">
          <SeasonForm t={t} db={db} onSubmit={addSeason} onOpenSeries={setOpenSeries} />
          <EpisodeForm t={t} db={db} onSubmit={addEpisode} openSeries={openSeries} />
        </div>
      </Section>
    </div>
  );
}

function SeriesForm({ t, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");

  return (
    <div className="grid gap-3 p-4 rounded-2xl bg-white/5">
      <Input placeholder={t.title} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder={t.description} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input placeholder={t.posterUrl} value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
      <Input placeholder={t.backdropUrl} value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)} />
      <Button
        onClick={() => {
          if (!title) return;
          onSubmit({ title, description, posterUrl, backdropUrl });
          setTitle("");
          setDescription("");
          setPosterUrl("");
          setBackdropUrl("");
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> {t.addSeries}
      </Button>
    </div>
  );
}

function SeasonForm({ t, db, onSubmit, onOpenSeries }) {
  const [seriesId, setSeriesId] = useState("");
  const [number, setNumber] = useState(1);

  const series = db.series;

  return (
    <div className="grid gap-3 p-4 rounded-2xl bg-white/5">
      <Select
        value={seriesId}
        onValueChange={(v) => {
          setSeriesId(v);
          onOpenSeries(v);
        }}
      >
        <SelectTrigger className="bg-white/10 border-white/10">
          <SelectValue placeholder={t.series} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-white/10">
          {series.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="number" min={1} value={number} onChange={(e) => setNumber(parseInt(e.target.value || "1"))} placeholder={t.season} />
      <Button
        disabled={!seriesId}
        onClick={() => {
          if (!seriesId) return;
          onSubmit(seriesId, Number.isFinite(number) ? number : 1);
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> {t.addSeason}
      </Button>
    </div>
  );
}

function EpisodeForm({ t, db, onSubmit, openSeries }) {
  const [seriesId, setSeriesId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState(1);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [audios, setAudios] = useState([]); // {label,url}
  const [subtitles, setSubtitles] = useState([]); // {lang,url}

  useEffect(() => {
    if (openSeries) setSeriesId(openSeries);
  }, [openSeries]);

  const series = db.series;
  const seasons = series.find((s) => s.id === seriesId)?.seasons || [];

  const addAudio = () => setAudios((prev) => [...prev, { label: "", url: "" }]);
  const addSub = () => setSubtitles((prev) => [...prev, { lang: "en", url: "" }]);

  return (
    <div className="grid gap-3 p-4 rounded-2xl bg-white/5">
      <Select value={seriesId} onValueChange={setSeriesId}>
        <SelectTrigger className="bg-white/10 border-white/10">
          <SelectValue placeholder={t.series} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-white/10">
          {series.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={seasonId} onValueChange={setSeasonId}>
        <SelectTrigger className="bg-white/10 border-white/10">
          <SelectValue placeholder={t.season} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-white/10">
          {seasons.map((se) => (
            <SelectItem key={se.id} value={se.id}>
              {t.season} {se.number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder={`${t.title}`} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="number" min={1} placeholder="#" value={number} onChange={(e) => setNumber(parseInt(e.target.value || "1"))} />
      </div>
      <Input placeholder={t.description} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input placeholder={t.videoUrl} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />

      <div className="bg-white/5 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Headphones className="w-4 h-4" />
          <span className="font-medium">{t.audio}</span>
        </div>
        <div className="space-y-2">
          {audios.map((a, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder={t.audioLabel}
                value={a.label}
                onChange={(e) => setAudios((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))}
              />
              <Input
                placeholder={t.audioUrl}
                value={a.url}
                onChange={(e) => setAudios((prev) => prev.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addAudio}>
            <Plus className="w-4 h-4 mr-2" /> {t.audio}
          </Button>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Captions className="w-4 h-4" />
          <span className="font-medium">{t.subtitles}</span>
        </div>
        <div className="space-y-2">
          {subtitles.map((s, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder={t.subtitleLang}
                value={s.lang}
                onChange={(e) => setSubtitles((prev) => prev.map((x, i) => (i === idx ? { ...x, lang: e.target.value } : x)))}
              />
              <Input
                placeholder={t.subtitleUrl}
                value={s.url}
                onChange={(e) => setSubtitles((prev) => prev.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addSub}>
            <Plus className="w-4 h-4 mr-2" /> {t.subtitles}
          </Button>
        </div>
      </div>

      <Button
        disabled={!seriesId || !seasonId || !title || !videoUrl}
        onClick={() => {
          onSubmit(seriesId, seasonId, { title, number, description, videoUrl, audios, subtitles });
          setTitle("");
          setNumber(1);
          setDescription("");
          setVideoUrl("");
          setAudios([]);
          setSubtitles([]);
        }}
      >
        <UploadCloud className="w-4 h-4 mr-2" /> {t.addEpisode}
      </Button>
    </div>
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

  const [db, setDB] = useState(loadDB);
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState(() => localStorage.getItem("sj_admin") === "1");
  const [editingSeries, setEditingSeries] = useState(null);

  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  // Keep the open drawer in sync with latest DB (so new seasons appear immediately)
  useEffect(() => {
    if (!selectedSeries) return;
    const latest = db.series.find((s) => s.id === selectedSeries.id);
    if (latest) setSelectedSeries(latest);
  }, [db]); // run on any library change

  const filteredSeries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return db.series;
    return db.series.filter((s) => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [db, query]);

  const login = () => {
    const pw = prompt(`${t.password}`);
    if (pw === "admin") {
      setAdmin(true);
      localStorage.setItem("sj_admin", "1");
    } else alert(t.wrongPassword);
  };
  const logout = () => {
    setAdmin(false);
    localStorage.removeItem("sj_admin");
  };

  // -------- Delete helpers (ADMIN ONLY) --------
  const deleteSeries = (seriesId) => {
    if (!admin) return;
    if (!confirm(t.confirmDeleteSeries)) return;
    const next = { ...db, series: db.series.filter((s) => s.id !== seriesId) };
    setDB(next);
    saveDB(next);
    if (selectedSeries?.id === seriesId) setSelectedSeries(null);
    if (selectedEpisode) setSelectedEpisode(null);
  };

  const deleteEpisode = (seriesId, seasonId, episodeId) => {
    if (!admin) return;
    if (!confirm(t.confirmDeleteEpisode)) return;
    const next = { ...db };
    const s = next.series.find((x) => x.id === seriesId);
    const se = s?.seasons.find((x) => x.id === seasonId);
    if (!se) return;
    se.episodes = se.episodes.filter((ep) => ep.id !== episodeId);
    setDB(next);
    saveDB(next);
    if (selectedEpisode?.id === episodeId) setSelectedEpisode(null);
    if (selectedSeries?.id === seriesId) setSelectedSeries({ ...s }); // refresh drawer view
  };

  // -------- Add Season inline in the Series Drawer (ADMIN ONLY) --------
  const addSeasonInline = (seriesId) => {
    if (!admin) return;
    const next = { ...db };
    const s = next.series.find((x) => x.id === seriesId);
    if (!s) return;
    const max = s.seasons?.length ? Math.max(...s.seasons.map((se) => Number(se.number) || 0)) : 0;
    const newNumber = max + 1;
    if (!s.seasons) s.seasons = [];
    s.seasons.push({ id: uid(), number: newNumber, episodes: [] });
    setDB(next);
    saveDB(next);
    if (selectedSeries?.id === seriesId) setSelectedSeries({ ...s });
    // Friendly confirmation (non-blocking if browsers disable alerts)
    try { alert(MESSAGES[lang].seasonAdded(newNumber)); } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-rose-50 text-zinc-900">
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
              <SelectItem value="pt">PT</SelectItem>
              <SelectItem value="fr">FR</SelectItem>
              <SelectItem value="de">DE</SelectItem>
              <SelectItem value="lb">LB</SelectItem>
            </SelectContent>
          </Select>

          {/* Admin controls */}
          {admin ? (
            <Button variant="outline" className="ml-2" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> {t.logout}
            </Button>
          ) : (
            <Button variant="outline" className="ml-2" onClick={login}>
              <LogIn className="w-4 h-4 mr-2" /> {t.login}
            </Button>
          )}
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
              {admin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> {t.addSeries}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t.addSeries}</DialogTitle>
                    </DialogHeader>
                    <SeriesForm
                      t={t}
                      onSubmit={(s) => {
                        const next = { ...db, series: [...db.series, { ...s, id: uid(), seasons: [] }] };
                        setDB(next);
                        saveDB(next);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="hidden md:block">
              <div className="aspect-video rounded-2xl bg-white/40 border border-black/5" />
            </div>
          </div>
        </div>

        {/* Rows */}
        <Row title={t.series} items={filteredSeries} onItem={setSelectedSeries} />

        {/* Edit Series Dialog */}
        {editingSeries && (
          <Dialog open onOpenChange={(open) => { if (!open) setEditingSeries(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.editSeries}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 p-4 rounded-2xl bg-white/5">
                <Input placeholder={t.title} defaultValue={editingSeries.title} onChange={(e) => (editingSeries.title = e.target.value)} />
                <Input
                  placeholder={t.description}
                  defaultValue={editingSeries.description}
                  onChange={(e) => (editingSeries.description = e.target.value)}
                />
                <Input
                  placeholder={t.posterUrl}
                  defaultValue={editingSeries.posterUrl}
                  onChange={(e) => (editingSeries.posterUrl = e.target.value)}
                />
                <Input
                  placeholder={t.backdropUrl}
                  defaultValue={editingSeries.backdropUrl}
                  onChange={(e) => (editingSeries.backdropUrl = e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const next = { ...db };
                      const idx = next.series.findIndex((x) => x.id === editingSeries.id);
                      if (idx !== -1) {
                        next.series[idx] = { ...next.series[idx], ...editingSeries };
                        setDB(next);
                        saveDB(next);
                      }
                      setEditingSeries(null);
                    }}
                  >
                    {t.save}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSeries(null)}>
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Admin Section */}
        {admin && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{t.admin}</h2>
            </div>
            <AdminPanel
              db={db}
              setDB={(next) => {
                setDB(next);
                saveDB(next);
              }}
              t={t}
            />
          </section>
        )}
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
                    <h3 className="text-2xl font-bold mb-1">{selectedSeries.title}</h3>

                    {admin && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setEditingSeries(selectedSeries)}>
                          {t.editSeries}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => deleteSeries(selectedSeries.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          {t.deleteSeries}
                        </Button>
                        {/* NEW: Add season inline here */}
                        <Button
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => addSeasonInline(selectedSeries.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t.addSeasonHere}
                        </Button>
                      </div>
                    )}

                    {selectedSeries.description && <p className="text-zinc-700 mb-3">{selectedSeries.description}</p>}
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
                                        {ep.number}. {ep.title}
                                      </div>
                                      {ep.description && <div className="text-sm text-zinc-600 line-clamp-2">{ep.description}</div>}
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
                                      {admin && (
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteEpisode(selectedSeries.id, season.id, ep.id);
                                          }}
                                          title={t.deleteEpisode}
                                        >
                                          <Trash />
                                        </Button>
                                      )}
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
      {selectedEpisode && <Player episode={selectedEpisode} t={t} onClose={() => setSelectedEpisode(null)} />}

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
