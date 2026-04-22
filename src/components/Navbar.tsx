"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ShoppingBag, Plus, LogOut, UserCircle, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuPage,
} from "@/components/ui/material-ui-dropdown-menu";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ShoppingBag className="w-6 h-6 text-blue-400" />
          <span className={scrolled ? "text-gray-900 dark:text-white" : "text-white"}>pisoBlox</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Browse — always visible */}
          <Link
            href="/listings"
            className={`hidden sm:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-colors ${scrolled ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800" : "text-white/80 hover:text-white hover:bg-white/10"}`}
          >
            <Search className="w-4 h-4" />
            Mag-search
          </Link>

          {/* Sell button — logged in only */}
          {user && (
            <Link
              href="/listings/create"
              className="hidden sm:flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Magbenta
            </Link>
          )}


          {/* User menu dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-sm font-medium ${scrolled ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" : "border-white/30 bg-white/10 hover:bg-white/20 text-white"}`}>
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                  {username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{username}</span>
                <Menu className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="min-w-[200px] rounded-2xl" align="end">
                <DropdownMenuPage id="main">
                  <DropdownMenuLabel>{username}</DropdownMenuLabel>

                  <DropdownMenuItem onSelect={() => router.push("/listings")} enterAnimation>
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Mag-search</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => router.push("/listings/create")} enterAnimation>
                    <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Magbenta</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => router.push("/profile")} enterAnimation>
                    <UserCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="text-red-500 dark:text-red-400"
                    enterAnimation
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Mag-logout</span>
                  </DropdownMenuItem>
                </DropdownMenuPage>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Mag-login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl transition-colors font-medium"
              >
                Mag-register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
