"use client";

import { useState } from "react";
import { MessageCircle, X, ExternalLink } from "lucide-react";
import Image from "next/image";

export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Support</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-blue-500 px-6 pt-6 pb-10">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">PisoBlox Support</p>
              <h2 className="text-white text-lg font-bold">May tanong o problema?</h2>
            </div>

            {/* Profile card */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-4 -mt-6 mb-5">
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 shrink-0 shadow-md overflow-hidden relative">
                  <Image src="/IMG_0901.JPG" alt="John Kent" fill className="object-cover" />
                </div>
                <div className="pt-4">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">John Kent</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin · PisoBlox</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Huwag mag-atubiling mag-message! Tutulungan kita sa anumang tanong o isyu tungkol sa PisoBlox.
              </p>

              <a
                href="https://www.facebook.com/itsyaboikent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Mag-message sa Facebook
              </a>

              <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-3">
                Karaniwang sumasagot sa loob ng ilang oras
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
