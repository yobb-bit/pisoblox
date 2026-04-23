"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { type Listing, type Category } from "@/types";
import { Search, SlidersHorizontal, ArrowUpDown, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureModal } from "@/components/FeatureModal";

const categories: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "Lahat" },
  { value: "item", label: "Items" },
  { value: "account", label: "Accounts" },
  { value: "robux", label: "Robux" },
];

const sortOptions = [
  { value: "newest", label: "Pinakabago" },
  { value: "oldest", label: "Pinakamatanda" },
  { value: "cheapest", label: "Pinakamura" },
  { value: "expensive", label: "Pinakamahál" },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [verifiedSellers, setVerifiedSellers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [featureListing, setFeatureListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      let query = supabase
        .from("listings")
        .select("*")
        .eq("is_sold", false)
        .gt("expires_at", new Date().toISOString());

      if (category !== "all") query = query.eq("category", category);
      if (search.trim()) query = query.ilike("title", `%${search.trim()}%`);
      if (minPrice) query = query.gte("price", parseFloat(minPrice));
      if (maxPrice) query = query.lte("price", parseFloat(maxPrice));

      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "oldest") query = query.order("created_at", { ascending: true });
      else if (sort === "cheapest") query = query.order("price", { ascending: true });
      else if (sort === "expensive") query = query.order("price", { ascending: false });

      const { data } = await query;

      // Sort: featured first, then rest
      const sorted = (data ?? []).sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });

      setListings(sorted);

      // Fetch verified sellers
      const userIds = [...new Set((data ?? []).map((l) => l.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, is_verified")
          .in("id", userIds);
        const verifiedSet = new Set(
          (profiles ?? []).filter((p) => p.is_verified).map((p) => p.id)
        );
        setVerifiedSellers(verifiedSet);
      }

      setLoading(false);
    }
    fetchListings();
  }, [search, category, minPrice, maxPrice, sort]);

  const hasActiveFilters = minPrice || maxPrice || category !== "all";

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">I-search ang mga nasa Listahan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Hanapin ang Roblox items at accounts mula sa mga PH sellers</p>
      </motion.div>

      {/* Search + Sort row */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Maghanap ng items..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </button>
      </div>

      {/* Expandable filter panel */}
      <AnimatePresence>
      {showFilters && (
        <motion.div
          className="mb-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Category */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Kategorya</p>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === c.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Hanay ng Presyo (₱)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min={0}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-gray-400 shrink-0">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min={0}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {hasActiveFilters && (
                <button
                  onClick={() => { setMinPrice(""); setMaxPrice(""); setCategory("all"); }}
                  className="shrink-0 text-xs text-red-500 hover:underline"
                >
                  I-clear
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Walang listings na nahanap</p>
          <p className="text-sm mt-1">Subukan ang ibang search o kategorya</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              className="flex flex-col gap-1.5"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
            >
              <ListingCard
                listing={listing}
                sellerVerified={verifiedSellers.has(listing.user_id)}
              />
              {currentUserId === listing.user_id && !listing.is_sold && (
                listing.is_featured ? (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Featured na!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setFeatureListing(listing)}
                    className="w-full py-2 px-3 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-300 dark:border-yellow-700 transition-colors text-left"
                  >
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      ₱29 para i-feature ito
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">
                      Mas makikita ng mga buyer — ilalagay namin sa unahan
                    </p>
                  </button>
                )
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>

      {featureListing && (
        <FeatureModal
          listingId={featureListing.id}
          listingTitle={featureListing.title}
          onClose={() => setFeatureListing(null)}
        />
      )}
    </>
  );
}
