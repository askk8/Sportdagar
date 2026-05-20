"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const { isAdmin, loading, saveToken } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) router.replace("/admin");
  }, [isAdmin, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.admin.login(username, password) as { token: string };
      saveToken(res.token);
      router.replace("/admin");
    } catch {
      setError("Fel användarnamn eller lösenord");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            Sportdagar
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
            <ShieldCheck className="w-4 h-4" />
            Adminpanel
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Logga in som admin</h1>
          <p className="text-gray-500 text-sm mb-6">Ange dina adminuppgifter för att fortsätta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Användarnamn</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Användarnamn"
                required
                autoComplete="username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Lösenord"
                required
                autoComplete="current-password"
                className="mt-1"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Loggar in...</>
              ) : (
                "Logga in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
