"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

type Language = { code: string; name: string; flag: string };
type PassportEntry = { language: Language; audio: string; text: string };
type LinkItem = { url: string; label: string };
type PassportData = {
  name: string;
  title: string;
  photo: string | null;
  photoZoom?: number;
  photoOffsetY?: number;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  links: LinkItem[];
  primaryLink?: string | null;
  nativeLang?: string;
  transcript: string;
  originalAudio: string | null;
  entries: PassportEntry[];
  createdAt: string;
};

const NATIVE_LANGUAGES = [
  { code: "en", name: "English", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "ko", name: "Korean", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "ja", name: "Japanese", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "es", name: "Spanish", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "fr", name: "French", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "zh", name: "Chinese", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "de", name: "German", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "pt", name: "Portuguese", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "hi", name: "Hindi", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "ar", name: "Arabic", flag: "\ud83c\uddf8\ud83c\udde6" },
];

function detectLinkType(url: string): string {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("github.com")) return "github";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com")) return "youtube";
  if (url.includes("dribbble.com")) return "dribbble";
  if (url.includes("behance.net")) return "behance";
  if (url.includes("medium.com")) return "medium";
  return "link";
}

function getLinkIcon(type: string): React.ReactNode {
  const svgProps = { width: 16, height: 16, fill: "currentColor", viewBox: "0 0 24 24" };
  switch (type) {
    case "linkedin":
      return <svg {...svgProps}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "github":
      return <svg {...svgProps}><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>;
    case "twitter":
      return <svg {...svgProps}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "instagram":
      return <svg {...svgProps}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case "youtube":
      return <svg {...svgProps}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    default:
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
  }
}

function getLinkColor(type: string): string {
  const colors: Record<string, string> = {
    linkedin: "from-[#0077B5] to-[#005885]",
    github: "from-[#333] to-[#1a1a1a]",
    twitter: "from-[#1DA1F2] to-[#0d8ddb]",
    instagram: "from-[#E4405F] to-[#C13584]",
    youtube: "from-[#FF0000] to-[#CC0000]",
    dribbble: "from-[#EA4C89] to-[#C2185B]",
    behance: "from-[#1769FF] to-[#0050D4]",
    medium: "from-[#00AB6C] to-[#008F5A]",
    link: "from-gray-600 to-gray-700",
  };
  return colors[type] || "from-gray-600 to-gray-700";
}

