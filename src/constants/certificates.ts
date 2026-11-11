import { buildChallengeUrl } from "../utils/shareUtils";
import { StudioColors, TrackThemes } from "./theme";

export interface CertificateLessonRef {
  id: string;
  track: string;
  lesson_order: number;
}

export interface ChapterTierMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  minOrder: number;
  maxOrder: number;
}

export const TRACK_CHAPTERS: Record<string, ChapterTierMeta[]> = {
  python_basics: [
    {
      id: 1,
      roman: "I",
      title: "Core Python Foundations",
      subtitle: "Variables, conditionals, loops, and list collections",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Functions & Key-Value Data",
      subtitle: "Reusable functions, string methods, dictionaries, and slicing",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Safe & Object-Oriented Code",
      subtitle: "Sets, list comprehensions, error handling, and classes",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Python One-Line Power Tools",
      subtitle: "Text replacing, sum(), URL checks, and safe .get() defaults",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "Everyday Python Essentials",
      subtitle: "F-strings, word splitting, 'in' membership, and rounding",
      minOrder: 17,
      maxOrder: 20,
    },
    {
      id: 6,
      roman: "VI",
      title: "Real-World Mini-App Projects",
      subtitle: "RPG combat math, security check, tip splitter, and bot",
      minOrder: 21,
      maxOrder: 24,
    },
  ],
  algorithms: [
    {
      id: 1,
      roman: "I",
      title: "Hashing & Pointer Speedups",
      subtitle: "Hash maps, two pointers, sliding windows, and binary search",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Stacks, Linked Lists & Trees",
      subtitle: "LIFO validation, pointer reversal, recursion, and DFS",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Fast Searches & Running Totals",
      subtitle:
        "Minimum scan, middle index, list intersection, and prefix sums",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Sorting & Filtering Patterns",
      subtitle: "Max search, leaderboard sorting, modulo filters, and VIP lookup",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "Practical Interview Classics",
      subtitle: "Palindromes, unique set checks, abs() distance, and zip() maps",
      minOrder: 17,
      maxOrder: 20,
    },
  ],
  system_design: [
    {
      id: 1,
      roman: "I",
      title: "Traffic & Caching Layers",
      subtitle: "Load balancing, LRU eviction, rate limiting, and sharding",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Messaging & Distributed Consensus",
      subtitle:
        "Consistent hashing, pub/sub queues, circuit breakers, and quorum",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Resilience & Global Routing",
      subtitle: "Retry caps, 3-strike alerts, server failover, and CDN routing",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Alarms, Flags & Autoscaling",
      subtitle: "RAM alarms, feature flags, upload guards, and queue scaling",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "API Keys, Pagination & Batches",
      subtitle: "Auth checks, page offsets, Redis cache keys, and batch chunks",
      minOrder: 17,
      maxOrder: 20,
    },
  ],
};

export interface CertificateData {
  id: string;
  kind: "track" | "chapter";
  title: string;
  subtitle: string;
  credentialCode: string;
  accent: string;
  recipientLabel: string;
  rankLabel: string;
  xpPoints: number;
  streakCount: number;
  completedCount: number;
  trackKey: string;
  issuedDate: string;
}

function makeCredentialCode(seed: string, prefix: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const code = (hash >>> 0).toString(16).toUpperCase().padStart(6, "0").slice(0, 6);
  return `DLA-${prefix}-${code}`;
}

export function formatCertificateRecipient(userEmail?: string): string {
  if (!userEmail) return "DevLearn Arcade Coder";
  const handle = userEmail.split("@")[0]?.trim();
  return handle ? handle : "DevLearn Arcade Coder";
}

