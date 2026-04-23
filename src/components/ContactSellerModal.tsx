"use client";

import { useState } from "react";
import { AlertTriangle, Link2, X, ExternalLink, ShieldCheck, Users, BadgeCheck } from "lucide-react";

interface ContactSellerModalProps {
  sellerUsername: string;
  facebookLink: string;
  isVerified?: boolean;
  onClose: () => void;
}

export function ContactSellerModal({ sellerUsername, facebookLink, isVerified = false, onClose }: ContactSellerModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  function handleProceed() {
    window.open(facebookLink, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-5 py-4 flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">WAIT!</h2>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Basahin muna bago magpatuloy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Verified / Middleman banner */}
          {isVerified ? (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-xl">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800/40 rounded-lg shrink-0">
                <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-700 dark:text-blue-400 text-sm">Verified Seller — Legit ito!</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                  Ang seller na ito ay na-verify ng RobloxPH Market. Ang paggamit ng middleman ay <strong>opsyonal</strong> ngunit inirerekomenda pa rin para sa karagdagang proteksyon.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-xl">
              <div className="p-1.5 bg-green-100 dark:bg-green-800/40 rounded-lg shrink-0">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-green-700 dark:text-green-400 text-sm">Laging gumamit ng Middleman!</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  Ang seller na ito ay <strong>hindi pa verified</strong>. Para maiwasan ang scam, huwag mag-transact nang walang trusted middleman.
                </p>
              </div>
            </div>
          )}

          {/* Seller info */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Makikipag-ugnayan ka kay</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{sellerUsername}</p>
            </div>
          </div>

          {/* Warning text */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Aalis ka na sa <strong>PisoBlox</strong> at pupunta sa Facebook. Pagkatapos nun, wala na kaming <strong>kontrol</strong> sa mangyayari.
          </p>

          {/* Safety tips — hidden for verified sellers */}
          {!isVerified && <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Bago ka umalis, laging:</p>
            <ul className="flex flex-col gap-2">
              {[
                "Siguraduhing trusted and middleman na gagamitin mo",
                "irecord o iscreenshot ang buong transaction bilang ebidensya sakaling may problema",
                "Laging may middleman para protektado ang dalawang panig",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>}

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Naiintindihan ko na aalis ako sa platform at ang PisoBlox ay hindi responsable sa mga transaksyong gagawin sa Facebook.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Bumalik
            </button>
            <button
              onClick={handleProceed}
              disabled={!confirmed}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              Makipag-usap sa Seller
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