function getLinkName(type: string, label: string): string {
  const names: Record<string, string> = {
    linkedin: "LinkedIn", github: "GitHub", twitter: "X / Twitter",
    instagram: "Instagram", youtube: "YouTube", dribbble: "Dribbble",
    behance: "Behance", medium: "Medium",
  };
  return names[type] || label;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function SharedPassport({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [expandedScripts, setExpandedScripts] = useState<Set<number>>(new Set());
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [passportId, setPassportId] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setPassportId(id);
      fetch(`/api/get-passport/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => { setPassport(data); setLoading(false); })
        .catch(() => { setError(true); setLoading(false); });
    });
  }, [params]);

  // Generate QR code when passport loads
  useEffect(() => {
    if (!passport || !passportId) return;
    const primaryLinkKey = passport.primaryLink;
    const primaryUrl = primaryLinkKey
      ? passport.links.find((l) => detectLinkType(l.url) === primaryLinkKey || l.label.toLowerCase().includes(primaryLinkKey))?.url
      : null;
    const qrTarget = primaryUrl || `${window.location.origin}/p/${passportId}`;
    QRCode.toDataURL(qrTarget, {
      width: 200, margin: 1,
      color: { dark: "#ffffffcc", light: "#00000000" },
    }).then(setQrDataUrl);
  }, [passport, passportId]);

  const playAudio = (idx: number, src: string) => {
    if (audioRef.current) audioRef.current.pause();
    if (playingIdx === idx) { setPlayingIdx(null); return; }
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingIdx(idx);
    audio.play();
    audio.onended = () => setPlayingIdx(null);
  };

  const downloadQR = () => {
    if (!qrDataUrl || !passport) return;
    const link = document.createElement("a");
    link.download = `voicepassport-${passport.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400">Loading VoicePassport...</p>
        </div>
      </main>
    );
  }

  if (error || !passport) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <p className="text-5xl">{"\ud83d\udd07"}</p>
          <h1 className="text-2xl font-bold">Passport not found</h1>
          <p className="text-gray-400">This VoicePassport may have expired or doesn&apos;t exist.</p>
          <a href="/" className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition">
            Create Your Own
          </a>
        </motion.div>
      </main>
    );
  }

  const pz = passport.photoZoom || 1;
  const po = passport.photoOffsetY || 0;
  const nativeLangInfo = NATIVE_LANGUAGES.find((l) => l.code === (passport.nativeLang || "en")) || NATIVE_LANGUAGES[0];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Header badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-gray-400 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            VoicePassport
          </span>
        </motion.div>

        {/* Business Card */}
        <motion.div variants={scaleIn} initial="hidden" animate="show" className="relative">
          <div className="absolute -inset-3 bg-gradient-to-b from-cyan-500/10 via-transparent to-emerald-500/10 rounded-[2rem] blur-xl" />

          <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />

            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5 flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-3xl font-bold flex-shrink-0 overflow-hidden text-black"
                  >
                    {passport.photo ? (
                      <img src={passport.photo} alt={passport.name} className="w-full h-full object-cover object-top" style={{ transform: `scale(${pz}) translateY(${po}px)` }} />
                    ) : (
                      passport.name.charAt(0).toUpperCase()
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold">{passport.name}</h1>
                    {passport.title && <p className="text-gray-400 text-sm mt-0.5">{passport.title}</p>}
                    {(passport.company || passport.location) && (
                      <p className="text-gray-600 text-xs mt-1">
                        {passport.company}{passport.company && passport.location && " \u00b7 "}{passport.location}
                      </p>
                    )}
                  </div>
                </div>
                {/* QR Code */}
                {qrDataUrl && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="flex-shrink-0 ml-4 cursor-pointer group" onClick={downloadQR}>
                    <img src={qrDataUrl} alt="QR" className="w-20 h-20 rounded-xl group-hover:ring-2 ring-cyan-500 transition" />
                    <p className="text-gray-600 text-[9px] text-center mt-1">Tap to download</p>
                  </motion.div>
                )}
              </div>

              {/* Contact info */}
              {(passport.email || passport.phone) && (
                <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/[0.06]">
                  {passport.email && (
                    <a href={`mailto:${passport.email}`} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                      {passport.email}
                    </a>
                  )}
                  {passport.phone && (
                    <a href={`tel:${passport.phone}`} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                      {passport.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Social links */}
              {passport.links.length > 0 && (
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-5 pt-5 border-t border-white/[0.06] space-y-2">
                  {passport.links.map((link, i) => {
                    const type = detectLinkType(link.url);
                    return (
                      <motion.a key={i} variants={fadeUp} href={link.url} target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${getLinkColor(type)} rounded-xl hover:opacity-90 transition group`}>
                        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">{getLinkIcon(type)}</span>
                        <span className="font-medium">{getLinkName(type, link.label)}</span>
                        <span className="ml-auto text-white/50 group-hover:text-white/80 transition">&rarr;</span>
                      </motion.a>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Voice Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Voice Introduction
          </h2>

          {/* Original language */}
          {passport.originalAudio && (
            <div className="mb-4">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  playingIdx === -1 ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                }`}
                onClick={() => playAudio(-1, passport.originalAudio!)}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{playingIdx === -1 ? "\u23f8" : "\u25b6"}</span>
                  <p className="font-medium text-sm">Original ({nativeLangInfo.flag} {nativeLangInfo.name})</p>
                  {playingIdx === -1 && (
                    <span className="ml-auto flex gap-0.5">
                      {[1, 2, 3].map((b) => (
                        <motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full"
                          animate={{ height: [8, 8 + b * 6, 8] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />
                      ))}
                    </span>
                  )}
                </div>
              </motion.div>
              <button onClick={() => setExpandedScripts((prev) => { const next = new Set(prev); if (next.has(-1)) next.delete(-1); else next.add(-1); return next; })}
                className="text-gray-600 text-xs mt-1.5 ml-1 hover:text-gray-400 transition">
                {expandedScripts.has(-1) ? "Hide script" : "View script"}
              </button>
              <AnimatePresence>
                {expandedScripts.has(-1) && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="text-gray-500 text-xs mt-1 ml-1 leading-relaxed">&ldquo;{passport.transcript}&rdquo;</motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Generated languages */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
            {passport.entries.map((entry, idx) => (
              <motion.div key={entry.language.code} variants={scaleIn} className="flex flex-col">
                <motion.div
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    playingIdx === idx ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                  }`}
                  onClick={() => playAudio(idx, entry.audio)}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entry.language.flag}</span>
                    <span className="font-medium text-sm">{entry.language.name}</span>
                    <span className="text-gray-600 text-xs ml-auto">{playingIdx === idx ? "" : "\u25b6"}</span>
                    {playingIdx === idx && (
                      <span className="ml-auto flex gap-0.5">
                        {[1, 2, 3].map((b) => (
                          <motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full"
                            animate={{ height: [8, 8 + b * 6, 8] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />
                        ))}
                      </span>
                    )}
                  </div>
                </motion.div>
                <button onClick={() => setExpandedScripts((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; })}
                  className="text-gray-600 text-xs mt-1.5 ml-1 hover:text-gray-400 transition text-left">
                  {expandedScripts.has(idx) ? "Hide script" : "View script"}
                </button>
                <AnimatePresence>
                  {expandedScripts.has(idx) && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-gray-500 text-xs mt-1 ml-1 leading-relaxed">{entry.text}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center space-y-4 pt-4">
          <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            href="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition">
            Create Your Own VoicePassport &rarr;
          </motion.a>
          <p className="text-gray-800 text-xs">
            VoicePassport &middot; Powered by ElevenLabs Voice AI
          </p>
        </motion.div>
      </div>
    </main>
  );
}
