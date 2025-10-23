// src/Admin.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Video, Pencil } from "lucide-react";
import { fetchCatalog, saveSeries, db } from "./dataClient";
import { login, observeAuth, logout } from "./authClient";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { translateText } from "./translateClient"; // requires /api/translate + env var on Vercel

/* ----------------- helpers ----------------- */

// unique id
const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

// language used for inputs in admin (we reuse the viewer’s choice)
const inputLang =
  (typeof window !== "undefined" && localStorage.getItem("sj_lang")) || "en";

// wrap a plain string into a language map
function asLangMap(input, lang = "en") {
  if (!input) return {};
  if (typeof input === "object") return input;
  return { [lang]: String(input) };
}

// read a language-specific value from map or string
function getLang(val, lang = "en") {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || "";
}

// set/merge language value into a map
function setLang(mapOrString, lang, value) {
  const m =
    typeof mapOrString === "object" && mapOrString !== null ? { ...mapOrString } : {};
  if (value?.trim()) m[lang] = value.trim();
  return m;
}

/* ----------------- Admin Root ----------------- */

export default function Admin() {
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);

  // new series form
  const [newTitle, setNewTitle] = useState("");
  const [newPoster, setNewPoster] = useState("");
  const [newBackdrop, setNewBackdrop] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => observeAuth(setUser), []);
  useEffect(() => {
    fetchCatalog().then(setSeries).catch(console.error);
  }, []);

  // ---------- Series CRUD ----------
  const handleAddSeries = async () => {
    if (!newTitle.trim()) return alert("Title required.");
    const s = {
      id: uid(),
      title: asLangMap(newTitle, inputLang),
      description: asLangMap(newDesc, inputLang),
      posterUrl: newPoster.trim(),
      backdropUrl: newBackdrop.trim(),
      seasons: [],
    };
    await saveSeries(s);
    setSeries((prev) => [...prev, s]);
    setNewTitle("");
    setNewDesc("");
    setNewPoster("");
    setNewBackdrop("");
  };

  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Delete this series and all of its seasons/episodes?")) return;
    await deleteDoc(doc(collection(db, "series"), id));
    setSeries((prev) => prev.filter((x) => x.id !== id));
  };

  const updateSeriesLocal = async (patched) => {
    await saveSeries(patched);
    setSeries((prev) => prev.map((s) => (s.id === patched.id ? patched : s)));
  };

  // ---------- Season helpers ----------
  const addSeason = async (seriesId) => {
    const next = structuredClone(series);
    const s = next.find((x) => x.id === seriesId);
    if (!s) return;
    const max = s.seasons?.length ? Math.max(...s.seasons.map((se) => Number(se.number) || 0)) : 0;
    const newSeason = { id: uid(), number: max + 1, episodes: [] };
    s.seasons = [...(s.seasons || []), newSeason];
    await saveSeries(s);
    setSeries(next);
  };

  // ---------- Episode helpers ----------
  const addEpisode = async (seriesId, seasonId, ep) => {
    const next = structuredClone(series);
    const s = next.find((x) => x.id === seriesId);
    const se = s?.seasons?.find((x) => x.id === seasonId);
    if (!se) return;
    se.episodes = [...(se.episodes || []), { id: uid(), ...ep }];
    await saveSeries(s);
    setSeries(next);
  };

  const patchEpisode = async (seriesId, seasonId, episodeId, patch) => {
    const next = structuredClone(series);
    const s = next.find((x) => x.id === seriesId);
    const se = s?.seasons?.find((x) => x.id === seasonId);
    if (!se) return;
    se.episodes = se.episodes.map((ep) => (ep.id === episodeId ? { ...ep, ...patch } : ep));
    await saveSeries(s);
    setSeries(next);
  };

  const deleteEpisode = async (seriesId, seasonId, episodeId) => {
    if (!window.confirm("Delete this episode?")) return;
    const next = structuredClone(series);
    const s = next.find((x) => x.id === seriesId);
    const se = s?.seasons?.find((x) => x.id === seasonId);
    if (!se) return;
    se.episodes = (se.episodes || []).filter((ep) => ep.id !== episodeId);
    await saveSeries(s);
    setSeries(next);
  };

  // ---------- Login view ----------
  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
        <form
          className="flex flex-col gap-3 w-64"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const email = e.target.email.value.trim();
            const password = e.target.password.value.trim();
            if (!email || !password) return alert("Please fill in both fields.");
            try {
              await login(email, password);
            } catch (err) {
              setError(err.code || err.message);
            }
          }}
        >
          <Input type="email" name="email" placeholder="Email" required />
          <Input type="password" name="password" placeholder="Password" required />
          <Button type="submit">Login</Button>
          {error && (
            <div className="text-red-600 text-sm text-center mt-2">
              {String(error).replace("Firebase:", "").trim()}
            </div>
          )}
        </form>
      </div>
    );

  // ---------- Admin UI ----------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      {/* Add Series */}
      <div className="grid gap-3 p-4 rounded-2xl bg-white/5 mb-8">
        <h3 className="text-lg font-semibold mb-2">Add New Series ({inputLang.toUpperCase()})</h3>
        <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        <Input placeholder="Poster URL" value={newPoster} onChange={(e) => setNewPoster(e.target.value)} />
        <Input placeholder="Backdrop URL (optional)" value={newBackdrop} onChange={(e) => setNewBackdrop(e.target.value)} />
        <Button onClick={handleAddSeries}><Plus className="w-4 h-4 mr-2" /> Add Series</Button>
      </div>

      {/* Existing Series */}
      <h3 className="text-lg font-semibold mb-3">Existing Series</h3>
      <div className="space-y-5">
        {series.map((s) => (
          <SeriesCard
            key={s.id}
            series={s}
            onSaveSeries={updateSeriesLocal}
            onAddSeason={() => addSeason(s.id)}
            onAddEpisode={(seasonId, ep) => addEpisode(s.id, seasonId, ep)}
            onEditEpisode={(seasonId, epId, patch) => patchEpisode(s.id, seasonId, epId, patch)}
            onDeleteEpisode={(seasonId, epId) => deleteEpisode(s.id, seasonId, epId)}
            onDeleteSeries={() => handleDeleteSeries(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Child components -------------------- */

function SeriesCard({
  series,
  onSaveSeries,
  onAddSeason,
  onAddEpisode,
  onEditEpisode,
  onDeleteEpisode,
  onDeleteSeries,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(series);

  // Add-episode form state
  const [seasonForEp, setSeasonForEp] = useState(series.seasons?.[0]?.id || "");
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState(1);
  const [epDesc, setEpDesc] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epAudios, setEpAudios] = useState([]); // [{label,url}]
  const [epSubs, setEpSubs] = useState([]); // [{lang,url}]

  useEffect(() => setDraft(series), [series]);
  useEffect(() => {
    if (!seasonForEp && series.seasons?.length) setSeasonForEp(series.seasons[0].id);
  }, [series.seasons, seasonForEp]);

  const startEdit = () => { setEditing(true); setDraft(series); };
  const cancelEdit = () => { setEditing(false); setDraft(series); };

  const saveEdit = async () => {
    const clean = {
      ...draft,
      title: asLangMap(draft.title, inputLang),
      description: asLangMap(draft.description, inputLang),
      posterUrl: (draft.posterUrl || "").trim(),
      backdropUrl: (draft.backdropUrl || "").trim(),
    };
    await onSaveSeries(clean);
    setEditing(false);
  };

  const autoTranslateSeries = async () => {
    try {
      const targets = ["fr", "de", "lb"].filter((t) => t !== inputLang);
      const baseTitle = getLang(draft.title, inputLang) || (typeof draft.title === "string" ? draft.title : "");
      const baseDesc  = getLang(draft.description, inputLang) || (typeof draft.description === "string" ? draft.description : "");

      if (!baseTitle && !baseDesc) {
        alert(`Nothing to translate. Fill ${inputLang.toUpperCase()} fields first.`);
        return;
      }

      const updates = { ...draft };

      for (const t of targets) {
        if (baseTitle && !getLang(updates.title, t)) {
          const tt = await translateText(baseTitle, t, inputLang);
          updates.title = setLang(updates.title, t, tt);
        }
        if (baseDesc && !getLang(updates.description, t)) {
          const td = await translateText(baseDesc, t, inputLang);
          updates.description = setLang(updates.description, t, td);
        }
      }

      setDraft(updates);
      alert("Auto-translation filled missing languages (FR/DE/LB).");
    } catch (e) {
      alert(`Translate failed: ${e.message || e}`);
    }
  };

  const addEpisodeLocal = () => {
    if (!seasonForEp) return alert("Choose a season first.");
    if (!epTitle || !epVideo) return alert("Episode title and video URL are required.");
    onAddEpisode(seasonForEp, {
      title: asLangMap(epTitle, inputLang),
      number: Number(epNumber) || 1,
      description: asLangMap(epDesc, inputLang),
      videoUrl: epVideo.trim(),
      audios: epAudios.filter(a => a.label && a.url).map(a => ({ label: a.label.trim(), url: a.url.trim() })),
      subtitles: epSubs.filter(s => s.lang && s.url).map(s => ({ lang: s.lang.trim(), url: s.url.trim() })),
    });
    setEpTitle(""); setEpNumber(1); setEpDesc(""); setEpVideo(""); setEpAudios([]); setEpSubs([]);
  };

  return (
    <div className="p-4 rounded-2xl border border-black/10 bg-white/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 mr-3">
            <Input placeholder="Title" value={getLang(draft.title, inputLang)} onChange={(e) => setDraft({ ...draft, title: setLang(draft.title, inputLang, e.target.value) })} />
            <Input placeholder="Poster URL" value={draft.posterUrl || ""} onChange={(e) => setDraft({ ...draft, posterUrl: e.target.value })} />
            <Input placeholder="Backdrop URL" value={draft.backdropUrl || ""} onChange={(e) => setDraft({ ...draft, backdropUrl: e.target.value })} />
            <Input placeholder="Description" value={getLang(draft.description, inputLang)} onChange={(e) => setDraft({ ...draft, description: setLang(draft.description, inputLang, e.target.value) })} />
          </div>
        ) : (
          <div className="font-semibold text-lg">
            {getLang(series.title, inputLang) || (typeof series.title === "string" ? series.title : "")}
          </div>
        )}

        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={autoTranslateSeries}>Auto-translate (FR/DE/LB)</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={onDeleteSeries}>
                <Trash className="w-4 h-4 mr-2" /> Delete series
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Backdrop preview */}
      {series.backdropUrl && !editing && (
        <div
          className="mb-3 h-28 rounded-lg bg-cover bg-center border border-black/10"
          style={{ backgroundImage: `url(${series.backdropUrl})` }}
          title="Backdrop"
        />
      )}

      {/* Seasons */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Seasons</div>
          <Button variant="outline" onClick={onAddSeason}><Plus className="w-4 h-4 mr-2" /> Add Season</Button>
        </div>
        {(!series.seasons || series.seasons.length === 0) && <div className="text-sm text-zinc-600">No seasons yet.</div>}
        <div className="space-y-3">
          {series.seasons?.slice().sort((a, b) => a.number - b.number).map((se) => (
            <SeasonBlock
              key={se.id}
              season={se}
              onEditEpisode={(epId, patch) => onEditEpisode(se.id, epId, patch)}
              onDeleteEpisode={(epId) => onDeleteEpisode(se.id, epId)}
            />
          ))}
        </div>
      </div>

      {/* Add episode */}
      {series.seasons?.length > 0 && (
        <div className="p-3 rounded-xl bg-white/80 border border-black/10">
          <div className="flex items-center gap-2 mb-3 font-medium"><Video className="w-4 h-4" /> Add Episode ({inputLang.toUpperCase()})</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <select className="border rounded px-3 py-2 text-sm bg-white" value={seasonForEp} onChange={(e) => setSeasonForEp(e.target.value)}>
              <option value="">Select season…</option>
              {series.seasons?.slice().sort((a, b) => a.number - b.number).map((se) => (
                <option key={se.id} value={se.id}>Season {se.number}</option>
              ))}
            </select>
            <Input type="number" min={1} placeholder="Episode #" value={epNumber} onChange={(e) => setEpNumber(parseInt(e.target.value || "1"))} />
          </div>

          <Input className="mb-2" placeholder="Episode title" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
          <Input className="mb-2" placeholder="Description" value={epDesc} onChange={(e) => setEpDesc(e.target.value)} />
          <Input className="mb-3" placeholder="Video URL (.mp4 / .m3u8)" value={epVideo} onChange={(e) => setEpVideo(e.target.value)} />

          {/* Audios */}
          <div className="mb-3">
            <div className="font-medium mb-2">Audios</div>
            {epAudios.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input placeholder="Label (e.g., English)" value={a.label} onChange={(e) => setEpAudios(prev => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} />
                <Input placeholder="Audio URL (mp3/m4a)" value={a.url} onChange={(e) => setEpAudios(prev => prev.map((x, i) => i === idx ? { ...x, url: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" onClick={() => setEpAudios(prev => [...prev, { label: "", url: "" }])}><Plus className="w-4 h-4 mr-2" /> Add audio</Button>
          </div>

          {/* Subtitles */}
          <div className="mb-3">
            <div className="font-medium mb-2">Subtitles</div>
            {epSubs.map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input placeholder="Lang (e.g., en, fr)" value={s.lang} onChange={(e) => setEpSubs(prev => prev.map((x, i) => i === idx ? { ...x, lang: e.target.value } : x))} />
                <Input placeholder="Subtitle URL (.vtt)" value={s.url} onChange={(e) => setEpSubs(prev => prev.map((x, i) => i === idx ? { ...x, url: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" onClick={() => setEpSubs(prev => [...prev, { lang: "", url: "" }])}><Plus className="w-4 h-4 mr-2" /> Add subtitle</Button>
          </div>

          <Button onClick={addEpisodeLocal}><Plus className="w-4 h-4 mr-2" /> Add Episode</Button>
        </div>
      )}
    </div>
  );
}

function SeasonBlock({ season, onEditEpisode, onDeleteEpisode }) {
  const [openId, setOpenId] = useState(null); // episode being edited

  return (
    <div className="p-3 rounded-xl bg-white/70 border border-black/10">
      <div className="font-medium mb-2">Season {season.number}</div>
      {(!season.episodes || season.episodes.length === 0) && <div className="text-sm text-zinc-600">No episodes yet.</div>}

      <div className="space-y-2">
        {season.episodes?.slice().sort((a, b) => a.number - b.number).map((ep) => (
          <EpisodeRow
            key={ep.id}
            ep={ep}
            open={openId === ep.id}
            setOpen={() => setOpenId(openId === ep.id ? null : ep.id)}
            onEdit={(patch) => onEditEpisode(ep.id, patch)}
            onDelete={() => onDeleteEpisode(ep.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EpisodeRow({ ep, onEdit, onDelete, open, setOpen }) {
  const [draft, setDraft] = useState(ep);
  useEffect(() => setDraft(ep), [ep]);

  const save = async () => {
    const clean = {
      ...draft,
      title: asLangMap(draft.title, inputLang),
      description: asLangMap(draft.description, inputLang),
      number: Number(draft.number) || 1,
      videoUrl: (draft.videoUrl || "").trim(),
      audios: (draft.audios || []).filter(a => a.label && a.url).map(a => ({ label: a.label.trim(), url: a.url.trim() })),
      subtitles: (draft.subtitles || []).filter(s => s.lang && s.url).map(s => ({ lang: s.lang.trim(), url: s.url.trim() })),
    };
    await onEdit(clean);
    setOpen(false);
  };

  const autoTranslateEpisode = async () => {
    try {
      const targets = ["fr", "de", "lb"].filter((t) => t !== inputLang);

      const baseTitle = getLang(draft.title, inputLang) || (typeof draft.title === "string" ? draft.title : "");
      const baseDesc  = getLang(draft.description, inputLang) || (typeof draft.description === "string" ? draft.description : "");

      if (!baseTitle && !baseDesc) {
        alert(`Nothing to translate. Fill ${inputLang.toUpperCase()} fields first.`);
        return;
      }

      const updates = { ...draft };

      for (const t of targets) {
        if (baseTitle && !getLang(updates.title, t)) {
          const tt = await translateText(baseTitle, t, inputLang);
          updates.title = setLang(updates.title, t, tt);
        }
        if (baseDesc && !getLang(updates.description, t)) {
          const td = await translateText(baseDesc, t, inputLang);
          updates.description = setLang(updates.description, t, td);
        }
      }

      setDraft(updates);
      alert("Episode translations filled (FR/DE/LB).");
    } catch (e) {
      alert(`Translate failed: ${e.message || e}`);
    }
  };

  return (
    <div className="p-2 rounded-lg bg-white border border-black/10">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">
            {(ep.number || 1)}. {getLang(ep.title, inputLang) || (typeof ep.title === "string" ? ep.title : "")}
          </span>
          {ep.description && (
            <span className="text-zinc-600"> — {getLang(ep.description, inputLang) || (typeof ep.description === "string" ? ep.description : "")}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={setOpen}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={onDelete}>
            <Trash className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              type="number"
              min={1}
              value={draft.number || 1}
              onChange={(e) => setDraft({ ...draft, number: parseInt(e.target.value || "1") })}
            />
            <Input
              placeholder={`Title (${inputLang.toUpperCase()})`}
              value={getLang(draft.title, inputLang)}
              onChange={(e) => setDraft({ ...draft, title: setLang(draft.title, inputLang, e.target.value) })}
            />
            <Input
              placeholder="Video URL"
              value={draft.videoUrl || ""}
              onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
            />
          </div>
          <Input
            placeholder={`Description (${inputLang.toUpperCase()})`}
            value={getLang(draft.description, inputLang)}
            onChange={(e) => setDraft({ ...draft, description: setLang(draft.description, inputLang, e.target.value) })}
          />

          {/* Audios edit */}
          <div>
            <div className="font-medium mb-1">Audios</div>
            {(draft.audios || []).map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input placeholder="Label" value={a.label} onChange={(e) => setDraft({ ...draft, audios: draft.audios.map((x, i) => i === idx ? { ...x, label: e.target.value } : x) })} />
                <Input placeholder="Audio URL" value={a.url} onChange={(e) => setDraft({ ...draft, audios: draft.audios.map((x, i) => i === idx ? { ...x, url: e.target.value } : x) })} />
              </div>
            ))}
            <Button variant="outline" onClick={() => setDraft({ ...draft, audios: [...(draft.audios || []), { label: "", url: "" }] })}><Plus className="w-4 h-4 mr-2" /> Add audio</Button>
          </div>

          {/* Subtitles edit */}
          <div>
            <div className="font-medium mb-1">Subtitles</div>
            {(draft.subtitles || []).map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input placeholder="Lang" value={s.lang} onChange={(e) => setDraft({ ...draft, subtitles: draft.subtitles.map((x, i) => i === idx ? { ...x, lang: e.target.value } : x) })} />
                <Input placeholder="Subtitle URL (.vtt)" value={s.url} onChange={(e) => setDraft({ ...draft, subtitles: draft.subtitles.map((x, i) => i === idx ? { ...x, url: e.target.value } : x) })} />
              </div>
            ))}
            <Button variant="outline" onClick={() => setDraft({ ...draft, subtitles: [...(draft.subtitles || []), { lang: "", url: "" }] })}><Plus className="w-4 h-4 mr-2" /> Add subtitle</Button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={autoTranslateEpisode}>Auto-translate (FR/DE/LB)</Button>
            <Button onClick={save}>Save episode</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
