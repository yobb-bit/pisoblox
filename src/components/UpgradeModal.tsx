"use client";

import { X, Lock, Zap, MessageCircle } from "lucide-react";

interface UpgradeModalProps {
  currentLimit: number;
  currentCount: number;
  onClose: () => void;
}

export function UpgradeModal({ currentLimit, currentCount, onClose }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Naabot mo na ang limit!</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {currentCount} / {currentLimit} listings ang nagamit mo na
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Ang libreng account ay may <strong className="text-gray-900 dark:text-white">10 listings</strong> lang. Para makapag-dagdag pa, mag-upgrade ka na!
          </p>

          {/* Pricing card */}
          <div className="border-2 border-blue-500 rounded-2xl p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-gray-900 dark:text-white text-sm">Extra Listings Pack</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-500">₱49</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 block">bawat buwan</span>
              </div>
            </div>
            <ul className="flex flex-col gap-1.5">
              {[
                "+5 karagdagang listing slots",
                "Maaaring mag-renew bawat buwan",
                "Pwedeng mag-avail ng maraming beses para sa mas maraming slots",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* How to pay instructions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Paano mag-upgrade?
            </p>
            <ol className="flex flex-col gap-2">
              {[
                "Magpadala ng ₱49 sa aming GCash number",
                "I-screenshot ang iyong resibo",
                "I-message kami sa Facebook kasama ang screenshot at iyong username",
                "Ia-activate namin ang iyong extra slots within 24 hours",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Bumalik
            </button>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              I-message Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
