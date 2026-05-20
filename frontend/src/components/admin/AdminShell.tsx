"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Trophy, LogOut } from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/veckor", label: "Aktivitetsveckor" },
  { href: "/admin/sessioner", label: "Sessioner" },
  { href: "/admin/bokningar", label: "Bokningar" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Trophy className="w-5 h-5 text-blue-400" />
            Sportdagar Admin
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logga ut
          </button>
        </div>
      </header>

      <nav className="bg-gray-800 text-gray-300 border-b border-gray-700">
        <div className="container mx-auto px-4 flex gap-1 h-10 items-center text-sm overflow-x-auto">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1 rounded whitespace-nowrap transition-colors ${active ? "bg-gray-700 text-white font-medium" : "hover:bg-gray-700 hover:text-white"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
