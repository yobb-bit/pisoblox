import Link from "next/link";
import Image from "next/image";
import { type Listing } from "@/types";
import { Tag, User, Star, BadgeCheck, Clock } from "lucide-react";

const categoryLabel: Record<string, string> = {
  item: "Item",
  account: "Account",
  robux: "Robux",
};

const categoryColor: Record<string, string> = {
  item: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  account: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  robux: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

function getDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ListingCard({ listing, sellerVerified = false }: { listing: Listing; sellerVerified?: boolean }) {
  const daysLeft = getDaysLeft(listing.expires_at);
  const isExpired = daysLeft === 0;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className={`group relative bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden transition-all ${
        listing.is_featured
          ? "border-yellow-400 dark:border-yellow-500 shadow-md shadow-yellow-100 dark:shadow-yellow-900/20"
          : "border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
      }`}>

        {/* Featured banner */}
        {listing.is_featured && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 text-xs font-bold text-center py-0.5 flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-yellow-900" />
            FEATURED
          </div>
        )}

        <div className={`aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${listing.is_featured ? "mt-5" : ""}`}>
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600">
              <Tag className="w-12 h-12" />
            </div>
          )}
          {listing.is_sold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-wide">NABENTA</span>
            </div>
          )}
          {isExpired && !listing.is_sold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-wide">EXPIRED</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[listing.category]}`}>
              {categoryLabel[listing.category]}
            </span>
          </div>
          <p className="text-blue-500 font-bold text-sm mb-2">₱{listing.price.toLocaleString()}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <User className="w-3 h-3" />
              <span>{listing.seller_username}</span>
              {sellerVerified && (
                <BadgeCheck className="w-3.5 h-3.5 fill-blue-500 text-white" />
              )}
            </div>
            {isExpiringSoon && (
              <div className="flex items-center gap-0.5 text-xs text-orange-500 font-medium">
                <Clock className="w-3 h-3" />
                {daysLeft}d
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
