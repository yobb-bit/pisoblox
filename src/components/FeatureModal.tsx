"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Star, CheckCircle, Upload, Hash } from "lucide-react";
import Image from "next/image";

interface FeatureModalProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function FeatureModal({ listingId, listingTitle, onClose }: FeatureModalProps) {
  const [proofType, setProofType] = useState<"ref" | "image">("ref");
  const [refNumber, setRefNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Ang larawan ay dapat mas mababa sa 5MB."); return; }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (proofType === "ref" && !refNumber.trim()) { setError("Ilagay ang GCash reference number."); return; }
    if (proofType === "image" && !receiptFile) { setError("Mag-upload ng larawan ng iyong resibo."); return; }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Kailangan mong mag-login."); setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

    let receipt_url: string | null = null;
    if (proofType === "image" && receiptFile) {
      const ext = receiptFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("payment-receipts").upload(path, receiptFile);
      if (uploadError) { setError("Hindi na-upload ang resibo: " + uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("payment-receipts").getPublicUrl(path);
      receipt_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("payment_requests").insert({
      user_id: user.id,
      username: profile?.username ?? user.email?.split("@")[0],
      gcash_ref: proofType === "ref" ? refNumber.trim() : null,
      receipt_url,
      type: "feature",
      listing_id: listingId,
    });

    if (insertError) { setError("May error. Subukan ulit o i-message kami direkta."); }
    else { setSubmitted(true); }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-900 fill-yellow-900" />
            </div>
            <div>
              <h2 className="font-bold text-yellow-900 text-base">I-feature ang Listing</h2>
              <p className="text-yellow-800 text-xs mt-0.5 line-clamp-1">{listingTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-yellow-900" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-bold text-gray-900 dark:text-white">Natanggap ang iyong request!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                I-aactivate namin ang featured status ng iyong listing within 24 hours pagkatapos ma-verify ang iyong bayad.
              </p>
              <button onClick={onClose} className="mt-2 w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold transition-colors">
                Sige, salamat!
              </button>
            </div>
          ) : (
            <>
              {/* What you get */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">Featured Listing</span>
                  </div>
                  <span className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">₱29</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Mas makikita ito ng mga buyer kasi ilalagay namin ito sa unahan ng listahan. May golden border din ang card mo para mapansin agad.
                </p>
              </div>

              {/* Step 1: Pay */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                  Hakbang 1 — Magpadala ng bayad
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Magpadala ng <strong>₱29</strong> sa GCash number na ito:
                </p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-widest mt-2 text-center">
                  0985-883-9028
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">(John Kent B.)</p>
              </div>

              {/* Step 2: Proof */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Hakbang 2 — Patunay ng bayad
                </p>

                <div className="flex gap-2 mb-4">
                  {(["ref", "image"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => { setProofType(type); setError(""); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        proofType === type
                          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                      {type === "ref" ? <><Hash className="w-3.5 h-3.5" />Reference No.</> : <><Upload className="w-3.5 h-3.5" />Screenshot</>}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {proofType === "ref" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GCash Reference Number</label>
                      <input
                        type="text"
                        value={refNumber}
                        onChange={(e) => setRefNumber(e.target.value)}
                        placeholder="hal. 1234567890"
                        maxLength={30}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm tracking-widest"
                      />
                      <p className="text-xs text-gray-400 mt-1">Makikita ang reference number sa iyong GCash receipt</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Screenshot ng GCash Receipt</label>
                      <div
                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-yellow-400 transition-colors"
                        onClick={() => document.getElementById("feature-receipt-input")?.click()}
                      >
                        {receiptPreview ? (
                          <div className="relative w-full h-40">
                            <Image src={receiptPreview} alt="Receipt" fill className="object-contain rounded-lg" />
                          </div>
                        ) : (
                          <>
                            <Upload className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                            <span className="text-sm text-gray-400">I-click para mag-upload</span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">PNG, JPG hanggang 5MB</span>
                          </>
                        )}
                        <input id="feature-receipt-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Bumalik
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-yellow-900 text-sm font-semibold transition-colors">
                      {loading ? "Sinusumite..." : "I-submit"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
