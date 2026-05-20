"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Sportdagar
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/sportdagar" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Kommande sportdagar
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  Mina sidor
                </Link>
                <Link href="/dashboard/barn" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  Mina barn
                </Link>
                <Link href="/dashboard/bokningar" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  Mina bokningar
                </Link>
                {user.is_admin && (
                  <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hej, {user.full_name?.split(" ")[0] || "Förälder"}!</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logga ut
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Logga in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Skapa konto</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            <Link href="/sportdagar" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={() => setOpen(false)}>
              Kommande sportdagar
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Mina sidor
                </Link>
                <Link href="/dashboard/barn" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Mina barn
                </Link>
                <Link href="/dashboard/bokningar" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Mina bokningar
                </Link>
                {user.is_admin && (
                  <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50" onClick={() => setOpen(false)}>
                    Admin
                  </Link>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    onClick={() => { logout(); setOpen(false); }}
                  >
                    Logga ut
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/login" className="block" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Logga in</Button>
                </Link>
                <Link href="/register" className="block" onClick={() => setOpen(false)}>
                  <Button className="w-full">Skapa konto</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
