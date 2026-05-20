import { Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { formatTime, SPORT_COLORS } from "@/lib/utils";

interface Props {
  session: Session;
  isBooked: boolean;
  isLoggedIn: boolean;
  onBook: () => void;
}

export function SessionCard({ session, isBooked, isLoggedIn, onBook }: Props) {
  const isFull = session.spots_remaining === 0;
  const colorClass = SPORT_COLORS[session.sport?.color || "blue"];
  const pct = Math.round((session.current_bookings / session.max_capacity) * 100);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5 ${isBooked ? "border-green-200 bg-green-50/30" : "border-gray-100"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{session.sport?.icon || "🏃"}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{session.title}</h3>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${colorClass}`}>
              {session.sport?.name}
            </span>
          </div>
        </div>
        {isBooked && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
            <CheckCircle className="w-3 h-3" /> Bokad
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {formatTime(session.start_time)} – {formatTime(session.end_time)}
        </div>
        {session.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {session.location}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="text-gray-400">👤</span>
          Ålder {session.min_age}–{session.max_age} år
        </div>
      </div>

      {/* Capacity bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.current_bookings}/{session.max_capacity} bokade</span>
          <span className={isFull ? "text-red-500 font-semibold" : session.spots_remaining <= 5 ? "text-orange-500 font-semibold" : "text-green-600"}>
            {isFull ? "Fullbokat" : `${session.spots_remaining} platser kvar`}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-orange-400" : "bg-green-400"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Action */}
      {isBooked ? (
        <Button variant="outline" size="sm" className="w-full border-green-300 text-green-700 cursor-default" disabled>
          <CheckCircle className="w-4 h-4 mr-2" /> Plats bokad
        </Button>
      ) : isFull ? (
        <Button size="sm" className="w-full" disabled>Fullbokat</Button>
      ) : !isLoggedIn ? (
        <Button size="sm" variant="outline" className="w-full" asChild>
          <a href="/login">Logga in för att boka</a>
        </Button>
      ) : (
        <Button size="sm" className="w-full" onClick={onBook}>
          Boka plats
        </Button>
      )}
    </div>
  );
}
