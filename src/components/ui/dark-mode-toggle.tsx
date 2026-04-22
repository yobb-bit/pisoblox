"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-14 h-8" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex items-center w-14 h-8 rounded-full transition-all duration-500 focus:outline-none shrink-0"
      style={{ background: isDark ? "#1e1b4b" : "#bae6fd" }}
    >
      {/* Stars */}
      <span className={`absolute right-2 flex flex-col gap-[3px] transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"}`}>
        <span className="w-[3px] h-[3px] rounded-full bg-white" />
        <span className="w-[2px] h-[2px] rounded-full bg-white ml-1" />
        <span className="w-[2px] h-[2px] rounded-full bg-white" />
      </span>

      {/* Knob */}
      <span
        className="absolute top-1 h-6 w-6 rounded-full transition-all duration-500 flex items-center justify-center overflow-hidden"
        style={{
          left: isDark ? "calc(100% - 1.75rem)" : "0.25rem",
          background: isDark ? "#c7d2fe" : "#fde047",
          boxShadow: isDark
            ? "0 0 8px 2px rgba(165,180,252,0.5)"
            : "0 0 10px 3px rgba(253,224,71,0.5)",
        }}
      >
        {/* Sun rays */}
        {!isDark && (
          <span className="absolute inset-0">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <span
                key={deg}
                className="absolute top-1/2 left-1/2 w-[1.5px] h-[20%] rounded-full bg-yellow-200 opacity-70"
                style={{
                  transform: `translate(-50%, -120%) rotate(${deg}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
            ))}
          </span>
        )}

        {/* Moon craters */}
        {isDark && (
          <>
            <span className="absolute top-[18%] left-[22%] w-[30%] h-[30%] rounded-full bg-indigo-300/50" />
            <span className="absolute bottom-[22%] right-[18%] w-[20%] h-[20%] rounded-full bg-indigo-300/40" />
          </>
        )}
      </span>
    </button>
  );
}
