"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { type Listing } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      if (!data) { setLoading(false); return; }

      if (data.user_id !== user.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setListing(data);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price));
      setImagePreview(data.image_url);
      setLoading(false);
    }
    fetchListing();
  }, [id, router]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    let image_url = listing.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `listings/${listing.user_id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, imageFile, { upsert: true });
      if (uploadError) {
        setError("Hindi na-upload ang larawan: " + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase.from("listings").update({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image_url,
    }).eq("id", listing.id);

    if (updateError) {
      setError("May error: " + updateError.message);
      setSaving(false);
      return;
    }

    router.push(`/listings/${listing.id}`);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-6 w-32 bg-gray-800 rounded" />
          <div className="h-10 bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-800 rounded-xl" />
          <div className="h-10 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8 text-center">
        <p className="text-gray-400">Hindi mo pwedeng i-edit ang listing na ito.</p>
        <Link href="/profile" className="text-blue-400 hover:underline text-sm mt-2 block">← Bumalik sa profile</Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8 text-center">
        <p className="text-gray-400">Hindi nahanap ang listing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
      <Link href={`/listings/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Bumalik sa listing
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-white mb-6">I-edit ang Listing</h1>

        <form onSubmit={handleSave} className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Pamagat</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Paglalarawan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Presyo (₱)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={1}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Larawan</label>
            {imagePreview && (
              <div className="relative w-40 h-40 rounded-xl overflow-hidden mb-3 border border-gray-700">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2.5 rounded-xl border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 text-sm transition-colors">
              <Upload className="w-4 h-4" />
              {imageFile ? imageFile.name : "Palitan ang larawan"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sino-save..." : "I-save ang Pagbabago"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
