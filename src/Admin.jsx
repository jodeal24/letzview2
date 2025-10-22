// src/Admin.jsx
import { useEffect, useState } from "react";
import { login, observeAuth, logout } from "./authClient";
import {
  createSeries, updateSeries, setSeason, setEpisode,
  deleteSeries as fsDeleteSeries, deleteEpisode as fsDeleteEpisode,
  fetchCatalog
} from "./dataClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [catalog, setCatalog] = useState([]);

  // Forms
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesCover, setSeriesCover] = useState("");
  const [seriesBackdrop, setSeriesBackdrop] = useState("");
  const [seriesDesc, setSeriesDesc] = useState("");
  const [seriesId, setSeriesId] = useState("");

  const [seasonNo, setSeasonNo] = useState("");
  const [episodeNo, setEpisodeNo] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDesc, setEpisodeDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audios, setAudios] = useState([]);     // {label,url}
  const [subtitles, setSubtitles] = useState([]); // {lang,url}

  useEffect(() => {
    const unsub = observeAuth(setUser);
    return () => unsub();
  }, []);

  async function reload() {
    const data = await fetchCatalog();
    setCatalog(data);
  }

  async function onLogin(e) {
    e.preventDefault();
    await login(email, password);
    await reload();
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 360, margin: "40px auto" }}>
        <h2>Admin Login</h2>
        <form onSubmit={onLogin}>
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2" />
          <div className="mt-3 flex gap-2">
            <Button type="submit">Log in</Button>
            <Button type="button" variant="outline" onClick={() => (window.location.href = "/")}>Back to site</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", lineHeight: 1.6 }}>
      <div className="flex justify-between items-center mb-4">
        <h2>Admin Panel</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>View site</Button>
          <Button onClick={logout}>Log out</Button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/60 border">
        <h3 className="font-semibold mb-2">Create series</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input placeholder="Title" value={seriesTitle} onChange={(e)=>setSeriesTitle(e.target.value)} />
          <Input placeholder="Poster URL" value={seriesCover} onChange={(e)=>setSeriesCover(e.target.value)} />
          <Input placeholder="Backdrop URL" value={seriesBackdrop} onChange={(e)=>setSeriesBackdrop(e.target.value)} />
          <Input placeholder="Description" value={seriesDesc} onChange={(e)=>setSeriesDesc(e.target.value)} />
        </div>
        <div className="mt-2">
          <Button onClick={async ()=>{
            const id = await createSeries({ title: seriesTitle, coverUrl: seriesCover, backdropUrl: seriesBackdrop, description: seriesDesc });
            setSeriesId(id);
            await reload();
            alert(`Series created: ${id}`);
          }}>Save series</Button>
        </div>
        {seriesId && <div className="text-sm mt-1">Series ID: <code>{seriesId}</code></div>}
      </div>

      <div className="p-4 rounded-xl bg-white/60 border mt-4">
        <h3 className="font-semibold mb-2">Add season</h3>
        <Input placeholder="Series ID" value={seriesId} onChange={(e)=>setSeriesId(e.target.value)} />
        <Input placeholder="Season number" type="number" min={1} className="mt-2" value={seasonNo} onChange={(e)=>setSeasonNo(e.target.value)} />
        <Button className="mt-2" onClick={async()=>{
          await setSeason(seriesId, Number(seasonNo));
          await reload();
          alert("Season saved.");
        }}>Save season</Button>
      </div>

      <div className="p-4 rounded-xl bg-white/60 border mt-4">
        <h3 className="font-semibold mb-2">Add episode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input placeholder="Series ID" value={seriesId} onChange={(e)=>setSeriesId(e.target.value)} />
          <Input placeholder="Season number" type="number" min={1} value={seasonNo} onChange={(e)=>setSeasonNo(e.target.value)} />
          <Input placeholder="Episode number" type="number" min={1} value={episodeNo} onChange={(e)=>setEpisodeNo(e.target.value)} />
          <Input placeholder="Episode title" value={episodeTitle} onChange={(e)=>setEpisodeTitle(e.target.value)} />
          <Input placeholder="Description (optional)" value={episodeDesc} onChange={(e)=>setEpisodeDesc(e.target.value)} />
          <Input placeholder="Video URL (.mp4 / .m3u8)" value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} />
        </div>

        <div className="mt-3">
          <Button variant="outline" onClick={()=>setAudios(p=>[...p,{label:"English",url:""}])}>Add audio</Button>{" "}
          <Button variant="outline" onClick={()=>setSubtitles(p=>[...p,{lang:"en",url:""}])}>Add subtitles</Button>
        </div>

        {audios.map((a,i)=>(
          <div key={i} className="grid grid-cols-2 gap-2 mt-2">
            <Input placeholder="Audio label" value={a.label} onChange={e=>setAudios(p=>p.map((x,ix)=>ix===i?{...x,label:e.target.value}:x))}/>
            <Input placeholder="Audio URL" value={a.url} onChange={e=>setAudios(p=>p.map((x,ix)=>ix===i?{...x,url:e.target.value}:x))}/>
          </div>
        ))}
        {subtitles.map((s,i)=>(
          <div key={i} className="grid grid-cols-2 gap-2 mt-2">
            <Input placeholder="Subtitle lang (en, fr, de…)" value={s.lang} onChange={e=>setSubtitles(p=>p.map((x,ix)=>ix===i?{...x,lang:e.target.value}:x))}/>
            <Input placeholder="Subtitle URL (.vtt)" value={s.url} onChange={e=>setSubtitles(p=>p.map((x,ix)=>ix===i?{...x,url:e.target.value}:x))}/>
          </div>
        ))}

        <Button className="mt-3" onClick={async()=>{
          await setEpisode(
            seriesId,
            Number(seasonNo),
            Number(episodeNo),
            { title: episodeTitle, description: episodeDesc, videoUrl, audios, subtitles }
          );
          await reload();
          alert("Episode saved.");
          setEpisodeTitle(""); setEpisodeDesc(""); setVideoUrl("");
          setEpisodeNo(""); setAudios([]); setSubtitles([]);
        }}>Save episode</Button>
      </div>

      <div className="mt-6">
        <div className="flex gap-2 items-center">
          <h3 className="font-semibold">Preview catalog</h3>
          <Button variant="outline" onClick={reload}>Reload</Button>
        </div>
        <pre className="mt-2 p-3 bg-black text-green-400 rounded-lg overflow-auto" style={{maxHeight: 300}}>
{JSON.stringify(catalog, null, 2)}
        </pre>
      </div>
    </div>
  );
}
