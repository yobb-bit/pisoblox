"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Listing, type Profile } from "@/types";
import { ContactSellerModal } from "@/components/ContactSellerModal";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tag, User, Calendar, ArrowLeft, MessageCircle, CheckCircle, Clock, Star, BadgeCheck, AlertTriangle } from "lucide-react";

const categoryLabel: Record<string, string> = {
  item: "Item",
  account: "Account",
  robux: "Robux",
};

function getDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [markingAsSold, setMarkingAsSold] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      const supabase = createClient();
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      setListing(data);

      if (data) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user_id)
          .single();
        setSellerProfile(profile);
      }

      setLoading(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) setIsOwner(user.id === data.user_id);
    }
    fetchListing();
  }, [id]);

  async function handleMarkAsSold() {
    if (!listing) return;
    setMarkingAsSold(true);
    const supabase = createClient();
    await supabase.from("listings").update({ is_sold: true }).eq("id", listing.id);
    setListing({ ...listing, is_sold: true });
    setMarkingAsSold(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="flex flex-col gap-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg mb-4">Hindi nahanap ang listing.</p>
        <Link href="/listings" className="text-blue-500 hover:underline text-sm">← Bumalik sa mga listings</Link>
      </div>
    );
  }

  const daysLeft = getDaysLeft(listing.expires_at);
  const isExpired = daysLeft === 0;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Bumalik sa mga listings
        </Link>

        {/* Featured banner */}
        {listing.is_featured && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Featured Listing</p>
          </div>
        )}

        {/* Expiry warning */}
        {isExpiringSoon && !isExpired && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-xl">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Mag-e-expire ang listing na ito sa loob ng <strong>{daysLeft} araw</strong>
            </p>
          </div>
        )}

        {/* Expired warning */}
        {isExpired && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Ang listing na ito ay <strong>expired na</strong> at hindi na available.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative">
            {listing.image_url ? (
              <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Tag className="w-20 h-20 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            {listing.is_sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-3xl tracking-widest">NABENTA NA</span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{listing.title}</h1>
              <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                {categoryLabel[listing.category]}
              </span>
            </div>

            <p className="text-3xl font-bold text-blue-500 mb-4">₱{listing.price.toLocaleString()}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <Link href={`/profile/${listing.user_id}`} className="hover:text-blue-500 transition-colors">
                  {listing.seller_username}
                </Link>
                {sellerProfile?.is_verified && (
                  <BadgeCheck className="w-4 h-4 fill-blue-500 text-white" />
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(listing.created_at).toLocaleDateString("fil-PH", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>

            {/* Expiry info */}
            {daysLeft !== null && daysLeft > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Mag-e-expire sa <strong className={isExpiringSoon ? "text-orange-500" : ""}>{daysLeft} araw</strong></span>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Paglalarawan</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {listing.is_sold ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl font-semibold">
                <CheckCircle className="w-5 h-5" />
                Nabenta na ang item na ito
              </div>
            ) : isExpired ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-semibold">
                <AlertTriangle className="w-5 h-5" />
                Expired na ang listing na ito
              </div>
            ) : isOwner ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleMarkAsSold}
                  disabled={markingAsSold}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                >
                  {markingAsSold ? "Ina-update..." : "Markahan bilang Nabenta"}
                </button>
                <p className="text-xs text-center text-gray-400">Ito ang iyong listing</p>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Makipag-ugnayan sa Seller
              </button>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-3">
              Laging i-verify ang seller bago magpadala ng bayad
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <ContactSellerModal
          sellerUsername={listing.seller_username}
          facebookLink={listing.facebook_link}
          isVerified={sellerProfile?.is_verified ?? false}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
