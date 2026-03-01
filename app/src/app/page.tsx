"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

type Language = { code: string; name: string; flag: string };
type PassportEntry = { language: Language; audio: string; text: string };
type LinkItem = { url: string; label: string };

/* ─── Available languages for generation ─── */
const ALL_LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "ko", name: "Korean", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "ja", name: "Japanese", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "es", name: "Spanish", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "fr", name: "French", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "zh", name: "Chinese", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "de", name: "German", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "pt", name: "Portuguese", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "it", name: "Italian", flag: "\ud83c\uddee\ud83c\uddf9" },
  { code: "hi", name: "Hindi", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "ar", name: "Arabic", flag: "\ud83c\uddf8\ud83c\udde6" },
];

/* ─── Native language options ─── */
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

/* ─── Platforms ─── */
const PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/yourname" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/yourhandle" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "medium", label: "Medium", placeholder: "https://medium.com/@yourname" },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/yourname" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/yourname" },
  { key: "other", label: "Other", placeholder: "https://..." },
];

/* ─── Logo (Passport) ─── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-lg blur-md"
        style={{ background: "linear-gradient(135deg, #06b6d4, #10b981)" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
      {/* Main icon */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="relative z-10">
        <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
        {/* Passport book */}
        <rect x="10" y="8" width="20" height="24" rx="2.5" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.9" />
        <rect x="10" y="8" width="4" height="24" rx="1" fill="rgba(255,255,255,0.15)" />
        {/* Globe */}
        <circle cx="22" cy="17.5" r="5.5" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.85" />
        <ellipse cx="22" cy="17.5" rx="2.5" ry="5.5" stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.6" />
        <line x1="16.5" y1="17.5" x2="27.5" y2="17.5" stroke="#fff" strokeWidth="0.7" opacity="0.6" />
        <line x1="22" y1="12" x2="22" y2="23" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
        {/* Sound waves */}
        <path d="M28.5 14.5c1.8 1.8 1.8 4.5 0 6.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M31 12.5c2.5 2.8 2.5 7.5 0 10.5" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* Accent dot */}
        <circle cx="33" cy="9" r="1.5" fill="#fff" opacity="0.8" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#06b6d4" />
            <stop offset="0.5" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

/* ─── Link helpers ─── */
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

function getLinkIcon(type: string, iconSize = 16): React.ReactNode {
  const svgProps = { width: iconSize, height: iconSize, fill: "currentColor", viewBox: "0 0 24 24" };
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
    case "dribbble":
      return <svg {...svgProps}><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702A10.58 10.58 0 0012 1.48c-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>;
    case "behance":
      return <svg {...svgProps}><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.63.16-1.3.24-2.004.24H0v-14.8h6.938zm-.36 5.98c.573 0 1.06-.14 1.44-.43.39-.29.58-.75.58-1.37 0-.36-.07-.65-.21-.89-.14-.24-.33-.43-.57-.56-.24-.13-.51-.22-.82-.27-.31-.05-.64-.07-1-.07H3.48v3.59h3.1zm.14 6.16c.39 0 .75-.05 1.08-.14.33-.09.62-.23.86-.42.24-.19.43-.44.56-.75.14-.31.2-.7.2-1.15 0-.92-.24-1.58-.73-1.99-.5-.4-1.17-.6-2.02-.6H3.48v5.06h3.24zM15.46 16.2c.33.39.82.58 1.49.58.47 0 .88-.12 1.21-.35.33-.23.53-.46.59-.68h2.6c-.42 1.22-1.05 2.1-1.88 2.62-.83.52-1.84.78-3.01.78-.82 0-1.56-.13-2.22-.39-.66-.26-1.22-.63-1.7-1.11-.47-.48-.84-1.06-1.09-1.74-.26-.68-.39-1.43-.39-2.24 0-.79.13-1.52.39-2.2.26-.68.62-1.27 1.1-1.76.47-.49 1.04-.88 1.68-1.15.65-.28 1.36-.42 2.13-.42.9 0 1.67.17 2.31.51.64.34 1.16.81 1.57 1.4.41.59.71 1.27.89 2.06.18.79.24 1.63.17 2.53h-7.73c.04.92.36 1.57.89 1.96zm2.63-5.07c-.26-.35-.7-.52-1.3-.52-.41 0-.75.07-1.02.22-.27.15-.48.34-.64.56-.16.22-.27.46-.34.72-.06.26-.1.5-.12.73h4.58c-.12-.82-.39-1.36-.65-1.71h-.51zM22.33 4.67h5.77v1.64h-5.77V4.67z"/></svg>;
    case "medium":
      return <svg {...svgProps}><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>;
    default:
      return <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
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

/* ─── Framer Motion variants ─── */
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

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  { q: "How does the voice cloning work?", a: "We use ElevenLabs' instant voice cloning technology. From your 30-second recording, the AI learns your unique voice characteristics and recreates your speaking style in other languages." },
  { q: "Is my voice data safe?", a: "Your voice recording is used only for cloning during this session. We don't store voice data on external servers. The generated passport uses audio files, not the raw voice model." },
  { q: "Can I update my VoicePassport later?", a: "You can create a new VoicePassport anytime. Each recording generates a unique shareable link. Simply record again and share the new link." },
  { q: "How many languages can I generate?", a: "You can choose from 11 languages including English, Korean, Japanese, Spanish, French, Chinese, German, Portuguese, Italian, Hindi, and Arabic. English is always included by default." },
  { q: "Does it cost anything?", a: "VoicePassport is completely free to use. Create your voice business card and share it with anyone, anywhere." },
];

