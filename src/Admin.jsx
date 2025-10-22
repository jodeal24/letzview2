// src/Admin.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { fetchCatalog, saveSeries, db } from "./dataClient";
import { login, observeAuth, logout } from "./authClient";
import { collection, doc, deleteDoc } from "firebase/firestore";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPoster, setNewPoster] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");

  // Observe authentication state
  useEffect(() => {
    const unsubscribe = observeAuth((u) => setUser(u));
    return () => unsubscribe && unsubscribe();
  }, []);

  // Fetch all series from Firestore
  useEffect(() => {
    fetchCatalog().then(setSeries).catch(console.error);
  }, []);

  // Add new series
  const handleAddSeries = async () => {
    if (!newTitle.trim()) return alert("Title required.");
    const newSeries = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDesc,
      posterUrl: newPoster,
      seasons: [],
    };
    await saveSeries(newSeries);
    setSeries([...series, newSeries]);
    setNewTitle("");
    setNewDesc("");
    setNewPoster("");
  };

  // Delete a series
  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Delete this series?")) return;
    await deleteDoc(doc(collection(db, "series"), id));
    setSeries(series.filter((s) => s.id !== id));
  };

  // Login form (email + password)
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
            if (!email || !password)
              return alert("Please fill in both fields.");
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
              {error.replace("Firebase:", "").trim()}
            </div>
          )}
        </form>
      </div>
    );

  // Logged-in admin view
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-3 p-4 rounded-2xl bg-white/5 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add New Series</h3>
        <Input
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <Input
          placeholder="Poster URL"
          value={newPoster}
          onChange={(e) => setNewPoster(e.target.value)}
        />
        <Button onClick={handleAddSeries}>
          <Plus className="w-4 h-4 mr-2" /> Add Series
        </Button>
      </div>

      <h3 className="text-lg font-semibold mb-4">Existing Series</h3>
      <div className="space-y-3">
        {series.map((s) => (
          <div
            key={s.id}
            className="p-3 border rounded-xl flex justify-between items-center bg-white/40"
          >
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-zinc-700 line-clamp-2">
                {s.description}
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteSeries(s.id)}
            >
              <Trash className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
