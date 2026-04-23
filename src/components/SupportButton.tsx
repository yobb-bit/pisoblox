"use client";

import { useState } from "react";
import { MessageCircle, X, ExternalLink, Check, Copy } from "lucide-react";
import Image from "next/image";

export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyDiscord() {
    navigator.clipboard.writeText("1.10649");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
                Wag mahiyang mag message if merong kang tanong, problema, o suggestion. i gotchu dawg
              </p>

              {/* Facebook - main CTA */}
              <a
                href="https://www.facebook.com/itsyaboikent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-sm mb-3"
              >
                <ExternalLink className="w-4 h-4" />
                Mag-message sa Facebook
              </a>

              {/* Other platforms */}
              <div className="grid grid-cols-3 gap-2">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/iobbbbbbbbbbbbb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transition-colors group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-pink-500 transition-colors font-medium">Instagram</span>
                </a>

                {/* Discord */}
                <button
                  onClick={copyDiscord}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  {copied ? (
                    <span className="text-xs text-green-500 font-medium flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors font-medium flex items-center gap-0.5">
                      <Copy className="w-3 h-3" /> Discord
                    </span>
                  )}
                </button>

                {/* Twitter - coming soon */}
                <div className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">Twitter</span>
                </div>
              </div>

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