function formatIssuedDate(): string {
  try {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (_e) {
    return "Verified Session";
  }
}

export function buildTrackCertificate(options: {
  trackKey: string;
  completedCount: number;
  xpPoints: number;
  streakCount: number;
  rankLabel: string;
  userEmail?: string;
}): CertificateData {
  const trackMeta =
    TrackThemes[options.trackKey] || TrackThemes.python_basics;
  const recipientLabel = formatCertificateRecipient(options.userEmail);
  return {
    id: `track_${options.trackKey}`,
    kind: "track",
    title: `${trackMeta.label} Graduate`,
    subtitle: `Completed all ${options.completedCount} interactive coding challenges in ${trackMeta.label}.`,
    credentialCode: makeCredentialCode(
      `${options.trackKey}:${recipientLabel}`,
      trackMeta.icon,
    ),
    accent: trackMeta.stickerBg || StudioColors.yellow,
    recipientLabel,
    rankLabel: options.rankLabel,
    xpPoints: options.xpPoints,
    streakCount: options.streakCount,
    completedCount: options.completedCount,
    trackKey: options.trackKey,
    issuedDate: formatIssuedDate(),
  };
}

export function buildChapterCertificate(options: {
  trackKey: string;
  chapter: ChapterTierMeta;
  completedCount: number;
  xpPoints: number;
  streakCount: number;
  rankLabel: string;
  userEmail?: string;
}): CertificateData {
  const trackMeta =
    TrackThemes[options.trackKey] || TrackThemes.python_basics;
  const recipientLabel = formatCertificateRecipient(options.userEmail);
  return {
    id: `chapter_${options.trackKey}_${options.chapter.id}`,
    kind: "chapter",
    title: `${options.chapter.title} (Ch. ${options.chapter.roman})`,
    subtitle: `${trackMeta.label} — ${options.chapter.subtitle}`,
    credentialCode: makeCredentialCode(
      `${options.trackKey}:ch${options.chapter.id}:${recipientLabel}`,
      `${trackMeta.icon}${options.chapter.roman}`,
    ),
    accent:
      options.chapter.id === 6 ? StudioColors.yellow : trackMeta.stickerBg || StudioColors.mint,
    recipientLabel,
    rankLabel: options.rankLabel,
    xpPoints: options.xpPoints,
    streakCount: options.streakCount,
    completedCount: options.completedCount,
    trackKey: options.trackKey,
    issuedDate: formatIssuedDate(),
  };
}

export function getUnlockedCertificates(options: {
  lessons: CertificateLessonRef[];
  completedLessons: Record<string, boolean>;
  xpPoints: number;
  streakCount: number;
  rankLabel: string;
  userEmail?: string;
}): CertificateData[] {
  const results: CertificateData[] = [];
  const trackOrder = ["python_basics", "algorithms", "system_design"];

  for (const trackKey of trackOrder) {
    const tLessons = options.lessons.filter((l) => l.track === trackKey);
    if (!tLessons.length) continue;

    const trackDone = tLessons.filter((l) => options.completedLessons[l.id]).length;
    if (trackDone === tLessons.length) {
      results.push(
        buildTrackCertificate({
          trackKey,
          completedCount: trackDone,
          xpPoints: options.xpPoints,
          streakCount: options.streakCount,
          rankLabel: options.rankLabel,
          userEmail: options.userEmail,
        }),
      );
    }

    const chapters = TRACK_CHAPTERS[trackKey] || [];
    for (const ch of chapters) {
      const chLessons = tLessons.filter(
        (l) => l.lesson_order >= ch.minOrder && l.lesson_order <= ch.maxOrder,
      );
      if (
        chLessons.length > 0 &&
        chLessons.every((l) => options.completedLessons[l.id])
      ) {
        results.push(
          buildChapterCertificate({
            trackKey,
            chapter: ch,
            completedCount: chLessons.length,
            xpPoints: options.xpPoints,
            streakCount: options.streakCount,
            rankLabel: options.rankLabel,
            userEmail: options.userEmail,
          }),
        );
      }
    }
  }

  return results;
}

export function buildCertificateShareText(cert: CertificateData): string {
  const url = buildChallengeUrl({ track: cert.trackKey });
  const streakPart = cert.streakCount > 0 ? ` · 🔥 ${cert.streakCount}d streak` : "";
  return [
    `🎓 Just earned "${cert.title}" on DevLearn Arcade!`,
    `✅ ${cert.completedCount} verified coding labs · ⚡ ${cert.xpPoints} XP${streakPart}`,
    `🏅 Rank: ${cert.rankLabel} · Credential ID: ${cert.credentialCode}`,
    `Try the interactive track 👉 ${url}`,
  ].join("\n");
}

export function buildLinkedInCredentialText(cert: CertificateData): string {
  const url = buildChallengeUrl({ track: cert.trackKey });
  return [
    `Name: ${cert.title}`,
    `Issuing Organization: DevLearn Arcade`,
    `Issue Date: ${cert.issuedDate}`,
    `Credential ID: ${cert.credentialCode}`,
    `Credential URL: ${url}`,
    `Summary: ${cert.subtitle} Verified with in-browser unit assertions.`,
  ].join("\n");
}
