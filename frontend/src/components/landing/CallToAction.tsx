import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="text-5xl mb-6">🏆</div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-balance">
          Redo att ge ditt barn en sportupplevelse?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
          Skapa ett gratis konto idag och börja boka platser till kommande sportdagar. Det tar under 2 minuter!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 font-bold" asChild>
            <Link href="/register">
              Kom igång gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
            <Link href="/sportdagar">Utforska sportdagar</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
