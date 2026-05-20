"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionCard } from "@/components/booking/SessionCard";
import { BookingModal } from "@/components/booking/BookingModal";
import { Session, SportWeek, Sport, Child, Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate, formatShortDate } from "@/lib/utils";
import { Loader2, Calendar, MapPin, Filter } from "lucide-react";

export default function SportdagarPage() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<SportWeek[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [bookingSession, setBookingSession] = useState<Session | null>(null);

  useEffect(() => {
    const loads = [
      api.sessions.weeks().then((d) => { const w = d as SportWeek[]; setWeeks(w); if (w.length > 0) setSelectedWeek(w[0].id); }),
      api.sessions.sports().then((d) => setSports(d as Sport[])),
    ];
    if (user) {
      loads.push(api.children.list(user.access_token).then((d) => setChildren(d as Child[])));
      loads.push(api.bookings.list(user.access_token).then((d) => setBookings((d as Booking[]).filter((b) => b.status === "confirmed"))));
    }
    Promise.all(loads).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedWeek) return;
    const params: Record<string, string> = { sport_week_id: selectedWeek };
    if (selectedSport) params.sport_id = selectedSport;
    api.sessions.list(params).then((d) => setSessions(d as Session[]));
  }, [selectedWeek, selectedSport]);

  const bookedSessionIds = new Set(bookings.map((b) => b.session_id));

  const sessionsByDate = sessions.reduce((acc, s) => {
    const d = s.session_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {} as Record<string, Session[]>);

  const currentWeek = weeks.find((w) => w.id === selectedWeek);

  function handleBooked(newBooking: Booking) {
    setBookings((prev) => [...prev, newBooking]);
    setSessions((prev) => prev.map((s) => s.id === newBooking.session_id ? { ...s, current_bookings: s.current_bookings + 1, spots_remaining: s.spots_remaining - 1 } : s));
    setBookingSession(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Kommande sportdagar</h1>
            <p className="text-blue-100">Välj en sportdag och boka platser till dina barn</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-72 flex-shrink-0">
                {/* Weeks */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                  <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Aktivitetsveckor
                  </h2>
                  <div className="space-y-2">
                    {weeks.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWeek(w.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedWeek === w.id ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        <div className="font-medium">{w.title}</div>
                        <div className="text-xs mt-0.5 opacity-70 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {w.location}
                        </div>
                        <div className="text-xs opacity-60">
                          {formatShortDate(w.start_date)} – {formatShortDate(w.end_date)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sport filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-500" /> Filtrera sport
                  </h2>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedSport(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!selectedSport ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      Alla sporter
                    </button>
                    {sports.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSport(s.id === selectedSport ? null : s.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedSport === s.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        <span>{s.icon}</span> {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {currentWeek && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{currentWeek.title}</h2>
                    {currentWeek.description && <p className="text-gray-500 text-sm mt-1">{currentWeek.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(currentWeek.start_date)} – {formatDate(currentWeek.end_date)}</span>
                      {currentWeek.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{currentWeek.location}</span>}
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                    <strong>Logga in</strong> för att boka platser.{" "}
                    <Link href="/register" className="underline font-semibold">Skapa konto gratis</Link> eller{" "}
                    <Link href="/login" className="underline font-semibold">logga in</Link>.
                  </div>
                )}

                {Object.keys(sessionsByDate).length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <span className="text-5xl mb-4 block">📅</span>
                    Inga sessioner hittades för detta urval.
                  </div>
                ) : (
                  Object.entries(sessionsByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySessions]) => (
                    <div key={date} className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {daySessions.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            isBooked={bookedSessionIds.has(session.id)}
                            isLoggedIn={!!user}
                            onBook={() => setBookingSession(session)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {bookingSession && (
        <BookingModal
          session={bookingSession}
          children={children}
          token={user?.access_token || ""}
          existingBookings={bookings}
          onClose={() => setBookingSession(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}
