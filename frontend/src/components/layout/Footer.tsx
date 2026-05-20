import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              Sportdagar
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sportdagar kopplar samman familjer med lokala idrottsklubbar för en aktiv och rolig fritid.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Snabblänkar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sportdagar" className="hover:text-white transition-colors">Kommande sportdagar</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Skapa konto</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Logga in</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">info@sportdagar.se</li>
              <li className="text-gray-400">För idrottsklubbar och arrangörer</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Sportdagar. Alla rättigheter förbehållna.
        </div>
      </div>
    </footer>
  );
}
