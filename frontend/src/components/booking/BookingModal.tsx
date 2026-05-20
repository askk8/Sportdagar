"use client";

import { useState } from "react";
import { Session, Child, Booking } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, calculateAge } from "@/lib/utils";
import { X, Loader2, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/useToast";

interface Props {
  session: Session;
  children: Child[];
  token: string;
  existingBookings: Booking[];
  onClose: () => void;
  onBooked: (booking: Booking) => void;
}

export function BookingModal({ session, children, token, existingBookings, onClose, onBooked }: Props) {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter children by age eligibility
  const eligibleChildren = children.filter((c) => {
    const age = calculateAge(c.birth_date);
    return age >= session.min_age && age <= session.max_age;
  });

  // Children already booked for this session
  const alreadyBookedIds = new Set(
    existingBookings.filter((b) => b.session_id === session.id).map((b) => b.child_id)
  );

  // Children with overlapping sessions on the same day
  const hasOverlap = (childId: string) => {
    return existingBookings.some((b) => {
      if (b.session_id === session.id || b.child_id !== childId) return false;
      const bs = b.session;
      if (!bs || bs.session_date !== session.session_date) return false;
      return bs.start_time < session.end_time && bs.end_time > session.start_time;
    });
  };

  async function handleBook() {
    if (!selectedChild) return;
    setError("");
    setLoading(true);
    try {
      const booking = await api.bookings.create({ session_id: session.id, child_id: selectedChild }, token) as Booking;
      toast({ title: "Plats bokad!", description: `${booking.child?.full_name || "Barnet"} är nu anmält.`, variant: "default" });
      onBooked(booking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bokning misslyckades");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{session.sport?.icon}</span>
              <h2 className="text-xl font-bold text-gray-900">{session.title}</h2>
            </div>
            <p className="text-sm text-gray-500">{session.sport?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session details */}
        <div className="px-6 py-4 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(session.session_date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" /> {formatTime(session.start_time)} – {formatTime(session.end_time)}
          </div>
          {session.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" /> {session.location}
            </div>
          )}
          <div className="text-sm text-gray-600">
            👤 Ålder {session.min_age}–{session.max_age} år · {session.spots_remaining} platser kvar
          </div>
        </div>

        {/* Child selection */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Välj barn att boka för:</h3>

          {children.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-3">Du har inga barn tillagda ännu.</p>
              <Button variant="outline" size="sm" onClick={onClose} asChild>
                <a href="/dashboard/barn">Lägg till barn</a>
              </Button>
            </div>
          ) : eligibleChildren.length === 0 ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Inga av dina barn är i rätt åldersgrupp ({session.min_age}–{session.max_age} år) för denna session.
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleChildren.map((child) => {
                const booked = alreadyBookedIds.has(child.id);
                const overlap = hasOverlap(child.id);
                const disabled = booked || overlap;
                return (
                  <button
                    key={child.id}
                    onClick={() => !disabled && setSelectedChild(child.id)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedChild === child.id
                        ? "border-blue-500 bg-blue-50"
                        : disabled
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{child.full_name}</div>
                        <div className="text-xs text-gray-500">{calculateAge(child.birth_date)} år</div>
                      </div>
                      {booked && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Bokad</span>}
                      {!booked && overlap && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Krockar</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Avbryt</Button>
          <Button
            className="flex-1"
            disabled={!selectedChild || loading}
            onClick={handleBook}
          >
            {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Bokar...</> : "Boka plats"}
          </Button>
        </div>
      </div>
    </div>
  );
}
