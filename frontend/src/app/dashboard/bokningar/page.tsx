"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types";
import { formatDate, formatTime, SPORT_COLORS } from "@/lib/utils";
import { Calendar, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function BokningarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.bookings.list(user.access_token)
      .then((data) => setBookings(data as Booking[]))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCancel(id: string) {
    if (!user || !confirm("Vill du avboka denna aktivitet?")) return;
    setCancelling(id);
    try {
      await api.bookings.cancel(id, user.access_token);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b));
      toast({ title: "Avbokning klar", description: "Platsen har frigjorts." });
    } catch (err: unknown) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Avbokning misslyckades", variant: "destructive" });
    } finally {
      setCancelling(null);
    }
  }

  const active = bookings.filter((b) => b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "cancelled");

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mina bokningar</h1>
          <p className="text-gray-500 mt-1">Översikt över alla dina bokningar</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Inga bokningar ännu</h2>
            <p className="text-gray-400 mb-6">Bläddra bland kommande sportdagar och boka en plats!</p>
            <Button asChild><Link href="/sportdagar">Se kommande sportdagar <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">Aktiva bokningar ({active.length})</h2>
                <div className="space-y-3">
                  {active.map((b) => (
                    <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling === b.id} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-500 mb-3">Avbokade ({past.length})</h2>
                <div className="space-y-3 opacity-60">
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function BookingCard({ booking: b, onCancel, cancelling }: { booking: Booking; onCancel: (id: string) => void; cancelling: boolean }) {
  const colorClass = SPORT_COLORS[b.session?.sport?.color || "blue"];
  return (
    <Card className={b.status === "cancelled" ? "opacity-70" : ""}>
      <CardContent className="py-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl mt-1">{b.session?.sport?.icon || "🏃"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{b.session?.title}</h3>
              <Badge variant={b.status === "confirmed" ? "success" : "secondary"}>
                {b.status === "confirmed" ? "Bokad" : "Avbokad"}
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {b.session?.session_date ? formatDate(b.session.session_date) : ""}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {b.session?.start_time ? `${formatTime(b.session.start_time)} – ${formatTime(b.session.end_time || "")}` : ""}
              </div>
              {b.session?.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {b.session.location}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                {b.session?.sport?.name} · {b.child?.full_name}
              </span>
              {b.status === "confirmed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                  onClick={() => onCancel(b.id)}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Avboka"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
