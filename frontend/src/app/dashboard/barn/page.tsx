"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Child } from "@/types";
import { calculateAge } from "@/lib/utils";
import { Plus, Trash2, Baby, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/useToast";

const EMPTY_FORM = {
  full_name: "",
  birth_date: "",
  gender: "",
  medical_notes: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: "",
};

export default function BarnPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.children.list(user.access_token)
      .then((data) => setChildren(data as Child[]))
      .finally(() => setLoading(false));
  }, [user]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.gender) delete (payload as Record<string, unknown>).gender;
      const child = await api.children.create(payload, user.access_token) as Child;
      setChildren((prev) => [...prev, child]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast({ title: "Barn tillagt!", description: `${child.full_name} har lagts till.`, variant: "default" });
    } catch (err: unknown) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Kunde inte lägga till barn", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm("Är du säker på att du vill ta bort detta barn?")) return;
    setDeleting(id);
    try {
      await api.children.delete(id, user.access_token);
      setChildren((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Barn borttaget" });
    } catch {
      toast({ title: "Fel", description: "Kunde inte ta bort barn", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mina barn</h1>
            <p className="text-gray-500 mt-1">Hantera dina barns uppgifter</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Lägg till barn
            </Button>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="mb-6 border-blue-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Nytt barn</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Barnets namn *</Label>
                    <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Namn Efternamn" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Födelsedatum *</Label>
                    <Input id="birth_date" type="date" value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="gender">Kön (valfritt)</Label>
                    <select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Välj...</option>
                      <option value="pojke">Pojke</option>
                      <option value="flicka">Flicka</option>
                      <option value="annat">Annat</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="medical_notes">Medicinska noteringar (valfritt)</Label>
                    <Input id="medical_notes" value={form.medical_notes} onChange={(e) => update("medical_notes", e.target.value)} placeholder="t.ex. allergier, astma" className="mt-1" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Nödkontakt *</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ec_name">Namn *</Label>
                      <Input id="ec_name" value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} placeholder="Föräldrens namn" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="ec_phone">Telefon *</Label>
                      <Input id="ec_phone" type="tel" value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} placeholder="070-123 45 67" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="ec_relation">Relation (valfritt)</Label>
                      <Input id="ec_relation" value={form.emergency_contact_relation} onChange={(e) => update("emergency_contact_relation", e.target.value)} placeholder="Mamma, Pappa, etc." className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Sparar...</> : "Lägg till barn"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Avbryt</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : children.length === 0 ? (
          <div className="text-center py-20">
            <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Inga barn tillagda ännu</h2>
            <p className="text-gray-400 mb-6">Lägg till dina barn för att kunna boka sportdagar</p>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Lägg till ditt första barn</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <Card key={child.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                        {child.gender === "flicka" ? "👧" : child.gender === "pojke" ? "👦" : "🧒"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{child.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          {calculateAge(child.birth_date)} år · Född {new Date(child.birth_date).toLocaleDateString("sv-SE")}
                        </p>
                        {child.medical_notes && (
                          <p className="text-xs text-orange-600 mt-1">⚠️ {child.medical_notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Nödkontakt: {child.emergency_contact_name} ({child.emergency_contact_phone})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(child.id)}
                      disabled={deleting === child.id}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      {deleting === child.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
