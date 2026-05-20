"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Session, SportWeek, Sport } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X, Users, BookOpen } from "lucide-react";
import { toast } from "@/hooks/useToast";

const EMPTY_FORM = {
  sport_week_id: "", sport_id: "", title: "", description: "",
  session_date: "", start_time: "", end_time: "", location: "",
  min_age: 6, max_age: 16, max_capacity: 20, is_active: true,
};

export default function AdminSessionerPage() {
  const { token } = useAdminAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weeks, setWeeks] = useState<SportWeek[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterWeek, setFilterWeek] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.admin.weeks.list(token),
      api.admin.sports.list(token),
      api.admin.sessions.list(token),
    ]).then(([w, s, sess]) => {
      setWeeks(w as SportWeek[]);
      setSports(s as Sport[]);
      setSessions(sess as Session[]);
    }).finally(() => setLoading(false));
  }, [token]);

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const payload = { ...form, min_age: Number(form.min_age), max_age: Number(form.max_age), max_capacity: Number(form.max_capacity) };
      if (editId) {
        const s = await api.admin.sessions.update(editId, payload, token) as Session;
        setSessions((prev) => prev.map((x) => x.id === editId ? s : x));
        toast({ title: "Session uppdaterad!" });
      } else {
        const s = await api.admin.sessions.create(payload, token) as Session;
        setSessions((prev) => [...prev, s]);
        toast({ title: "Session skapad!" });
      }
      setForm(EMPTY_FORM); setShowForm(false); setEditId(null);
    } catch (err: unknown) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Misslyckades", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Ta bort denna session? Alla tillhörande bokningar raderas.")) return;
    setDeleting(id);
    try {
      await api.admin.sessions.delete(id, token);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Session borttagen" });
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(s: Session) {
    setForm({
      sport_week_id: s.sport_week_id, sport_id: s.sport_id,
      title: s.title, description: s.description || "",
      session_date: s.session_date, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5),
      location: s.location || "", min_age: s.min_age, max_age: s.max_age,
      max_capacity: s.max_capacity, is_active: s.is_active,
    });
    setEditId(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = filterWeek ? sessions.filter((s) => s.sport_week_id === filterWeek) : sessions;
  const sorted = [...filtered].sort((a, b) => a.session_date.localeCompare(b.session_date) || a.start_time.localeCompare(b.start_time));

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sessioner</h1>
          <p className="text-gray-500 text-sm mt-1">Skapa och hantera sport-sessioner med tider och platsbegränsning</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Ny session
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 border-blue-300 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Redigera session" : "Ny session"}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Aktivitetsvecka *</Label>
                  <select value={form.sport_week_id} onChange={(e) => update("sport_week_id", e.target.value)} required className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Välj vecka...</option>
                    {weeks.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Sport *</Label>
                  <select value={form.sport_id} onChange={(e) => update("sport_id", e.target.value)} required className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Välj sport...</option>
                    {sports.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Sessionstitel *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="t.ex. Fotboll för yngre" required className="mt-1" />
              </div>

              <div>
                <Label>Beskrivning</Label>
                <Input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Kort beskrivning av sessionen" className="mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Datum *</Label>
                  <Input type="date" value={form.session_date} onChange={(e) => update("session_date", e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label>Starttid *</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => update("start_time", e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label>Sluttid *</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} required className="mt-1" />
                </div>
              </div>

              <div>
                <Label>Plats / Hallen</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="t.ex. Sporthall 1" className="mt-1" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Minålder</Label>
                  <Input type="number" min={0} max={18} value={form.min_age} onChange={(e) => update("min_age", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Maxålder</Label>
                  <Input type="number" min={0} max={18} value={form.max_age} onChange={(e) => update("max_age", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Max platser</Label>
                  <Input type="number" min={1} max={200} value={form.max_capacity} onChange={(e) => update("max_capacity", e.target.value)} className="mt-1" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Aktiv session</span>
                  <span className="text-xs text-gray-400 block">Synlig och bokningsbar för föräldrar</span>
                </div>
              </label>

              <div className="flex gap-3 pt-2 border-t">
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Sparar...</> : editId ? "Spara ändringar" : "Skapa session"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Avbryt</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={filterWeek}
          onChange={(e) => setFilterWeek(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Alla veckor ({sessions.length})</option>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title} ({sessions.filter((s) => s.sport_week_id === w.id).length})
            </option>
          ))}
        </select>
        {filterWeek && (
          <button onClick={() => setFilterWeek("")} className="text-sm text-gray-400 hover:text-gray-600">
            Rensa filter
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Inga sessioner hittades</p>
          <p className="text-sm mt-1">Klicka på "Ny session" för att lägga till en</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{s.sport?.icon || "🏃"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{s.title}</span>
                    {!s.is_active && <Badge variant="secondary" className="text-xs">Inaktiv</Badge>}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-3">
                    <span>{formatDate(s.session_date)}</span>
                    <span>{formatTime(s.start_time)}–{formatTime(s.end_time)}</span>
                    <span>Ålder {s.min_age}–{s.max_age} år</span>
                    {s.location && <span>📍 {s.location}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Users className="w-3 h-3" />
                    {s.current_bookings}/{s.max_capacity} bokade
                    {s.current_bookings >= s.max_capacity && <span className="text-red-500 font-medium ml-1">— Fullbokat</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="text-red-500 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                  >
                    {deleting === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
