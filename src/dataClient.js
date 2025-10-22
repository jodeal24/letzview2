// src/dataClient.js
import {
  collection, doc, setDoc, addDoc, getDocs, getDoc, query, orderBy, deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Collection: series
//   doc: { title, coverUrl, backdropUrl, description }
//   subcollection seasons
//     doc: { number }
//     subcollection episodes
//       doc: { number, title, description, videoUrl, audios:[], subtitles:[] }

export async function createSeries({ title, coverUrl, backdropUrl, description }) {
  const ref = await addDoc(collection(db, "series"), { title, coverUrl, backdropUrl, description });
  return ref.id;
}

export async function updateSeries(seriesId, patch) {
  await setDoc(doc(db, "series", seriesId), patch, { merge: true });
}

export async function setSeason(seriesId, seasonNumber) {
  const ref = doc(db, "series", seriesId, "seasons", String(seasonNumber));
  await setDoc(ref, { number: seasonNumber }, { merge: true });
  return ref.id;
}

export async function setEpisode(seriesId, seasonNumber, episodeNumber, { title, description, videoUrl, audios = [], subtitles = [] }) {
  const epRef = doc(
    db, "series", seriesId, "seasons", String(seasonNumber),
    "episodes", String(episodeNumber)
  );
  await setDoc(epRef, {
    number: episodeNumber,
    title,
    description: description || "",
    videoUrl,
    audios,
    subtitles,
  }, { merge: true });
  return epRef.id;
}

export async function deleteSeries(seriesId) {
  // Simple delete for now: remove series doc (seasons/episodes will be orphaned in free tier).
  await deleteDoc(doc(db, "series", seriesId));
}

export async function deleteEpisode(seriesId, seasonNumber, episodeNumber) {
  await deleteDoc(doc(
    db, "series", seriesId, "seasons", String(seasonNumber),
    "episodes", String(episodeNumber)
  ));
}

// Read entire catalog and shape exactly like your UI expects
export async function fetchCatalog() {
  const result = [];

  const seriesSnap = await getDocs(collection(db, "series"));
  for (const sDoc of seriesSnap.docs) {
    const base = sDoc.data() || {};
    const sData = {
      id: sDoc.id,
      title: base.title || "",
      description: base.description || "",
      posterUrl: base.coverUrl || base.posterUrl || "",
      backdropUrl: base.backdropUrl || "",
      seasons: [],
    };

    const seasonsSnap = await getDocs(collection(db, "series", sDoc.id, "seasons"));
    for (const seaDoc of seasonsSnap.docs) {
      const snum = Number(seaDoc.data()?.number ?? seaDoc.id);
      const episodesQ = query(
        collection(db, "series", sDoc.id, "seasons", String(snum), "episodes"),
        orderBy("number", "asc")
      );
      const epsSnap = await getDocs(episodesQ);

      const episodes = epsSnap.docs.map(d => {
        const e = d.data() || {};
        return {
          id: d.id,
          number: Number(e.number ?? d.id),
          title: e.title || "",
          description: e.description || "",
          videoUrl: e.videoUrl || "",
          audios: e.audios || [],
          subtitles: e.subtitles || [],
          posterUrl: sData.posterUrl,
          backdropUrl: sData.backdropUrl,
        };
      });

      // IMPORTANT: your UI expects a season to have an id and number
      sData.seasons.push({ id: `season-${snum}`, number: snum, episodes });
    }

    // sort seasons numerically
    sData.seasons.sort((a, b) => a.number - b.number);
    result.push(sData);
  }

  // Sort series by title (optional)
  result.sort((a, b) => a.title.localeCompare(b.title));
  return result;
}