export default function Home() {
  const [step, setStep] = useState<
    "landing" | "setup" | "record" | "processing" | "passport"
  >("landing");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [platformUrls, setPlatformUrls] = useState<Record<string, string>>({});
  const [primaryLink, setPrimaryLink] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  // Voice
  const [nativeLang, setNativeLang] = useState("en");
  const [selectedTargetLangs, setSelectedTargetLangs] = useState<Set<string>>(
    new Set(ALL_LANGUAGES.map((l) => l.code))
  );
  const [transcript, setTranscript] = useState("");
  const [entries, setEntries] = useState<PassportEntry[]>([]);
  const [progress, setProgress] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expandedScripts, setExpandedScripts] = useState<Set<number>>(new Set([-1]));

  // Demo passport from localStorage (persists across refresh)
  type DemoPassport = {
    name: string; title: string; photo: string | null;
    photoZoom: number; photoOffsetY: number;
    company: string; location: string;
    nativeLang: string; transcript: string;
    originalAudio: string | null;
    links: LinkItem[]; entries: PassportEntry[];
  };
  const [demoPassport, setDemoPassport] = useState<DemoPassport | null>(null);

  const [sampleQrUrl, setSampleQrUrl] = useState<string | null>(null);

  // Load demo passport from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voicepassport-demo");
      if (saved) setDemoPassport(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Generate QR for landing sample card
  useEffect(() => {
    const qrTarget = (() => {
      // Current session data
      if (primaryLink && platformUrls[primaryLink]) return platformUrls[primaryLink];
      // Find LinkedIn URL from current session
      const linkedIn = PLATFORMS.find((p) => p.key === "linkedin" && selectedPlatforms.has("linkedin") && platformUrls["linkedin"]);
      if (linkedIn) return platformUrls["linkedin"];
      // Hardcoded fallback for sample card
      return "https://www.linkedin.com/in/kellyyeseuloh/";
    })();
    if (qrTarget) {
      QRCode.toDataURL(qrTarget, {
        width: 160, margin: 1,
        color: { dark: "#ffffffcc", light: "#00000000" },
      }).then(setSampleQrUrl).catch(() => {});
    } else {
      setSampleQrUrl(null);
    }
  }, [primaryLink, platformUrls, selectedPlatforms]);

  // Landing
  const [visibleLangs, setVisibleLangs] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const demoLanguages = [
    { flag: "\ud83c\uddf0\ud83c\uddf7", text: "\uc548\ub155\ud558\uc138\uc694, \uc800\ub294..." },
    { flag: "\ud83c\uddef\ud83c\uddf5", text: "\u306f\u3058\u3081\u307e\u3057\u3066..." },
    { flag: "\ud83c\uddea\ud83c\uddf8", text: "Hola, me llamo..." },
    { flag: "\ud83c\uddeb\ud83c\uddf7", text: "Bonjour, je suis..." },
    { flag: "\ud83c\udde8\ud83c\uddf3", text: "\u4f60\u597d\uff0c\u6211\u53eb..." },
    { flag: "\ud83c\udde9\ud83c\uddea", text: "Hallo, ich bin..." },
  ];

  useEffect(() => {
    if (step !== "landing") return;
    setVisibleLangs(0);
    const interval = setInterval(() => {
      setVisibleLangs((v) => (v < demoLanguages.length ? v + 1 : v));
    }, 400);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasRecorded(true);
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.current = recorder;
    chunks.current = [];
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.start();
    setIsRecording(true);
    setHasRecorded(false);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => {
        if (t >= 29) { stopRecording(); return 30; }
        return t + 1;
      });
    }, 1000);
  }, [stopRecording]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `voicepassport-${name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyLink = () => {
    const url = shareUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Filter target languages (exclude native language, always include English)
  const targetLangs = ALL_LANGUAGES.filter(
    (l) => l.code !== nativeLang && (l.code === "en" || selectedTargetLangs.has(l.code))
  );

  const generatePassport = useCallback(async () => {
    if (chunks.current.length === 0) return;
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    const originalBase64 = await blobToBase64(blob);
    setOriginalAudioUrl(originalBase64);
    setStep("processing");
    setProgressPercent(0);

    const totalSteps = 3 + targetLangs.length + 1; // transcribe + clone + translate + N speech + save
    let currentStep = 0;
    const bump = () => { currentStep++; setProgressPercent(Math.round((currentStep / totalSteps) * 100)); };

    try {
      setProgress("Listening to your voice...");
      const transcribeForm = new FormData();
      transcribeForm.append("audio", blob, "recording.webm");
      const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: transcribeForm });
      const transcribeData = await transcribeRes.json();
      if (!transcribeData.text) throw new Error("Transcription failed");
      setTranscript(transcribeData.text);
      bump();

      setProgress("Learning your voice...");
      const cloneForm = new FormData();
      cloneForm.append("audio", blob, "recording.webm");
      cloneForm.append("name", name || "User");
      const cloneRes = await fetch("/api/clone-voice", { method: "POST", body: cloneForm });
      const cloneData = await cloneRes.json();
      if (!cloneData.voice_id) throw new Error("Voice cloning failed");
      bump();

      setProgress(`Translating into ${targetLangs.length} languages...`);
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcribeData.text, targetCodes: targetLangs.map((l) => l.code) }),
      });
      const translateData = await translateRes.json();
      if (!translateData.translations) throw new Error("Translation failed");
      bump();

      const passportEntries: PassportEntry[] = [];

      for (let i = 0; i < targetLangs.length; i++) {
        const lang = targetLangs[i];
        const translatedText = translateData.translations[lang.code];
        if (!translatedText) { bump(); continue; }

        setProgress(`${lang.flag} Generating ${lang.name}... (${i + 1}/${targetLangs.length})`);

        // Retry up to 2 times with delay to handle rate limits
        let speechAudio: string | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
          try {
            const speechRes = await fetch("/api/generate-speech", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: translatedText,
                voice_id: cloneData.voice_id,
                language_code: lang.code,
              }),
            });
            const speechData = await speechRes.json();
            if (speechData.audio) { speechAudio = speechData.audio; break; }
          } catch { /* retry */ }
        }

        if (speechAudio) {
          passportEntries.push({
            language: lang,
            audio: `data:audio/mpeg;base64,${speechAudio}`,
            text: translatedText,
          });
        }
        bump();

        // Small delay between calls to avoid rate limits
        if (i < targetLangs.length - 1) await new Promise((r) => setTimeout(r, 800));
      }

      setEntries(passportEntries);

      setProgress("Saving your VoicePassport...");
      const saveRes = await fetch("/api/save-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          photo,
          photoZoom,
          photoOffsetY,
          email,
          phone,
          company,
          location,
          primaryLink,
          links: PLATFORMS
            .filter((p) => selectedPlatforms.has(p.key) && platformUrls[p.key])
            .map((p) => ({ url: platformUrls[p.key], label: p.label })),
          nativeLang,
          transcript: transcribeData.text,
          originalAudio: originalBase64,
          entries: passportEntries,
        }),
      });
      const saveData = await saveRes.json();
      bump();

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const fullShareUrl = saveData.id ? `${baseUrl}/p/${saveData.id}` : baseUrl;
      setShareUrl(fullShareUrl);

      // QR: use primary link URL if set, otherwise use passport share URL
      const qrTarget = primaryLink && platformUrls[primaryLink] ? platformUrls[primaryLink] : fullShareUrl;
      const qr = await QRCode.toDataURL(qrTarget, {
        width: 200, margin: 1,
        color: { dark: "#ffffffcc", light: "#00000000" },
      });
      setQrDataUrl(qr);

      // Persist to localStorage so landing page sample always shows real data
      try {
        const demoData: DemoPassport = {
          name, title, photo, photoZoom, photoOffsetY, company, location,
          nativeLang, transcript: transcribeData.text,
          originalAudio: originalBase64,
          links: PLATFORMS.filter((p) => selectedPlatforms.has(p.key) && platformUrls[p.key]).map((p) => ({ url: platformUrls[p.key], label: p.label })),
          entries: passportEntries,
        };
        localStorage.setItem("voicepassport-demo", JSON.stringify(demoData));
        setDemoPassport(demoData);
      } catch { /* localStorage might be full for large audio — ignore */ }

      setStep("passport");
    } catch (err) {
      console.error(err);
      setProgress("Something went wrong. Please try again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, title, photo, photoZoom, photoOffsetY, email, phone, company, location, primaryLink, selectedPlatforms, platformUrls, nativeLang, targetLangs]);

  const playAudio = (idx: number, src: string) => {
    if (!src) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (playingIdx === idx) { setPlayingIdx(null); return; }
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingIdx(idx);
    audio.play().catch(() => setPlayingIdx(null));
    audio.onended = () => setPlayingIdx(null);
  };

  const togglePlatform = (key: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        if (primaryLink === key) setPrimaryLink(null);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updatePlatformUrl = (key: string, url: string) => {
    setPlatformUrls((prev) => ({ ...prev, [key]: url }));
  };

  const toggleTargetLang = (code: string) => {
    setSelectedTargetLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const allLinks: LinkItem[] = PLATFORMS
    .filter((p) => selectedPlatforms.has(p.key) && platformUrls[p.key])
    .map((p) => ({ url: platformUrls[p.key], label: p.label }));

  // Native language display info
  const nativeLangInfo = NATIVE_LANGUAGES.find((l) => l.code === nativeLang) || NATIVE_LANGUAGES[0];

  // Input field class (bright, visible)
  const inputClass = "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition";
  const inputSmClass = "w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition";
  const labelClass = "text-sm text-gray-300 block mb-1.5";

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ========== LANDING ========== */}
        {step === "landing" && (
          <motion.div key="landing" {...pageTransition} className="relative">
            {/* Space / star background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              {/* Star layers */}
              {[...Array(60)].map((_, i) => (
                <motion.div key={`star-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
                    height: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
                    top: `${(i * 17.3) % 100}%`,
                    left: `${(i * 31.7 + 13) % 100}%`,
                  }}
                  animate={{ opacity: [0.1, i % 3 === 0 ? 0.8 : 0.5, 0.1], scale: [1, i % 5 === 0 ? 1.4 : 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 + (i % 4) * 1.5, delay: (i * 0.37) % 4, ease: "easeInOut" }}
                />
              ))}
              {/* Cyan nebula glow */}
              <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[150px]" />
              <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
              <div className="absolute top-[50%] left-[60%] w-[250px] h-[250px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
                <Logo />
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Voice<span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Passport</span>
                </span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
                <button onClick={() => document.getElementById("sample-section")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2 text-gray-400 text-sm hover:text-white transition">
                  See Sample
                </button>
                <button onClick={() => setStep("setup")} className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition">
                  Get Started
                </button>
              </motion.div>
            </nav>

            {/* Hero */}
            <div className="relative overflow-hidden z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

              <div className="relative flex flex-col items-center justify-center px-6 text-center pt-24 pb-28">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-gray-400 text-xs mb-10">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Powered by ElevenLabs Voice AI
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold leading-[1.1] max-w-4xl tracking-[-0.03em]">
                  <span className="text-white">Introduce yourself anywhere,</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">in your own voice.</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-gray-400 text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">
                  Record 30 seconds.<br />
                  AI clones your voice and speaks your intro in 10 languages.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="mt-12 flex items-center gap-4">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setStep("setup")}
                    className="px-8 py-3.5 bg-white text-black rounded-full font-semibold text-sm shadow-lg shadow-white/10 hover:bg-gray-100 transition">
                    Create yours free &rarr;
                  </motion.button>
                  <button onClick={() => document.getElementById("sample-section")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-3.5 text-gray-400 text-sm hover:text-white transition">
                    See a sample
                  </button>
                </motion.div>

                {/* Language pills */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }} className="mt-20 flex flex-wrap justify-center gap-2.5 max-w-xl">
                  {demoLanguages.map((lang, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={i < visibleLangs ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
                      whileHover={{ scale: 1.08, borderColor: "rgba(6,182,212,0.3)" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm backdrop-blur-sm cursor-default">
                      <span className="mr-2">{lang.flag}</span>
                      <span className="text-gray-500">{lang.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* What You Get */}
            <div className="px-6 py-28 border-t border-white/[0.04]">
              <div className="max-w-5xl mx-auto">
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className="text-center text-gray-600 text-xs font-medium tracking-[0.2em] uppercase mb-4">What you get</motion.p>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                  className="text-center text-3xl md:text-4xl font-bold mb-16 tracking-tight">Everything in one link.</motion.h2>

                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>, title: "AI Voice Cloning", desc: "Record once. Your cloned voice speaks fluent introductions in 10 languages.", gradient: "from-cyan-500/10 to-transparent" },
                    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, title: "Digital Voice Card", desc: "Photo, bio, contacts, social links, QR code \u2014 a beautiful card with your voice.", gradient: "from-emerald-500/10 to-transparent" },
                    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>, title: "One Link to Share", desc: "Unique URL and QR code. Anyone can hear your intro \u2014 no app needed.", gradient: "from-cyan-500/10 to-transparent" },
                  ].map((feature, i) => (
                    <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
                      whileHover={{ y: -4, borderColor: "rgba(6,182,212,0.2)" }}
                      className={`bg-gradient-to-b ${feature.gradient} bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 transition-all group`}>
                      <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">{feature.icon}</motion.div>
                      <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* How It Works — dynamic steps */}
            <div className="px-6 py-28 border-t border-white/[0.04]">
              <div className="max-w-4xl mx-auto">
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="text-center text-2xl md:text-3xl font-bold mb-16 tracking-tight">Three steps. Thirty seconds.</motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { num: "01", label: "Set up profile", sub: "Name, photo, links", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                    { num: "02", label: "Record 30 seconds", sub: "Talk naturally in your language", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg> },
                    { num: "03", label: "Share everywhere", sub: "One link, QR, any language", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
                  ].map((s, i) => (
                    <motion.div key={s.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 transition-all hover:border-cyan-500/20">
                      <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 flex items-center justify-center">
                        {s.icon}
                      </motion.div>
                      <span className="text-2xl font-bold bg-gradient-to-b from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{s.num}</span>
                      <p className="font-semibold text-white text-sm mt-2">{s.label}</p>
                      <p className="text-gray-500 text-xs mt-1">{s.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sample VoicePassport — hardcoded from passport 9a140e2d */}
            {(() => {
              const sName = "Kelly Oh";
              const sTitle = "Voice AI Growth Leader | 0\u21921 GTM for AI Startups";
              const sCompany = "BizCrush Inc.";
              const sLocation = "New York, NY";
              const sPhoto = "/sample/photo.jpg";
              const sPZ = 1;
              const sPO = 0;
              const sLinks: LinkItem[] = [{ url: "https://www.linkedin.com/in/kellyyeseuloh/", label: "LinkedIn" }];
              const sNativeLangInfo = { code: "en", name: "English", flag: "\ud83c\uddfa\ud83c\uddf8" };
              const sEntries: PassportEntry[] = [
                { language: { code: "ko", name: "Korean", flag: "\ud83c\uddf0\ud83c\uddf7" }, audio: "/sample/ko.mp3", text: "" },
                { language: { code: "ja", name: "Japanese", flag: "\ud83c\uddef\ud83c\uddf5" }, audio: "/sample/ja.mp3", text: "" },
                { language: { code: "es", name: "Spanish", flag: "\ud83c\uddea\ud83c\uddf8" }, audio: "/sample/es.mp3", text: "" },
                { language: { code: "fr", name: "French", flag: "\ud83c\uddeb\ud83c\uddf7" }, audio: "/sample/fr.mp3", text: "" },
                { language: { code: "zh", name: "Chinese", flag: "\ud83c\udde8\ud83c\uddf3" }, audio: "/sample/zh.mp3", text: "" },
                { language: { code: "de", name: "German", flag: "\ud83c\udde9\ud83c\uddea" }, audio: "/sample/de.mp3", text: "" },
                { language: { code: "pt", name: "Portuguese", flag: "\ud83c\udde7\ud83c\uddf7" }, audio: "/sample/pt.mp3", text: "" },
                { language: { code: "it", name: "Italian", flag: "\ud83c\uddee\ud83c\uddf9" }, audio: "/sample/it.mp3", text: "" },
                { language: { code: "hi", name: "Hindi", flag: "\ud83c\uddee\ud83c\uddf3" }, audio: "/sample/hi.mp3", text: "" },
                { language: { code: "ar", name: "Arabic", flag: "\ud83c\uddf8\ud83c\udde6" }, audio: "/sample/ar.mp3", text: "" },
              ];
              const sOrigAudio = "/sample/original.mp3";

              return (
                <div id="sample-section" className="px-6 py-28 border-t border-white/[0.04]">
                  <div className="max-w-lg mx-auto">
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                      className="text-center text-gray-600 text-xs font-medium tracking-[0.2em] uppercase mb-4">Your VoicePassport</motion.p>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      className="text-center text-2xl font-bold mb-12 tracking-tight">Preview your card</motion.h2>

                    <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-b from-cyan-500/10 via-transparent to-emerald-500/10 rounded-[2rem] blur-xl" />
                      <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-sm">
                        <div className="h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
                        <div className="p-8">
                          {/* Profile header */}
                          <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-black flex-shrink-0 overflow-hidden">
                              {sPhoto ? (
                                <img src={sPhoto} alt={sName} className="w-full h-full object-cover object-top" style={{ transform: `scale(${sPZ}) translateY(${sPO}px)` }} />
                              ) : sName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold">{sName}</h3>
                              {sTitle && <p className="text-gray-400 text-sm">{sTitle}</p>}
                              {(sCompany || sLocation) && <p className="text-gray-600 text-xs mt-0.5">{sCompany}{sCompany && sLocation && " \u00b7 "}{sLocation}</p>}
                            </div>
                            {sampleQrUrl && (
                              <div className="flex-shrink-0">
                                <img src={sampleQrUrl} alt="QR" className="w-16 h-16 rounded-xl" />
                              </div>
                            )}
                          </div>

                          {/* Links */}
                          {sLinks.length > 0 ? (
                            <div className="space-y-2 mb-6">
                              {sLinks.map((link: LinkItem, i: number) => {
                                const type = detectLinkType(link.url);
                                return (
                                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r ${getLinkColor(type)} rounded-xl text-sm hover:opacity-80 transition`}>
                                    <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">{getLinkIcon(type, 14)}</span>
                                    <span>{getLinkName(type, link.label)}</span>
                                  </a>
                                );
                              })}
                            </div>
                          ) : null}

                          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Voice Introductions</p>

                          {/* Voice cards — playable when data exists */}
                          {sEntries.length > 0 ? (
                            <div className="space-y-2">
                              {/* Original voice */}
                              {sOrigAudio && (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition border ${
                                    playingIdx === -1 ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                                  }`} onClick={() => playAudio(-1, sOrigAudio)}>
                                  <span className="text-sm">{playingIdx === -1 ? "\u23f8" : "\u25b6"}</span>
                                  <span className="text-base">{sNativeLangInfo.flag}</span>
                                  <span className="text-gray-300 font-medium">{sNativeLangInfo.name}</span>
                                  <span className="text-gray-600 text-[10px] ml-auto">Original</span>
                                  {playingIdx === -1 && (
                                    <span className="flex gap-0.5">
                                      {[1, 2, 3].map((b) => (<motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full" animate={{ height: [6, 6 + b * 4, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />))}
                                    </span>
                                  )}
                                </motion.div>
                              )}
                              {/* Generated languages */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {sEntries.map((entry: PassportEntry, idx: number) => (
                                  <motion.div key={entry.language.code} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition border ${
                                      playingIdx === idx ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                                    }`} onClick={() => playAudio(idx, entry.audio)}>
                                    <span className="text-sm">{playingIdx === idx ? "\u23f8" : "\u25b6"}</span>
                                    <span className="text-base">{entry.language.flag}</span>
                                    <span className="text-gray-400 truncate">{entry.language.name}</span>
                                    {playingIdx === idx && (
                                      <span className="ml-auto flex gap-0.5">
                                        {[1, 2, 3].map((b) => (<motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full" animate={{ height: [6, 6 + b * 4, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />))}
                                      </span>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[{ flag: "\ud83c\uddfa\ud83c\uddf8", name: "English" }, { flag: "\ud83c\uddef\ud83c\uddf5", name: "Japanese" }, { flag: "\ud83c\uddea\ud83c\uddf8", name: "Spanish" }, { flag: "\ud83c\uddeb\ud83c\uddf7", name: "French" }, { flag: "\ud83c\udde8\ud83c\uddf3", name: "Chinese" }, { flag: "\ud83c\udde9\ud83c\uddea", name: "German" }].map((lang, i) => (
                                <motion.div key={lang.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}
                                  whileHover={{ scale: 1.05, borderColor: "rgba(6,182,212,0.3)" }}
                                  className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs cursor-pointer transition">
                                  <span className="text-base">{lang.flag}</span>
                                  <span className="text-gray-400 truncate">{lang.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })()}

            {/* FAQ */}
            <div className="px-6 py-28 border-t border-white/[0.04]">
              <div className="max-w-2xl mx-auto">
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="text-center text-2xl md:text-3xl font-bold mb-12 tracking-tight">Frequently asked questions</motion.h2>
                <div className="space-y-3">
                  {FAQ_ITEMS.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="border border-white/[0.06] rounded-xl overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition">
                        <span className="font-medium text-sm text-white">{item.q}</span>
                        <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-gray-500 text-lg ml-4 flex-shrink-0">+</motion.span>
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-24 text-center border-t border-white/[0.04]">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Ready to be heard?</motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-gray-400 text-sm mb-8">Create your VoicePassport in under a minute. Free.</motion.p>
              <motion.button initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setStep("setup")}
                className="px-8 py-3.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition">
                Get started &rarr;
              </motion.button>
              <p className="text-gray-800 text-xs mt-8">Built with ElevenLabs Voice AI</p>
            </div>
          </motion.div>
        )}

        {/* ========== SETUP ========== */}
        {step === "setup" && (
          <motion.div key="setup" {...pageTransition} className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg space-y-6">
              <motion.button whileHover={{ x: -4 }} onClick={() => setStep("landing")} className="text-gray-400 text-sm hover:text-white transition">&larr; Back</motion.button>

              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-3xl font-bold">Set up your profile</h2>
                <p className="text-gray-400 mt-2">This info appears on your voice card. All fields optional except name.</p>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                {/* Photo */}
                <motion.div variants={fadeUp}>
                  {photo ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        {/* Large preview */}
                        <div className="w-28 h-28 rounded-2xl bg-white/[0.04] border border-white/[0.1] overflow-hidden flex-shrink-0 relative">
                          <img src={photo} alt="Profile" className="w-full h-full object-cover object-top" style={{ transform: `scale(${photoZoom}) translateY(${photoOffsetY}px)` }} />
                        </div>
                        <div className="flex-1 space-y-3 pt-1">
                          <div>
                            <p className="text-xs text-gray-400 mb-1.5">Zoom</p>
                            <input type="range" min="1" max="3" step="0.05" value={photoZoom} onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                              className="w-full h-1.5 accent-cyan-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1.5">Position</p>
                            <input type="range" min="-30" max="30" step="1" value={photoOffsetY} onChange={(e) => setPhotoOffsetY(parseInt(e.target.value))}
                              className="w-full h-1.5 accent-cyan-500" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => photoInputRef.current?.click()} className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-xs text-gray-400 hover:text-white transition">Change</button>
                            <button onClick={() => { setPhoto(null); setPhotoZoom(1); setPhotoOffsetY(0); }} className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-gray-600 hover:text-red-400 transition">Remove</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-4 p-4 bg-white/[0.03] border border-dashed border-white/[0.12] rounded-2xl cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5 transition">
                      <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Upload Photo</p>
                        <p className="text-xs text-gray-500">Click to choose a profile photo</p>
                      </div>
                    </div>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </motion.div>

                {/* Name */}
                <motion.div variants={fadeUp}>
                  <label className={labelClass}>Name *</label>
                  <input type="text" placeholder="Kelly Oh" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </motion.div>

                {/* Contact info grid */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputSmClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" placeholder="+1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputSmClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input type="text" placeholder="Acme Inc." value={company} onChange={(e) => setCompany(e.target.value)} className={inputSmClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input type="text" placeholder="New York, NY" value={location} onChange={(e) => setLocation(e.target.value)} className={inputSmClass} />
                  </div>
                </motion.div>

                {/* Links — chip toggle with logo + inline URL */}
                <motion.div variants={fadeUp}>
                  <label className={labelClass}>Add your links</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PLATFORMS.map((p) => {
                      const active = selectedPlatforms.has(p.key);
                      return (
                        <motion.button key={p.key} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => togglePlatform(p.key)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                            active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                          }`}>
                          <span className="w-4 h-4 flex items-center justify-center opacity-70">{getLinkIcon(p.key === "other" ? "link" : p.key, 14)}</span>
                          {p.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {PLATFORMS.filter((p) => selectedPlatforms.has(p.key)).map((p) => (
                      <motion.div key={p.key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-gray-300">
                            {getLinkIcon(p.key === "other" ? "link" : p.key, 16)}
                          </div>
                          <input type="url" placeholder={p.placeholder} value={platformUrls[p.key] || ""} onChange={(e) => updatePlatformUrl(p.key, e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition" />
                          {/* Primary toggle */}
                          <button onClick={() => setPrimaryLink(primaryLink === p.key ? null : p.key)}
                            title={primaryLink === p.key ? "Primary link (QR code)" : "Set as primary link"}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition text-xs ${primaryLink === p.key ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-white/[0.04] text-gray-600 border border-white/[0.06] hover:text-gray-300"}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={primaryLink === p.key ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {selectedPlatforms.size > 1 && (
                    <p className="text-gray-600 text-xs mt-1">Tap the star to set a primary link for your QR code.</p>
                  )}
                </motion.div>

                {/* Title / One-liner — after links so AI can use them */}
                <motion.div variants={fadeUp}>
                  <label className={labelClass}>Title / One-liner</label>
                  <div className="relative">
                    <input type="text" placeholder="Chief Growth Officer at BizCrush" value={title} onChange={(e) => setTitle(e.target.value)}
                      className={inputClass + (allLinks.length > 0 ? " pr-12" : "")} />
                    {allLinks.length > 0 && (
                      <button type="button" title="AI-generate from your links"
                        onClick={async () => {
                          if (!name) return;
                          try {
                            const res = await fetch("/api/generate-oneliner", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name, company, location, links: allLinks }),
                            });
                            const data = await res.json();
                            if (data.oneliner) setTitle(data.oneliner);
                          } catch { /* ignore */ }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center hover:from-cyan-500/30 hover:to-emerald-500/30 transition text-cyan-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
                      </button>
                    )}
                  </div>
                  {allLinks.length > 0 && <p className="text-gray-600 text-xs mt-1">Tap the star to auto-generate from your links</p>}
                </motion.div>
              </motion.div>

              <motion.button variants={fadeUp} initial="hidden" animate="show"
                whileHover={name ? { scale: 1.02 } : {}} whileTap={name ? { scale: 0.98 } : {}}
                onClick={() => name ? setStep("record") : null}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                  name ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:opacity-90" : "bg-gray-900 text-gray-600 cursor-not-allowed border border-white/[0.06]"
                }`}>
                Continue &rarr;
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ========== RECORD ========== */}
        {step === "record" && (
          <motion.div key="record" {...pageTransition} className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-8">
              <motion.button whileHover={{ x: -4 }} onClick={() => setStep("setup")} className="text-gray-400 text-sm hover:text-white transition">&larr; Back to profile</motion.button>

              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-3xl font-bold">Record your intro</h2>
                <p className="text-gray-400 mt-2">30 seconds. Just talk naturally about who you are.</p>
              </motion.div>

              {/* Native language selector */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <label className={labelClass}>I&apos;m speaking in</label>
                <div className="flex flex-wrap gap-2">
                  {NATIVE_LANGUAGES.map((lang) => (
                    <button key={lang.code} onClick={() => setNativeLang(lang.code)}
                      className={`px-3 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                        nativeLang === lang.code ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
                      }`}>
                      <span>{lang.flag}</span> {lang.name}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Target languages multi-select */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <label className={labelClass}>Generate voice in ({targetLangs.length} languages)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_LANGUAGES.filter((l) => l.code !== nativeLang).map((lang) => {
                    const isEnglish = lang.code === "en";
                    const active = isEnglish || selectedTargetLangs.has(lang.code);
                    return (
                      <button key={lang.code} onClick={() => !isEnglish && toggleTargetLang(lang.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 ${
                          active ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:bg-white/[0.06]"
                        } ${isEnglish ? "opacity-90 cursor-default" : ""}`}>
                        <span>{lang.flag}</span> {lang.name}{isEnglish ? " ✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recording */}
              <div className="flex flex-col items-center gap-6 pt-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                  animate={isRecording ? { boxShadow: ["0 0 0px rgba(239,68,68,0.2)", "0 0 40px rgba(239,68,68,0.4)", "0 0 0px rgba(239,68,68,0.2)"] } : {}}
                  transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-36 h-36 rounded-full flex items-center justify-center text-5xl transition-all ${
                    isRecording ? "bg-red-500/20 border-4 border-red-500" : "bg-cyan-500/5 border-4 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10"
                  }`}>
                  {isRecording ? "\u23f8" : "\ud83c\udfa4"}
                </motion.button>

                <AnimatePresence mode="wait">
                  {isRecording && (
                    <motion.div key="timer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p className="text-red-400 font-mono text-3xl text-center">{recordingTime}s</p>
                      <div className="w-72 h-1.5 bg-gray-900 rounded-full mt-3 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" animate={{ width: `${(recordingTime / 30) * 100}%` }} transition={{ duration: 0.5 }} />
                      </div>
                    </motion.div>
                  )}
                  {!isRecording && !hasRecorded && (
                    <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-500 text-sm">
                      Tap the mic to start recording in {nativeLangInfo.flag} {nativeLangInfo.name}
                    </motion.p>
                  )}
                  {!isRecording && hasRecorded && (
                    <motion.div key="actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
                      <p className="text-emerald-400 text-sm">Recording complete!</p>
                      <div className="flex gap-3 justify-center">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRecording}
                          className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl hover:bg-white/[0.1] transition text-sm">Re-record</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generatePassport}
                          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-semibold text-black hover:opacity-90 transition text-sm">Generate VoicePassport</motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== PROCESSING ========== */}
        {step === "processing" && (
          <motion.div key="processing" {...pageTransition} className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center space-y-8">
              {/* Passport card animation */}
              <motion.div className="relative mx-auto w-48 h-64">
                {/* Passport shape */}
                <motion.div
                  animate={{ rotateY: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/[0.1] rounded-2xl backdrop-blur-sm overflow-hidden"
                  style={{ perspective: 800 }}>
                  <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  <div className="p-5 pt-6 space-y-3">
                    {/* Mini profile */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/40 to-emerald-500/40 mx-auto flex items-center justify-center text-lg font-bold">
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-white/10 rounded-full w-24 mx-auto" />
                      <div className="h-2 bg-white/5 rounded-full w-16 mx-auto" />
                    </div>
                    {/* Mini language cards */}
                    <div className="grid grid-cols-3 gap-1 pt-2">
                      {targetLangs.slice(0, 6).map((lang, i) => (
                        <motion.div key={lang.code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: progressPercent > (i / 6) * 80 + 20 ? 1 : 0.2 }}
                          className="h-5 bg-white/[0.06] rounded text-[8px] flex items-center justify-center">
                          {lang.flag}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
                {/* Sparkles */}
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ y: [-10, -30, -10], x: [0, (i - 1) * 20, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                    className="absolute -top-2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
                ))}
              </motion.div>

              <div>
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">Creating your VoicePassport</motion.h2>
                <motion.p key={progress} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-cyan-400 text-sm mt-3">{progress}</motion.p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto relative">
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full relative"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #10b981, #06b6d4)", backgroundSize: "200% 100%" }}
                    animate={{ width: `${progressPercent}%`, backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
                    transition={{ width: { duration: 0.5 }, backgroundPosition: { repeat: Infinity, duration: 2, ease: "linear" } }} />
                </div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-gray-600 text-xs font-mono mt-2.5 tabular-nums">{progressPercent}%</motion.p>
              </div>

              {transcript && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-left bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                  <p className="text-gray-500 text-xs mb-1">What we heard:</p>
                  <p className="text-gray-300 text-sm">&ldquo;{transcript}&rdquo;</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== PASSPORT ========== */}
        {step === "passport" && (
          <motion.div key="passport" {...pageTransition} className="min-h-screen px-6 py-12">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Business Card */}
              <motion.div variants={scaleIn} initial="hidden" animate="show" className="relative">
                <div className="absolute -inset-3 bg-gradient-to-b from-cyan-500/10 via-transparent to-emerald-500/10 rounded-[2rem] blur-xl" />
                <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-5 flex-1">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-3xl font-bold overflow-hidden text-black flex-shrink-0">
                          {photo ? (<img src={photo} alt={name} className="w-full h-full object-cover object-top" style={{ transform: `scale(${photoZoom}) translateY(${photoOffsetY}px)` }} />) : name.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                          <h1 className="text-2xl font-bold">{name}</h1>
                          {title && <p className="text-gray-400 text-sm mt-0.5">{title}</p>}
                          {(company || location) && <p className="text-gray-600 text-xs mt-1">{company}{company && location && " \u00b7 "}{location}</p>}
                        </div>
                      </div>
                      {qrDataUrl && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                          className="flex-shrink-0 ml-4 cursor-pointer group" onClick={downloadQR}>
                          <img src={qrDataUrl} alt="QR" className="w-20 h-20 rounded-xl group-hover:ring-2 ring-cyan-500 transition" />
                          {primaryLink && <p className="text-gray-600 text-[9px] text-center mt-1">{PLATFORMS.find(p => p.key === primaryLink)?.label} QR</p>}
                        </motion.div>
                      )}
                    </div>

                    {(email || phone) && (
                      <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/[0.06]">
                        {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>{email}</a>}
                        {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-gray-400 text-sm hover:text-cyan-400 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>{phone}</a>}
                      </div>
                    )}

                    {allLinks.length > 0 && (
                      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-5 pt-5 border-t border-white/[0.06] space-y-2">
                        {allLinks.map((link, i) => {
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

              {/* Voice Section — Original first, then generated */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Voice Introduction
                </h2>

                {/* Original language first */}
                {originalAudioUrl && (
                  <div className="mb-4">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        playingIdx === -1 ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                      }`} onClick={() => playAudio(-1, originalAudioUrl)}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{playingIdx === -1 ? "\u23f8" : "\u25b6"}</span>
                        <p className="font-medium text-sm">Original ({nativeLangInfo.flag} {nativeLangInfo.name})</p>
                        {playingIdx === -1 && (
                          <span className="ml-auto flex gap-0.5">
                            {[1, 2, 3].map((b) => (<motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full" animate={{ height: [8, 8 + b * 6, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />))}
                          </span>
                        )}
                      </div>
                    </motion.div>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedScripts((prev) => { const next = new Set(prev); if (next.has(-1)) next.delete(-1); else next.add(-1); return next; }); }}
                      className="text-gray-600 text-xs mt-1.5 ml-1 hover:text-gray-400 transition">
                      {expandedScripts.has(-1) ? "Hide script" : "View script"}
                    </button>
                    <AnimatePresence>
                      {expandedScripts.has(-1) && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="text-gray-500 text-xs mt-1 ml-1 leading-relaxed">&ldquo;{transcript}&rdquo;</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Generated languages */}
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
                  {entries.map((entry, idx) => (
                    <motion.div key={entry.language.code} variants={scaleIn} className="flex flex-col">
                      <motion.div
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          playingIdx === idx ? "bg-cyan-900/20 border-cyan-500" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                        }`} onClick={() => playAudio(idx, entry.audio)}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{entry.language.flag}</span>
                          <span className="font-medium text-sm">{entry.language.name}</span>
                          <span className="text-gray-600 text-xs ml-auto">{playingIdx === idx ? "" : "\u25b6"}</span>
                          {playingIdx === idx && (
                            <span className="ml-auto flex gap-0.5">
                              {[1, 2, 3].map((b) => (<motion.span key={b} className="w-0.5 bg-cyan-400 rounded-full" animate={{ height: [8, 8 + b * 6, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.15 }} />))}
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

              {/* Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3 justify-center flex-wrap">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyLink}
                  className={`px-6 py-3 rounded-xl transition text-sm font-medium flex items-center gap-2 ${
                    linkCopied ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:opacity-90"
                  }`}>
                  {linkCopied ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Share Link</>)}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setStep("landing"); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100); }}
                  className="px-6 py-3 bg-white/[0.06] rounded-xl hover:bg-white/10 transition text-sm flex items-center gap-2 border border-white/[0.06]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/></svg>
                  View on Landing
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setStep("landing"); setEntries([]); setTranscript(""); setHasRecorded(false); setShareUrl(null); setLinkCopied(false); chunks.current = []; }}
                  className="px-6 py-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition text-sm text-gray-500 border border-white/[0.06]">
                  Start Over
                </motion.button>
              </motion.div>

              {shareUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center">
                  <p className="text-gray-500 text-xs mb-2">Your shareable link:</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                    <p className="text-cyan-400 text-sm font-mono break-all">{shareUrl}</p>
                    <button onClick={copyLink}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] transition text-gray-400 hover:text-white"
                      title="Copy link">
                      {linkCopied ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              <p className="text-center text-gray-800 text-xs">VoicePassport &middot; Powered by ElevenLabs Voice AI</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
