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
import { SportWeek } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X, Eye, EyeOff, Calendar, MapPin } from "lucide-react";
import { toast } from "@/hooks/useToast";

const EMPTY = { title: "", description: "", start_date: "", end_date: "", location: "", is_published: false };

export default function AdminVeckorPage() {
  const { token } = useAdminAuth();
  const [weeks, setWeeks] = useState<SportWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.admin.weeks.list(token)
      .then((d) => setWeeks(d as SportWeek[]))
      .finally(() => setLoading(false));
  }, [token]);

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editId) {
        const w = await api.admin.weeks.update(editId, form, token) as SportWeek;
        setWeeks((prev) => prev.map((x) => x.id === editId ? w : x));
        toast({ title: "Vecka uppdaterad!", variant: "default" });
      } else {
        const w = await api.admin.weeks.create(form, token) as SportWeek;
        setWeeks((prev) => [...prev, w]);
        toast({ title: "Vecka skapad!", variant: "default" });
      }
      setForm(EMPTY); setShowForm(false); setEditId(null);
    } catch (err: unknown) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Misslyckades", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Ta bort denna vecka? Alla tillhörande sessioner och bokningar raderas.")) return;
    setDeleting(id);
    try {
      await api.admin.weeks.delete(id, token);
      setWeeks((prev) => prev.filter((w) => w.id !== id));
      toast({ title: "Vecka borttagen" });
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(w: SportWeek) {
    setForm({ title: w.title, description: w.description || "", start_date: w.start_date, end_date: w.end_date, location: w.location || "", is_published: w.is_published });
    setEditId(w.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Aktivitetsveckor</h1>
          <p className="text-gray-500 text-sm mt-1">Skapa och hantera sportdagars aktivitetsveckor</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Ny vecka
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 border-blue-300 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Redigera vecka" : "Ny aktivitetsvecka"}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Titel *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Sommarsportdagar 2025" required className="mt-1" />
              </div>
              <div>
                <Label>Beskrivning</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Beskriv aktivitetsveckan för föräldrarna..."
                  className="mt-1 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm h-24 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Startdatum *</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label>Slutdatum *</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} required className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Plats / Arena</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="t.ex. Idrottsparken, Stockholm" className="mt-1" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => update("is_published", e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Publicerad</span>
                  <span className="text-xs text-gray-400 block">Synlig för föräldrar på webbplatsen</span>
                </div>
              </label>
              <div className="flex gap-3 pt-2 border-t">
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Sparar...</> : editId ? "Spara ändringar" : "Skapa vecka"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Avbryt</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Inga aktivitetsveckor ännu</p>
          <p className="text-sm mt-1">Klicka på "Ny vecka" för att komma igång</p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => (
            <Card key={w.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900">{w.title}</h3>
                    {w.is_published
                      ? <Badge variant="success" className="flex items-center gap-1 text-xs"><Eye className="w-3 h-3" /> Publicerad</Badge>
                      : <Badge variant="secondary" className="flex items-center gap-1 text-xs"><EyeOff className="w-3 h-3" /> Utkast</Badge>
                    }
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(w.start_date)} – {formatDate(w.end_date)}</span>
                    {w.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{w.location}</span>}
                  </div>
                  {w.description && <p className="text-sm text-gray-400 mt-1 line-clamp-1">{w.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => startEdit(w)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Redigera
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="text-red-500 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDelete(w.id)}
                    disabled={deleting === w.id}
                  >
                    {deleting === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
