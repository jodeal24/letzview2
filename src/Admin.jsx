// src/Admin.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Video } from "lucide-react";
import { fetchCatalog, saveSeries, db } from "./dataClient";
import { login, observeAuth, logout } from "./authClient";
import { collection, doc, deleteDoc } from "firebase/firestore";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);

  // new-series form
  const [newTitle, setNewTitle] = useState("");
  const [newPoster, setNewPoster] = useState("");
  const [newBackdrop, setNewBackdrop] = useState(""); // 👈 Backdrop
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = observeAuth(setUser);
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    fetchCatalog().then(setSeries).catch(console.error);
  }, []);

  // ---------- Series CRUD ----------
  const handleAddSeries = async () => {
    if (!newTitle.trim()) return alert("Title required.");
    const s = {
      id: uid(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      posterUrl: newPoster.trim(),
      backdropUrl: newBackdrop.trim(), // 👈 saved
      seasons: [],
    };
    await saveSeries(s);
    setSeries((prev) => [...prev, s]);
    setNewTitle("");
    setNewDesc("");
    setNewPoster("");
    setNewBackdrop(""); // reset
  };

  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Delete this series and all of its seasons/episodes?")) return;
    await deleteDoc(doc(collection(db, "series"), id));
    setSeries((prev) => prev.filter((x) => x.id !== id));
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
    alert(`Season ${newSeason.number} added.`);
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
              console.error(err);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Add Series */}
      <div className="grid gap-3 p-4 rounded-2xl bg-white/5 mb-8">
        <h3 className="text-lg font-semibold mb-2">Add New Series</h3>
        <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        <Input placeholder="Poster URL" value={newPoster} onChange={(e) => setNewPoster(e.target.value)} />
        <Input placeholder="Backdrop URL (optional)" value={newBackdrop} onChange={(e) => setNewBackdrop(e.target.value)} />
        <Button onClick={handleAddSeries}>
          <Plus className="w-4 h-4 mr-2" /> Add Series
        </Button>
      </div>

      {/* Existing Series */}
      <h3 className="text-lg font-semibold mb-3">Existing Series</h3>
      <div className="space-y-5">
        {series.map((s) => (
          <SeriesCard
            key={s.id}
            series={s}
            onAddSeason={() => addSeason(s.id)}
            onAddEpisode={(seasonId, ep) => addEpisode(s.id, seasonId, ep)}
            onDeleteEpisode={(seasonId, epId) => deleteEpisode(s.id, seasonId, epId)}
            onDeleteSeries={() => handleDeleteSeries(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Child components -------------------- */

function SeriesCard({ series, onAddSeason, onAddEpisode, onDeleteEpisode, onDeleteSeries }) {
  const [seasonForEp, setSeasonForEp] = useState(series.seasons?.[0]?.id || "");
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState(1);
  const [epDesc, setEpDesc] = useState("");
  const [epVideo, setEpVideo] = useState("");

  useEffect(() => {
    if (!seasonForEp && series.seasons?.length) {
      setSeasonForEp(series.seasons[0].id);
    }
  }, [series.seasons, seasonForEp]);

  const addEpisodeLocal = () => {
    if (!seasonForEp) return alert("Choose a season first.");
    if (!epTitle || !epVideo) return alert("Episode title and video URL are required.");
    onAddEpisode(seasonForEp, {
      title: epTitle.trim(),
      number: Number(epNumber) || 1,
      description: epDesc.trim(),
      videoUrl: epVideo.trim(),
      audios: [],
      subtitles: [],
    });
    setEpTitle("");
    setEpNumber(1);
    setEpDesc("");
    setEpVideo("");
  };

  return (
    <div className="p-4 rounded-2xl border border-black/10 bg-white/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">{series.title}</div>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={onDeleteSeries}
        >
          <Trash className="w-4 h-4 mr-2" /> Delete series
        </Button>
      </div>

      {/* Optional backdrop preview */}
      {series.backdropUrl && (
        <div
          className="mb-3 h-28 rounded-lg bg-cover bg-center border border-black/10"
          style={{ backgroundImage: `url(${series.backdropUrl})` }}
          title="Backdrop preview"
        />
      )}

      {/* Seasons list */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Seasons</div>
          <Button variant="outline" onClick={onAddSeason}>
            <Plus className="w-4 h-4 mr-2" /> Add Season
          </Button>
        </div>
        {(!series.seasons || series.seasons.length === 0) && (
          <div className="text-sm text-zinc-600">No seasons yet.</div>
        )}
        <div className="space-y-3">
          {series.seasons
            ?.slice()
            .sort((a, b) => a.number - b.number)
            .map((se) => (
              <SeasonBlock
                key={se.id}
                season={se}
                onDeleteEpisode={(epId) => onDeleteEpisode(se.id, epId)}
              />
            ))}
        </div>
      </div>

      {/* Add episode form */}
      {series.seasons?.length > 0 && (
        <div className="p-3 rounded-xl bg-white/80 border border-black/10">
          <div className="flex items-center gap-2 mb-3 font-medium">
            <Video className="w-4 h-4" /> Add Episode
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <select
              className="border rounded px-3 py-2 text-sm bg-white"
              value={seasonForEp}
              onChange={(e) => setSeasonForEp(e.target.value)}
            >
              <option value="">Select season…</option>
              {series.seasons
                ?.slice()
                .sort((a, b) => a.number - b.number)
                .map((se) => (
                  <option key={se.id} value={se.id}>
                    Season {se.number}
                  </option>
                ))}
            </select>

            <Input
              type="number"
              min={1}
              placeholder="Episode #"
              value={epNumber}
              onChange={(e) => setEpNumber(parseInt(e.target.value || "1"))}
            />
          </div>

          <Input className="mb-2" placeholder="Episode title" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
          <Input className="mb-2" placeholder="Description" value={epDesc} onChange={(e) => setEpDesc(e.target.value)} />
          <Input className="mb-3" placeholder="Video URL (.mp4 / .m3u8)" value={epVideo} onChange={(e) => setEpVideo(e.target.value)} />

          <Button onClick={addEpisodeLocal}>
            <Plus className="w-4 h-4 mr-2" /> Add Episode
          </Button>
        </div>
      )}
    </div>
  );
}

function SeasonBlock({ season, onDeleteEpisode }) {
  return (
    <div className="p-3 rounded-xl bg-white/70 border border-black/10">
      <div className="font-medium mb-2">Season {season.number}</div>
      {(!season.episodes || season.episodes.length === 0) && (
        <div className="text-sm text-zinc-600">No episodes yet.</div>
      )}
      <div className="space-y-2">
        {season.episodes
          ?.slice()
          .sort((a, b) => a.number - b.number)
          .map((ep) => (
            <div
              key={ep.id}
              className="p-2 rounded-lg bg-white border border-black/10 flex items-center justify-between"
            >
              <div className="text-sm">
                <span className="font-medium">{ep.number}. {ep.title}</span>
                {ep.description && <span className="text-zinc-600"> — {ep.description}</span>}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => onDeleteEpisode(ep.id)}
              >
                <Trash className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
