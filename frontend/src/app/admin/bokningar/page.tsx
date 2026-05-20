"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { api } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Loader2, Calendar, Clock, MapPin, Users } from "lucide-react";

type FilterType = "confirmed" | "cancelled" | "all";

export default function AdminBokningarPage() {
  const { token } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("confirmed");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = filter !== "all" ? { status: filter } : undefined;
    api.admin.bookings.list(token, params)
      .then((d) => setBookings(d as Booking[]))
      .finally(() => setLoading(false));
  }, [token, filter]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Bokningar</h1>
        <p className="text-gray-500 text-sm mt-1">Översikt över samtliga bokningar</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "confirmed", label: "Bekräftade" },
          { key: "cancelled", label: "Avbokade" },
          { key: "all", label: "Alla" },
        ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {label}
            {filter === key && !loading && (
              <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {bookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Inga bokningar hittades</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{b.session?.sport?.icon || "🏃"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{b.session?.title}</div>
                        <div className="text-sm text-gray-600">
                          Barn: <span className="font-semibold">{b.child?.full_name}</span>
                          {b.child?.birth_date && (
                            <span className="text-gray-400 ml-2 text-xs">
                              · {new Date().getFullYear() - new Date(b.child.birth_date).getFullYear()} år
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={b.status === "confirmed" ? "success" : "secondary"}>
                        {b.status === "confirmed" ? "Bekräftad" : "Avbokad"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {b.session?.session_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{formatDate(b.session.session_date)}
                        </span>
                      )}
                      {b.session?.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTime(b.session.start_time)}–{formatTime(b.session.end_time || "")}
                        </span>
                      )}
                      {b.session?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{b.session.location}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1.5 flex gap-4">
                      <span>Bokad: {new Date(b.booked_at).toLocaleString("sv-SE")}</span>
                      {b.cancelled_at && <span>Avbokad: {new Date(b.cancelled_at).toLocaleString("sv-SE")}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
