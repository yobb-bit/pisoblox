"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Listing } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { FeatureModal } from "@/components/FeatureModal";
import { UserCircle, Package, Plus, Star } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureListing, setFeatureListing] = useState<Listing | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("listings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setListings(data ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter((l) => !l.is_sold);
  const soldListings = listings.filter((l) => l.is_sold);
  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0];

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 flex items-center gap-5"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <UserCircle className="w-10 h-10 text-blue-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{username}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">{activeListings.length}</strong> aktibo
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">{soldListings.length}</strong> nabenta
            </span>
          </div>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Bagong Listing
        </Link>
      </motion.div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Wala pang listings</p>
          <p className="text-sm mt-1 mb-4">Gumawa ng iyong unang listing para magsimulang magbenta</p>
          <Link
            href="/listings/create"
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Gumawa ng Listing
          </Link>
        </div>
      ) : (
        <>
          {activeListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Aktibong Listings</h2>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {activeListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    className="flex flex-col gap-1.5"
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                  >
                    <ListingCard listing={listing} />
                    {listing.is_featured ? (
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
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
          {soldListings.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-4">Nabenta Na</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 opacity-60">
                {soldListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </>
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
