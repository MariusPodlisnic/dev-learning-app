import { buildChallengeUrl } from "../utils/shareUtils";
import { StudioColors, TrackThemes } from "./theme";

export interface CertificateLessonRef {
  id: string;
  track: string;
  lesson_order: number;
  is_recap?: boolean;
  recap_chapter?: number;
}

export interface ChapterTierMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  minOrder: number;
  maxOrder: number;
}

export function isLessonInChapter(
  lesson: { lesson_order: number; is_recap?: boolean; recap_chapter?: number },
  chapter: ChapterTierMeta,
): boolean {
  if (typeof lesson.recap_chapter === "number") {
    return lesson.recap_chapter === chapter.id;
  }
  return (
    lesson.lesson_order >= chapter.minOrder &&
    lesson.lesson_order <= chapter.maxOrder
  );
}

export function getChapterForTrackLesson(
  trackKey: string,
  lesson: { lesson_order: number; is_recap?: boolean; recap_chapter?: number },
): ChapterTierMeta {
  const chapters = TRACK_CHAPTERS[trackKey] || TRACK_CHAPTERS.python_basics;
  if (typeof lesson.recap_chapter === "number") {
    const byRecap = chapters.find((ch) => ch.id === lesson.recap_chapter);
    if (byRecap) return byRecap;
  }
  return (
    chapters.find(
      (ch) =>
        lesson.lesson_order >= ch.minOrder &&
        lesson.lesson_order <= ch.maxOrder,
    ) || chapters[chapters.length - 1]
  );
}

export function getCurriculumLessonSortKey(
  trackKey: string,
  lesson: { lesson_order: number; is_recap?: boolean; recap_chapter?: number },
): number {
  if (lesson.is_recap || typeof lesson.recap_chapter === "number") {
    const ch = getChapterForTrackLesson(trackKey, lesson);
    return ch.maxOrder + 0.5;
  }
  return lesson.lesson_order;
}

