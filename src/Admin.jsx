// src/Admin.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { fetchCatalog, saveSeries } from "./dataClient";
import { login, observeAuth, logout } from "./authClient";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./dataClient"; // we’ll export db from dataClient.js

export default function Admin() {
  const [user, setUser] = useState(null);
  const [series, setSeries] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPoster, setNewPoster] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    observeAuth(setUser);
  }, []);

  useEffect(() => {
    fetchCatalog().then(setSeries).catch(console.error);
  }, []);

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

  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Delete this series?")) return;
    await deleteDoc(doc(collection(db, "series"), id));
    setSeries(series.filter((s) => s.id !== id));
  };

  if (!user)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      <form
        className="flex flex-col gap-3 w-64"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = e.target.email.value.trim();
          const password = e.target.password.value.trim();
          if (!email || !password) return alert("Please fill in both fields.");
          try {
            await login(email, password);
          } catch (_) {}
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border rounded px-3 py-2 text-sm"
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

           <div className="bg-white/5 p-4 rounded-xl space-y-3 mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Series</h2>
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Existing Series</h2>
        {series.length === 0 && <p>No series added yet.</p>}
        {series.map((s) => (
          <div
            key={s.id}
            className="bg-white/10 p-3 rounded-xl flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm opacity-70">{s.description}</div>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteSeries(s.id)}
            >
              <Trash className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

