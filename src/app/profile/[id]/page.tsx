"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Listing } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { UserCircle, Package, Calendar, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type SellerInfo = {
  username: string;
  joined: string;
  activeCount: number;
  soldCount: number;
};

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const activeListings = data.filter((l) => !l.is_sold);
      const soldListings = data.filter((l) => l.is_sold);

      setSeller({
        username: data[0].seller_username,
        joined: data[0].created_at,
        activeCount: activeListings.length,
        soldCount: soldListings.length,
      });

      setListings(data);
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <UserCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hindi nahanap ang seller</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Baka wala pang listings ang user na ito.</p>
        <Link href="/listings" className="text-blue-500 hover:underline text-sm">← Bumalik sa mga listings</Link>
      </div>
    );
  }

  const activeListings = listings.filter((l) => !l.is_sold);
  const soldListings = listings.filter((l) => l.is_sold);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Seller card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <UserCircle className="w-10 h-10 text-blue-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{seller?.username}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Sumali noong{" "}
                {new Date(seller?.joined ?? "").toLocaleDateString("fil-PH", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Tag className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{seller?.activeCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Aktibong Listings</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <ShoppingBag className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{seller?.soldCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nabenta Na</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{listings.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kabuuang Listings</p>
          </div>
        </div>
      </div>

      {/* Active listings */}
      {activeListings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Aktibong Listings ni {seller?.username}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Sold listings */}
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

      {/* No active listings */}
      {activeListings.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Wala pang aktibong listings</p>
          <p className="text-sm mt-1">Tingnan mo ulit mamaya</p>
        </div>
      )}

    </div>
  );
}
