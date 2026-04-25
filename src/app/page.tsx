"use client";

import Link from "next/link";
import { Shield, Search, Link2, Star, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ListingCardAnimated } from "@/components/ui/listing-card-animated";
import { type Listing } from "@/types";

const PAGE_SIZE = 4;

function CategoryCarousel({ title, icon, listings, href }: {
  title: string;
  icon: React.ReactNode;
  listings: Listing[];
  href: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(listings.length / PAGE_SIZE);
  const visible = listings.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (listings.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <span className="text-xs text-gray-500 ml-1">{listings.length} listings</span>
        </div>
        <div className="flex items-center gap-3">
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <Link href={href} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Tingnan lahat →
          </Link>
        </div>
      </div>
      <motion.div
        key={page}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {visible.map((listing) => (
          <ListingCardAnimated key={listing.id} listing={listing} />
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchFeatured() {
      const supabase = createClient();
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("is_featured", true)
        .eq("is_sold", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(50);
      setFeaturedListings(data ?? []);
    }
    fetchFeatured();
  }, []);

  const itemListings = featuredListings.filter(l => l.category === "item");
  const accountListings = featuredListings.filter(l => l.category === "account");
  const robuxListings = featuredListings.filter(l => l.category === "robux");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/listings${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
  }

  return (
    <div className="flex flex-col">

      {/* Hero with background image */}
      <section className="relative w-full min-h-[580px] flex items-center overflow-hidden -mt-16 pt-16">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/3c4554e5-b2f9-4566-bf67-24f7a39cd854.png')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
        {/* Bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0d1117] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full px-6 py-24 flex flex-col items-center text-center">

          {/* Title */}
          <motion.h1
            className="text-5xl sm:text-7xl font-black text-white leading-none mb-2 drop-shadow-xl tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            PisoBlox
          </motion.h1>
          <motion.h1
            className="text-5xl sm:text-7xl font-black leading-none mb-5 drop-shadow-xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            ITEMS, ACCOUNTS, AT ROBUX
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-gray-200 mb-8 leading-relaxed max-w-lg font-medium drop-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Bumili at magbenta ng Roblox items, accounts,<br className="hidden sm:block" /> at Robux nang ligtas. Para sa mga Pinoy buyers and sellers.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 mb-10 w-full max-w-xl shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Maghanap ng items, accounts, Robux..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shrink-0"
            >
              Hanapin
            </button>
          </motion.form>

          {/* CTA buttons */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link
              href="/listings"
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              Mag-browse
            </Link>
            <Link
              href="/listings/create"
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              Magbenta →
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="w-full bg-[#0d1117]">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <CategoryCarousel
              title="Items"
              icon={<ShoppingBag className="w-5 h-5 text-blue-400" />}
              listings={itemListings}
              href="/listings?category=item"
            />
            <CategoryCarousel
              title="Accounts"
              icon={<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
              listings={accountListings}
              href="/listings?category=account"
            />
            <CategoryCarousel
              title="Robux"
              icon={<span className="text-green-400 font-black text-base leading-none">R$</span>}
              listings={robuxListings}
              href="/listings?category=robux"
            />
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-[#0d1117] border-y border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Paano Ito Gumagana</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <ShoppingBag className="w-6 h-6" />, step: "1", title: "Mag-search ng Item", desc: "Maghanap ng items, accounts, at Robux mula sa mga PH sellers." },
              { icon: <Search className="w-6 h-6" />, step: "2", title: "Hanapin ang Gusto Mo", desc: "I-filter ayon sa kategorya, presyo, at keyword para makita agad ang hinahanap mo." },
              { icon: <Link2 className="w-6 h-6" />, step: "3", title: "Makipag-ugnayan sa Facebook", desc: "I-tap ang Makipag-ugnayan — ligtas kang dadalhin sa Facebook ng seller." },
              { icon: <Shield className="w-6 h-6" />, step: "4", title: "Mag-trade nang May Ingat", desc: "Sundin ang aming safety tips: mag-screenshot, bayad sa GCash, at laging may middleman." },
            ].map((item) => (
              <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-500">HAKBANG {item.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1117] w-full">
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-blue-500 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">May Ibebenta ka ba?</h2>
          <p className="text-blue-100 text-sm mb-6">Gumawa ng libreng listing at maabot ang daan-daang Filipino Roblox buyers.</p>
          <Link
            href="/auth/register"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Gumawa ng Libreng Account
          </Link>
        </div>
      </div>
      </section>
    </div>
  );
}
