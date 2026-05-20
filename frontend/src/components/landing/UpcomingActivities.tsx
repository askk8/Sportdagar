import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

// Static preview — real data loads on /sportdagar
const previewWeeks = [
  {
    title: "Sommarsportdagar 2025",
    dates: "7–11 juli 2025",
    location: "Idrottsparken, Stockholm",
    sports: ["⚽", "🏀", "🤾", "🏒", "🏓"],
    spots: "Platser kvar",
    color: "border-l-blue-500",
  },
  {
    title: "Höstsportdagar 2025",
    dates: "27–31 oktober 2025",
    location: "Sporthallen, Bromma",
    sports: ["⚽", "🏐", "🤾", "🏒", "🏀"],
    spots: "Öppnar snart",
    color: "border-l-orange-500",
  },
];

export function UpcomingActivities() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Kommande sportdagar
            </h2>
            <p className="text-gray-500">Boka platser till kommande aktivitetsveckor</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/sportdagar">
              Se alla <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {previewWeeks.map((week) => (
            <div
              key={week.title}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${week.color} p-6 hover:shadow-md transition-shadow`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">{week.title}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {week.dates}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {week.location}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {week.sports.map((s, i) => (
                    <span key={i} className="text-xl">{s}</span>
                  ))}
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {week.spots}
                </span>
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/sportdagar">Boka plats</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
