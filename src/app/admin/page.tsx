"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Users, Package, ShoppingBag, TrendingUp,
  Plus, Minus, Search, Shield, BadgeCheck, Star,
  CheckCircle, XCircle, Clock
} from "lucide-react";

type SellerRow = {
  id: string;
  username: string;
  listing_limit: number;
  is_verified: boolean;
  created_at: string;
  active_listings: number;
  sold_listings: number;
  total_listings: number;
};

type PaymentRequest = {
  id: string;
  user_id: string;
  username: string;
  gcash_ref: string | null;
  receipt_url: string | null;
  status: string;
  type: string;
  listing_id: string | null;
  created_at: string;
};

type Stats = {
  totalSellers: number;
  totalListings: number;
  totalSold: number;
  totalActive: number;
};

export default function AdminDashboard() {
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [featuredListings, setFeaturedListings] = useState<{ id: string; title: string; seller_username: string; is_featured: boolean }[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { router.push("/auth/login"); return; }

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch all listings
      const { data: allListings } = await supabase
        .from("listings")
        .select("id, user_id, is_sold, title, seller_username, is_featured");

      setFeaturedListings(
        (allListings ?? [])
          .filter((l) => !l.is_sold)
          .map((l) => ({ id: l.id, title: l.title, seller_username: l.seller_username, is_featured: l.is_featured }))
          .slice(0, 20)
      );

      if (!profiles || !allListings) { setLoading(false); return; }

      // Build seller rows by combining profiles + listing counts
      const sellerRows: SellerRow[] = profiles.map((p) => {
        const userListings = allListings.filter((l) => l.user_id === p.id);
        const active = userListings.filter((l) => !l.is_sold).length;
        const sold = userListings.filter((l) => l.is_sold).length;
        return {
          id: p.id,
          username: p.username,
          listing_limit: p.listing_limit,
          is_verified: p.is_verified ?? false,
          created_at: p.created_at,
          active_listings: active,
          sold_listings: sold,
          total_listings: userListings.length,
        };
      });

      setSellers(sellerRows);
      setStats({
        totalSellers: profiles.length,
        totalListings: allListings.length,
        totalSold: allListings.filter((l) => l.is_sold).length,
        totalActive: allListings.filter((l) => !l.is_sold).length,
      });

      // Fetch payment requests
      const { data: payments } = await supabase
        .from("payment_requests")
        .select("*")
        .order("created_at", { ascending: false });
      setPaymentRequests(payments ?? []);

      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function adjustLimit(sellerId: string, currentLimit: number, change: number) {
    const newLimit = Math.max(10, currentLimit + change);
    setUpdating(sellerId);
    const supabase = createClient();
    await supabase.from("profiles").update({ listing_limit: newLimit }).eq("id", sellerId);
    setSellers((prev) => prev.map((s) => s.id === sellerId ? { ...s, listing_limit: newLimit } : s));
    setUpdating(null);
  }

  async function toggleVerified(sellerId: string, current: boolean) {
    setUpdating(sellerId);
    const supabase = createClient();
    await supabase.from("profiles").update({ is_verified: !current }).eq("id", sellerId);
    setSellers((prev) => prev.map((s) => s.id === sellerId ? { ...s, is_verified: !current } : s));
    setUpdating(null);
  }

  async function toggleFeatured(listingId: string, current: boolean) {
    const supabase = createClient();
    const featuredUntil = current ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("listings").update({ is_featured: !current, featured_until: featuredUntil }).eq("id", listingId);
    setFeaturedListings((prev) => prev.map((l) => l.id === listingId ? { ...l, is_featured: !current } : l));
  }

  async function handlePayment(req: PaymentRequest, action: "approved" | "rejected") {
    const supabase = createClient();
    await supabase.from("payment_requests").update({ status: action }).eq("id", req.id);
    if (action === "approved") {
      if (req.listing_id) {
        const { error } = await supabase.from("listings").update({
          is_featured: true,
          featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq("id", req.listing_id);
        if (error) { alert("Error sa pag-feature ng listing: " + error.message); return; }
      } else {
        const seller = sellers.find((s) => s.id === req.user_id);
        const currentLimit = seller?.listing_limit ?? 10;
        const { error } = await supabase.from("profiles").update({ listing_limit: currentLimit + 5 }).eq("id", req.user_id);
        if (error) { alert("Error sa pag-update ng limit: " + error.message); return; }
        setSellers((prev) => prev.map((s) => s.id === req.user_id ? { ...s, listing_limit: s.listing_limit + 5 } : s));
      }
    }
    setPaymentRequests((prev) => prev.map((p) => p.id === req.id ? { ...p, status: action } : p));
  }

  const filteredSellers = sellers.filter((s) =>
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Walang Access</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Admin lang ang pwedeng pumasok dito.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">I-monitor ang lahat ng sellers at listings</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Kabuuang Sellers", value: stats?.totalSellers ?? 0, icon: <Users className="w-5 h-5" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Aktibong Listings", value: stats?.totalActive ?? 0, icon: <Package className="w-5 h-5" />, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label: "Nabenta Na", value: stats?.totalSold ?? 0, icon: <ShoppingBag className="w-5 h-5" />, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Kabuuang Listings", value: stats?.totalListings ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Featured Listings panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">I-feature ang mga Listing</h2>
          <span className="text-xs text-gray-400 ml-1">(pinakabagong 20 listings)</span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {featuredListings.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">Walang listings</p>
          ) : featuredListings.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{l.title}</p>
                <p className="text-xs text-gray-400">{l.seller_username}</p>
              </div>
              <button
                onClick={() => toggleFeatured(l.id, l.is_featured)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  l.is_featured
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${l.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                {l.is_featured ? "I-remove ang Feature" : "I-feature"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Requests */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Payment Requests</h2>
          {paymentRequests.filter((p) => p.status === "pending").length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
              {paymentRequests.filter((p) => p.status === "pending").length} pending
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {paymentRequests.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">Walang payment requests</p>
          ) : paymentRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between px-5 py-3 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{req.username}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    req.type === "feature"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}>
                    {req.type === "feature" ? "⭐ Featured — ₱29" : "🔼 Upgrade — ₱49"}
                  </span>
                  {req.status === "pending" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">Pending</span>
                  )}
                  {req.status === "approved" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">Approved</span>
                  )}
                  {req.status === "rejected" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">Rejected</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {req.gcash_ref
                    ? <>Ref: <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{req.gcash_ref}</span></>
                    : req.receipt_url
                      ? <a href={req.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Tingnan ang screenshot →</a>
                      : <span className="italic text-gray-300">Walang patunay</span>
                  }
                  <span className="ml-2">{new Date(req.created_at).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </p>
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handlePayment(req, "approved")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {req.listing_id ? "Approve (Feature)" : "Approve (+5)"}
                  </button>
                  <button
                    onClick={() => handlePayment(req, "rejected")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sellers table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Lahat ng Sellers</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Maghanap ng seller..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Seller</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aktibo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nabenta</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kabuuan</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Limit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ayusin ang Limit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sumali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-gray-600">
                    Walang sellers na nahanap
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 text-xs font-bold">
                          {seller.username[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{seller.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">{seller.active_listings}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">{seller.sold_listings}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-600 dark:text-gray-400">{seller.total_listings}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${
                        seller.active_listings >= seller.listing_limit
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {seller.active_listings}/{seller.listing_limit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => adjustLimit(seller.id, seller.listing_limit, -5)}
                          disabled={updating === seller.id || seller.listing_limit <= 10}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 disabled:opacity-30 transition-colors"
                          title="Bawasan ng 5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-center">
                          {seller.listing_limit}
                        </span>
                        <button
                          onClick={() => adjustLimit(seller.id, seller.listing_limit, 5)}
                          disabled={updating === seller.id}
                          className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-500 disabled:opacity-30 transition-colors"
                          title="Dagdagan ng 5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVerified(seller.id, seller.is_verified)}
                        disabled={updating === seller.id}
                        className={`flex items-center gap-1 mx-auto px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          seller.is_verified
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        title={seller.is_verified ? "I-remove ang verified" : "I-verify ang seller"}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {seller.is_verified ? "Verified" : "Hindi pa"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(seller.created_at).toLocaleDateString("fil-PH", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
