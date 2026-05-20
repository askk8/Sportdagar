"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Loader2, CheckCircle } from "lucide-react";
import { User } from "@/types";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken");
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.register(form) as User;
      login(data);
      router.push("/dashboard/barn");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrering misslyckades");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-blue-600">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            Sportdagar
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Skapa konto</h1>
          <p className="text-gray-500 text-sm mb-6">Gratis – kom igång på under 2 minuter</p>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
            {["Boka platser till sportdagar", "Hantera dina barns anmälningar", "Se alla dina bokningar på ett ställe"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Ditt namn</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Anna Svensson"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="anna@email.se"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefonnummer (valfritt)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="070-123 45 67"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minst 8 tecken"
                required
                className="mt-1"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Skapar konto...</>
              ) : (
                "Skapa konto gratis"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Har du redan konto?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Logga in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
