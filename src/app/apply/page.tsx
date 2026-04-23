"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Shield, Phone, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ApplyPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [facebookProfile, setFacebookProfile] = useState("");
  const [status, setStatus] = useState<"unverified" | "pending" | "approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("seller_status, phone_number, facebook_profile")
        .eq("id", user.id)
        .single();

      if (profile) {
        setStatus(profile.seller_status);
        setPhoneNumber(profile.phone_number ?? "");
        setFacebookProfile(profile.facebook_profile ?? "");
      }
      setLoading(false);
    }
    fetchStatus();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const phone = phoneNumber.trim();
    const fb = facebookProfile.trim();

    if (!/^(09|\+639)\d{9}$/.test(phone)) {
      setError("Ilagay ang tamang PH mobile number (hal. 09171234567)");
      return;
    }
    if (!fb.startsWith("https://www.facebook.com/") && !fb.startsWith("https://facebook.com/")) {
      setError("Ilagay ang tamang Facebook profile URL (hal. https://www.facebook.com/yourname)");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        seller_status: "pending",
        phone_number: phone,
        facebook_profile: fb,
        seller_applied_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
    } else {
      setStatus("pending");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-14 h-14 mx-auto text-green-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Naaprubahan ka na!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Pwede ka nang mag-post ng listings sa PisoBlox.</p>
        <button
          onClick={() => router.push("/listings/create")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Mag-post ng Listing
        </button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Clock className="w-14 h-14 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Na-submit na ang iyong application!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Isinusuri pa ng admin ang iyong account. Hintayin lang — karaniwang 1-2 araw.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <XCircle className="w-14 h-14 mx-auto text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Na-reject ang iyong application</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Hindi naaprubahan ng admin ang iyong account. Maaari kang mag-apply ulit na may tamang impormasyon.
        </p>
        <form onSubmit={handleSubmit} className="text-left flex flex-col gap-4">
          <ApplicationFields
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            facebookProfile={facebookProfile}
            setFacebookProfile={setFacebookProfile}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? "Sine-submit..." : "Mag-apply Ulit"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mag-apply bilang Seller</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kailangan muna naming i-verify ang iyong identity</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">Bakit kailangan ito?</p>
        <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">
          Para maprotektahan ang mga buyer at mabawasan ang mga scammer, kailangan naming i-verify ang bawat seller bago sila makapag-post ng listings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <ApplicationFields
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            facebookProfile={facebookProfile}
            setFacebookProfile={setFacebookProfile}
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? "Sine-submit..." : "I-submit ang Application"}
        </button>
      </form>
    </div>
  );
}

function ApplicationFields({
  phoneNumber, setPhoneNumber, facebookProfile, setFacebookProfile,
}: {
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  facebookProfile: string;
  setFacebookProfile: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          GCash / Mobile Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          placeholder="hal. 09171234567"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Gamitin ang number na naka-link sa iyong GCash</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
          Facebook Profile Link
        </label>
        <input
          type="url"
          value={facebookProfile}
          onChange={(e) => setFacebookProfile(e.target.value)}
          required
          placeholder="https://www.facebook.com/yourname"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Ang iyong personal na Facebook account para ma-verify ka ng admin</p>
      </div>
    </>
  );
}
