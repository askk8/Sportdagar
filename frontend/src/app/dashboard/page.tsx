"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking, Child } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Baby, Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.bookings.list(user.access_token),
      api.children.list(user.access_token),
    ]).then(([b, c]) => {
      setBookings((b as Booking[]).filter((bk) => bk.status === "confirmed").slice(0, 3));
      setChildren(c as Child[]);
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Hej, {user.full_name?.split(" ")[0] || "Förälder"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Välkommen till dina sidor på Sportdagar</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-500 flex items-center gap-2">
                  <Baby className="w-4 h-4" /> Mina barn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-3">{children.length}</div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/barn">
                    {children.length === 0 ? "Lägg till barn" : "Hantera barn"}
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Aktiva bokningar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-3">{bookings.length}</div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/bokningar">
                    Se alla bokningar <ArrowRight className="ml-2 w-3 h-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-blue-100">Kommande sportdagar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 text-sm mb-3">Utforska och boka kommande aktiviteter</p>
                <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 w-full" asChild>
                  <Link href="/sportdagar">
                    Boka plats <ArrowRight className="ml-2 w-3 h-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent bookings */}
            {bookings.length > 0 && (
              <div className="md:col-span-3">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Senaste bokningar</h2>
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <Card key={b.id}>
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{b.session?.sport?.icon || "🏃"}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{b.session?.title}</div>
                            <div className="text-sm text-gray-500">
                              {b.session?.session_date ? formatDate(b.session.session_date) : ""}{" "}
                              {b.session?.start_time ? `· ${formatTime(b.session.start_time)}–${formatTime(b.session.end_time || "")}` : ""}
                            </div>
                            <div className="text-sm text-gray-400">{b.child?.full_name}</div>
                          </div>
                        </div>
                        <Badge variant="success">Bokad</Badge>
                      </CardContent>
                    </Card>
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
