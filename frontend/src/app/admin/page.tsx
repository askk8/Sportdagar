"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, BarChart3, BookOpen, ArrowRight } from "lucide-react";

interface Stats {
  total_sport_weeks: number;
  total_sessions: number;
  total_confirmed_bookings: number;
  total_children: number;
  total_users: number;
}

export default function AdminPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.admin.stats(token)
      .then((d) => setStats(d as Stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { label: "Aktivitetsveckor", value: stats?.total_sport_weeks, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Sessioner totalt", value: stats?.total_sessions, icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
    { label: "Bekräftade bokningar", value: stats?.total_confirmed_bookings, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Registrerade barn", value: stats?.total_children, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Översikt</h1>
        <p className="text-gray-500 mt-1">Välkommen till Sportdagar adminpanel</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900">{s.value ?? 0}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Aktivitetsveckor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Skapa och publicera aktivitetsveckor som föräldrar kan se och boka
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/veckor">Hantera veckor <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-500" /> Sessioner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Lägg till sport-sessioner med tider, åldersgrupper och platsbegränsning
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/sessioner">Hantera sessioner <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" /> Bokningar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Se alla föräldrar och barns bokningar för varje session
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/bokningar">Visa bokningar <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}
