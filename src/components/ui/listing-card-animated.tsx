"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Tag, Star } from "lucide-react";
import { type Listing } from "@/types";

const categoryLabel: Record<string, string> = {
  item: "Item",
  account: "Account",
  robux: "Robux",
};

interface ListingCardAnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  listing: Listing;
}

export const ListingCardAnimated = React.forwardRef<HTMLDivElement, ListingCardAnimatedProps>(
  ({ className, listing, ...props }, ref) => {
    return (
      <Link href={`/listings/${listing.id}`} className="block h-full">
        <motion.div
          ref={ref}
          className={cn(
            "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-shadow duration-300",
            className
          )}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {/* Featured banner */}
          {listing.is_featured && (
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold tracking-wide">
              <Star className="w-3 h-3 fill-yellow-800" />
              FEATURED
            </div>
          )}

          {/* Image */}
          <div className={`relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden ${listing.is_featured ? "pt-7" : ""}`}>
            <div className="aspect-square">
              {listing.image_url ? (
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>
            {listing.is_sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg tracking-widest">NABENTA NA</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-3 flex flex-col gap-1 flex-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 leading-tight">
                {listing.title}
              </p>
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                {categoryLabel[listing.category]}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{listing.seller_username}</span>
            </div>

            <p className="text-base font-bold text-blue-500 mt-auto pt-1">
              ₱{listing.price.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }
);

ListingCardAnimated.displayName = "ListingCardAnimated";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 12 },
  },
};
