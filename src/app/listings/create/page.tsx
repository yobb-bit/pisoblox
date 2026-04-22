"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { type Category } from "@/types";
import { Upload, Link2, Info } from "lucide-react";
import Image from "next/image";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PaymentModal } from "@/components/PaymentModal";

const categories: { value: Category; label: string; desc: string }[] = [
  { value: "item", label: "Item", desc: "Limiteds, accessories, gear" },
  { value: "account", label: "Account", desc: "Buong Roblox accounts" },
  { value: "robux", label: "Robux", desc: "Magbenta ng Robux para sa PHP" },
];

export default function CreateListingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("item");
  const [facebookLink, setFacebookLink] = useState("");
  // Account-specific fields
  const [emailKasama, setEmailKasama] = useState<boolean | null>(null);
  const [ogAccount, setOgAccount] = useState<boolean | null>(null);
  const [mayLimiteds, setMayLimiteds] = useState<boolean | null>(null);
  const [level, setLevel] = useState("");
  // Robux-specific fields
  const [ilangRobux, setIlangRobux] = useState("");
  const [taxCovered, setTaxCovered] = useState<boolean | null>(null);
  const [paraan, setParaan] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [listingCount, setListingCount] = useState(0);
  const [listingLimit, setListingLimit] = useState(10);
  const [limitLoading, setLimitLoading] = useState(true);
  const router = useRouter();

  // Check how many listings the user has and what their limit is
  useEffect(() => {
    async function checkLimit() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ count }, { data: profile }] = await Promise.all([
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("listing_limit")
          .eq("id", user.id)
          .single(),
      ]);

      setListingCount(count ?? 0);
      setListingLimit(profile?.listing_limit ?? 10);
      setLimitLoading(false);
    }
    checkLimit();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ang larawan ay dapat mas mababa sa 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check limit before anything else
    if (listingCount >= listingLimit) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Kailangan mong mag-login."); setLoading(false); return; }

    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, imageFile);

      if (uploadError) {
        setError("Hindi na-upload ang larawan: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const fbLink = facebookLink.trim();
    if (!fbLink.startsWith("https://www.facebook.com/") && !fbLink.startsWith("https://facebook.com/") && !fbLink.startsWith("https://fb.com/")) {
      setError("Pakilagay ang tamang Facebook profile URL (hal. https://www.facebook.com/yourname)");
      setLoading(false);
      return;
    }

    let finalTitle = title.trim();
    let finalDescription = description.trim();
    let finalPrice = parseFloat(price);

    if (category === "account") {
      const extras = [
        emailKasama !== null ? `Email kasama: ${emailKasama ? "Oo" : "Hindi"}` : null,
        ogAccount !== null ? `OG Account: ${ogAccount ? "Oo" : "Hindi"}` : null,
        mayLimiteds !== null ? `May Limiteds: ${mayLimiteds ? "Oo" : "Hindi"}` : null,
        level.trim() ? `Level: ${level.trim()}` : null,
      ].filter(Boolean);
      if (extras.length > 0) {
        finalDescription = extras.join("\n") + (finalDescription ? "\n\n" + finalDescription : "");
      }
    } else if (category === "robux") {
      if (!ilangRobux || parseFloat(ilangRobux) <= 0) {
        setError("Ilagay ang bilang ng Robux na ibebenta.");
        setLoading(false);
        return;
      }
      const extras = [
        `Robux: ${parseFloat(ilangRobux).toLocaleString()}`,
        taxCovered !== null ? `Tax covered: ${taxCovered ? "Oo" : "Hindi"}` : null,
        paraan ? `Paraan: ${paraan}` : null,
      ].filter(Boolean);
      finalTitle = finalTitle || `${parseFloat(ilangRobux).toLocaleString()} Robux`;
      finalDescription = extras.join("\n") + (finalDescription ? "\n\n" + finalDescription : "");
      finalPrice = parseFloat(price);
    }

    const { error: insertError } = await supabase.from("listings").insert({
      user_id: user.id,
      title: finalTitle,
      description: finalDescription,
      price: finalPrice,
      category,
      image_url,
      facebook_link: fbLink,
      seller_username: user.user_metadata?.username ?? user.email?.split("@")[0],
      is_sold: false,
      is_featured: false,
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/listings");
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Magbenta ng items/accounts/robux</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">I-list ang iyong Roblox item o account para ibenta</p>
        </div>

        {/* Listing limit progress bar */}
        {!limitLoading && (
          <div className={`mb-5 p-4 rounded-xl border ${
            listingCount >= listingLimit
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Free listing limit: {listingLimit} {listingLimit === 1 ? "listing" : "listings"}. Upgrade para sa mas maraming listings.
              </p>
              <span className={`text-sm font-bold ${
                listingCount >= listingLimit ? "text-red-500" : "text-gray-900 dark:text-white"
              }`}>
                {listingCount} / {listingLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  listingCount >= listingLimit ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min((listingCount / listingLimit) * 100, 100)}%` }}
              />
            </div>
            {listingCount >= listingLimit && (
              <p className="text-xs text-red-500 mt-2">
                Naabot mo na ang limit. Mag-upgrade para makapag-dagdag pa ng listings.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="mt-3 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
            >
              Magbayad ng ₱49 para sa karagdagang +5 listings
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Kategorya</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    category === c.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{c.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Detalye ng Binebenta mo</h2>

            {/* Item fields */}
            {category === "item" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pangalan ng item</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="hal. Valkyrie Helm, Korblox Deathspeaker"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Paglalarawan</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Ilarawan ang iyong item, kasaysayan ng trade, mga kasamang items, atbp."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Presyo (₱ PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min={1}
                      placeholder="0"
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Account fields */}
            {category === "account" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Anong laro</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="hal. OG Account na may Headless, Level 100+"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email kasama?</label>
                    <div className="flex gap-2">
                      {[true, false].map((val) => (
                        <button key={String(val)} type="button" onClick={() => setEmailKasama(val)}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            emailKasama === val
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}>
                          {val ? "Oo" : "Hindi"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">OG Account?</label>
                    <div className="flex gap-2">
                      {[true, false].map((val) => (
                        <button key={String(val)} type="button" onClick={() => setOgAccount(val)}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            ogAccount === val
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}>
                          {val ? "Oo" : "Hindi"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">May Limiteds?</label>
                    <div className="flex gap-2">
                      {[true, false].map((val) => (
                        <button key={String(val)} type="button" onClick={() => setMayLimiteds(val)}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            mayLimiteds === val
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}>
                          {val ? "Oo" : "Hindi"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Anong level?</label>
                    <input
                      type="number"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      min={1}
                      placeholder="hal. 100"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Presyo (₱ PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min={1}
                      placeholder="0"
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dagdag na detalye (opsyonal)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Ibang impormasyon tungkol sa account, mga items, atbp."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>
              </>
            )}

            {/* Robux fields */}
            {category === "robux" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ilang Robux?</label>
                    <input
                      type="number"
                      value={ilangRobux}
                      onChange={(e) => setIlangRobux(e.target.value)}
                      required
                      min={1}
                      placeholder="hal. 10000"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Presyo (₱ PHP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        min={1}
                        placeholder="0"
                        className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax covered?</label>
                  <p className="text-xs text-gray-400 mb-2">Roblox ay nagbabawas ng 30% tax sa gamepass/group funds</p>
                  <div className="flex gap-2">
                    {[true, false].map((val) => (
                      <button key={String(val)} type="button" onClick={() => setTaxCovered(val)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          taxCovered === val
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}>
                        {val ? "Oo, covered" : "Hindi, buyer ang mag-aasikaso"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Paraan ng pagbibigay</label>
                  <select
                    value={paraan}
                    onChange={(e) => setParaan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Pumili ng paraan...</option>
                    <option value="Gamepass">Gamepass</option>
                    <option value="Group Funds">Group Funds</option>
                    <option value="Iba pa">Iba pa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pamagat ng listing</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    placeholder={ilangRobux ? `${parseFloat(ilangRobux || "0").toLocaleString()} Robux` : "hal. 10,000 Robux — mabilis"}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dagdag na detalye (opsyonal)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Ibang impormasyon, terms, atbp."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Larawan (opsyonal)</h2>
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 transition-colors relative"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              {imagePreview ? (
                <div className="relative w-32 h-32">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-lg" />
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  <span className="text-sm text-gray-400">I-click para mag-upload ng larawan</span>
                  <span className="text-xs text-gray-300 dark:text-gray-600">PNG, JPG hanggang 5MB</span>
                </>
              )}
              <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Facebook Profile Link</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Dito makikipag-ugnayan ang mga buyers sa iyo. Ito ang paraan para makausap ka nila.
            </p>
            <input
              type="url"
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              required
              placeholder="https://www.facebook.com/iyongprofile"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || limitLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Sine-save..." : "I-publish ang Listing"}
          </button>
        </form>
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          currentLimit={listingLimit}
          currentCount={listingCount}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </>
  );
}
