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
        <Button onClick={login}>Sign in with Google</Button>
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

      <div className
