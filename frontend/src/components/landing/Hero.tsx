import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Calendar } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full blur-3xl" />
      </div>

      {/* Sport emoji decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <span className="absolute top-12 right-[15%] text-6xl opacity-20 rotate-12">⚽</span>
        <span className="absolute top-24 left-[8%] text-5xl opacity-15 -rotate-12">🏀</span>
        <span className="absolute bottom-20 right-[10%] text-7xl opacity-20 rotate-6">🏐</span>
        <span className="absolute bottom-16 left-[12%] text-5xl opacity-15 -rotate-6">🏒</span>
        <span className="absolute top-1/2 right-[5%] text-4xl opacity-10">🤾</span>
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            Sport för alla barn i Sverige
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-balance">
            Ge ditt barn{" "}
            <span className="text-yellow-300">upplevelsen</span>{" "}
            av sport
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Sportdagar arrangerar prova-på-dagar och aktivitetsveckor tillsammans med lokala idrottsklubbar.
            Låt dina barn testa fotboll, handboll, basket och mycket mer!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl" asChild>
              <Link href="/register">
                Skapa konto gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10" asChild>
              <Link href="/sportdagar">
                Se kommande sportdagar
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <Users className="w-5 h-5 text-blue-200" />
                500+
              </div>
              <div className="text-xs text-blue-200 mt-1">Nöjda familjer</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <span className="text-blue-200">⚽</span>
                10
              </div>
              <div className="text-xs text-blue-200 mt-1">Sporter</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <Calendar className="w-5 h-5 text-blue-200" />
                20+
              </div>
              <div className="text-xs text-blue-200 mt-1">Aktiviteter/år</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 27.5C840 35 960 40 1080 37.5C1200 35 1320 25 1380 20L1440 15V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