export const TRACK_CHAPTERS: Record<string, ChapterTierMeta[]> = {
  python_basics: [
    {
      id: 1,
      roman: "I",
      title: "Core Python Foundations",
      subtitle: "Variables, functions & return, conditionals, and loops",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Dictionaries, Text & Crash-Proofing",
      subtitle:
        "Key-value registries, string normalization, list filtering, and try/except",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Collections, Sets & Slicing",
      subtitle:
        "Frequency counting, set deduplication, string joining, and top-N slicing",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Idiomatic Built-Ins & Safe Defaults",
      subtitle:
        "Text replacing, sum() totals, prefix checks, and safe .get() defaults",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "String Formatting & Data Precision",
      subtitle:
        "F-string templates, word splitting, 'in' membership, and rounding",
      minOrder: 17,
      maxOrder: 20,
    },
    {
      id: 6,
      roman: "VI",
      title: "Applied Mini-App Projects",
      subtitle: "RPG combat math, password validator, tip splitter, and bot",
      minOrder: 21,
      maxOrder: 24,
    },
    {
      id: 7,
      roman: "VII",
      title: "Modern Python, OOP & Decorators",
      subtitle: "Comprehensions, OOP classes, regex parsing, and decorators",
      minOrder: 25,
      maxOrder: 28,
    },
    {
      id: 8,
      roman: "VIII",
      title: "SQL & Relational Databases (sqlite3)",
      subtitle:
        "SELECT/WHERE queries, SQL injection guards, GROUP BY analytics, JOINs, and transactions",
      minOrder: 29,
      maxOrder: 32,
    },
  ],
  algorithms: [
    {
      id: 1,
      roman: "I",
      title: "Hashing, Pointers & Stacks",
      subtitle: "Hash maps, two pointers, LIFO bracket stacks, and binary search",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Frequencies, Windows & Subarrays",
      subtitle:
        "Hash frequency maps, nested bracket checks, sliding windows, and Kadane's O(n)",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Sets, Binary Bounds & Prefix Sums",
      subtitle:
        "Filtered scans, O(n) set intersections, lower-bound search, and range sums",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Fast Gatekeepers, Ranking & Partitions",
      subtitle:
        "O(1) badge sets, runner-up tracking, multi-key sorting, and parity partitions",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "Duplicates, Strings & Inverted Indexes",
      subtitle:
        "Early duplicate detection, palindrome sanitizing, closest pairs, and role maps",
      minOrder: 17,
      maxOrder: 20,
    },
    {
      id: 6,
      roman: "VI",
      title: "Pro Interview Capstones",
      subtitle: "Best-profit greedy scan, anagram grouping, intervals, and top-K",
      minOrder: 21,
      maxOrder: 24,
    },
    {
      id: 7,
      roman: "VII",
      title: "Trees, Graphs, Heaps & DP",
      subtitle:
        "BST DFS traversals, shortest-path BFS, min-heaps, and dynamic programming",
      minOrder: 25,
      maxOrder: 28,
    },
  ],
  system_design: [
    {
      id: 1,
      roman: "I",
      title: "Traffic & Caching Foundations",
      subtitle:
        "Token bucket limits, in-memory Redis lookups, shard routing, and load balancing",
      minOrder: 1,
      maxOrder: 4,
    },
    {
      id: 2,
      roman: "II",
      title: "Sharding, Circuit Breakers & Consensus",
      subtitle:
        "Database partitioning, circuit breakers, quorum consensus, and pub/sub queues",
      minOrder: 5,
      maxOrder: 8,
    },
    {
      id: 3,
      roman: "III",
      title: "Resilience & Edge Traffic Routing",
      subtitle:
        "Exponential backoff + jitter, DLQ triage, healthy failover, and latency-aware CDN",
      minOrder: 9,
      maxOrder: 12,
    },
    {
      id: 4,
      roman: "IV",
      title: "Gateways, Observability & Autoscaling",
      subtitle:
        "Gateway validation, flap-guarded alarms, percentage rollout flags, and autoscaling",
      minOrder: 13,
      maxOrder: 16,
    },
    {
      id: 5,
      roman: "V",
      title: "Batching, Auth, Pagination & Cache-Aside",
      subtitle:
        "Notification batching, scoped key expiry, cursor pagination, and cache-aside reads",
      minOrder: 17,
      maxOrder: 20,
    },
    {
      id: 6,
      roman: "VI",
      title: "Production Architecture Capstones",
      subtitle: "Sliding window logs, token buckets, hash rings, and TTL caches",
      minOrder: 21,
      maxOrder: 24,
    },
    {
      id: 7,
      roman: "VII",
      title: "Webhooks, Idempotency & Sagas",
      subtitle:
        "HMAC-SHA256 signatures, idempotency ledgers, Base62 IDs, and saga rollbacks",
      minOrder: 25,
      maxOrder: 28,
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
  if (!userEmail) return "Devy Coder";
  const handle = userEmail.split("@")[0]?.trim();
  return handle ? handle : "Devy Coder";
}

function formatIssuedDate(): string {
  try {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
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
      const chLessons = tLessons.filter((l) => isLessonInChapter(l, ch));
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
  const url = buildChallengeUrl({ track: cert.trackKey, ref: "certificate" });
  const streakPart = cert.streakCount > 0 ? ` · 🔥 ${cert.streakCount}d streak` : "";
  return [
    `🎓 Just earned "${cert.title}" on Devy!`,
    `✅ ${cert.completedCount} verified coding labs · ⚡ ${cert.xpPoints} XP${streakPart}`,
    `🏅 Rank: ${cert.rankLabel} · Credential ID: ${cert.credentialCode}`,
    `Try the interactive track 👉 ${url}`,
  ].join("\n");
}

export function buildLinkedInCredentialText(cert: CertificateData): string {
  const url = buildChallengeUrl({ track: cert.trackKey, ref: "certificate" });
  return [
    `Name: ${cert.title}`,
    `Issuing Organization: Devy`,
    `Issue Date: ${cert.issuedDate}`,
    `Credential ID: ${cert.credentialCode}`,
    `Credential URL: ${url}`,
    `Summary: ${cert.subtitle} Verified with in-browser unit assertions.`,
  ].join("\n");
}
