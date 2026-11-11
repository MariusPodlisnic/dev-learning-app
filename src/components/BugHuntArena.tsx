import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  HardShadow,
  HardShadowHero,
  HardShadowSm,
  MonoFont,
  StudioColors,
  TrackThemes,
} from "../constants/theme";
import { buildChallengeUrl, shareOrCopyText } from "../utils/shareUtils";
import { playKeyClick } from "../utils/soundEffects";

export interface BugIncident {
  id: string;
  codeId: string;
  title: string;
  track: "python_basics" | "algorithms" | "system_design";
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimitSec: number;
  baseXp: number;
  symptom: string;
  rootCauseHint: string;
  buggyCode: string;
  testHarness: string;
  expectedSummary: string;
}

const BUG_INCIDENTS: BugIncident[] = [
  {
    id: "bug-101",
    codeId: "MISSION 01",
    title: "Skipped First Item in Cart",
    track: "python_basics",
    difficulty: "Easy",
    timeLimitSec: 60,
    baseXp: 75,
    symptom:
      "The loop starts at index 1 instead of 0, skipping the first price in the list.",
    rootCauseHint:
      "Change range(1, len(prices)) to range(len(prices)) so index 0 is included.",
    buggyCode: `def calculate_cart_total(prices):
    total = 0
    # Fix the loop so index 0 is included:
    for i in range(1, len(prices)):
        total += prices[i]
    return total

print(calculate_cart_total([25, 15, 10]))`,
    testHarness: `
import json
results = []
cases = [
    ([25, 15, 10], 50),
    ([99], 99),
    ([10, 20, 30, 40], 100),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = calculate_cart_total(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"calculate_cart_total({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "calculate_cart_total([25, 15, 10]) → 50",
  },
  {
    id: "bug-102",
    codeId: "MISSION 02",
    title: "Missing Dictionary Key Crash",
    track: "python_basics",
    difficulty: "Easy",
    timeLimitSec: 60,
    baseXp: 75,
    symptom:
      'Crashes with KeyError when "role" is missing. It should default to "guest".',
    rootCauseHint:
      'Replace user["role"] with user.get("role", "guest").',
    buggyCode: `def get_user_badge(user):
    # Default to "guest" when "role" is missing:
    role = user["role"]
    return f"{user['username']} ({role})"

print(get_user_badge({"username": "alex"}))`,
    testHarness: `
import json
results = []
cases = [
    ({"username": "alex"}, "alex (guest)"),
    ({"username": "sam", "role": "admin"}, "sam (admin)"),
    ({"username": "mia", "role": "editor"}, "mia (editor)"),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    try:
        actual = get_user_badge(inp)
    except Exception as e:
        actual = f"KeyError: {e}"
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"get_user_badge({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'get_user_badge({"username": "alex"}) → "alex (guest)"',
  },
  {
    id: "bug-201",
    codeId: "MISSION 03",
    title: "Case-Sensitive Palindrome",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 100,
    symptom:
      'Returns False for "Racecar" because uppercase "R" and lowercase "r" don\'t match.',
    rootCauseHint:
      "Add text = text.lower() at the top of the function before comparing.",
    buggyCode: `def is_palindrome(text):
    # Make the check ignore uppercase/lowercase:
    left = 0
    right = len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("Racecar"))`,
    testHarness: `
import json
results = []
cases = [
    ("Racecar", True),
    ("Level", True),
    ("python", False),
    ("Kayak", True),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = is_palindrome(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f'is_palindrome("{inp}")',
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'is_palindrome("Racecar") → True',
  },
  {
    id: "bug-202",
    codeId: "MISSION 04",
    title: "Negative Numbers Max Bug",
    track: "algorithms",
    difficulty: "Medium",
    timeLimitSec: 75,
    baseXp: 100,
    symptom:
      "Returns 0 instead of -5 when all numbers in the list are negative.",
    rootCauseHint:
      "Start with best = nums[0] instead of best = 0.",
    buggyCode: `def find_max_reading(nums):
    # Fix so negative lists like [-12, -5, -20] return -5:
    best = 0
    for n in nums:
        if n > best:
            best = n
    return best

print(find_max_reading([-12, -5, -20]))`,
    testHarness: `
import json
results = []
cases = [
    ([-12, -5, -20], -5),
    ([14, 42, 8], 42),
    ([-100, -50, -75], -50),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = find_max_reading(inp)
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"find_max_reading({inp})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "find_max_reading([-12, -5, -20]) → -5",
  },
  {
    id: "bug-301",
    codeId: "MISSION 05",
    title: "Rate-Limiter Boundary Leak",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 120,
    symptom:
      "Allows 1 extra request through when current_count equals max_requests.",
    rootCauseHint:
      "Use < instead of <= so requests are blocked once current_count reaches max_requests.",
    buggyCode: `def allow_request(current_count, max_requests):
    # Block the request when current_count reaches max_requests:
    if current_count <= max_requests:
        return True
    return False

print(allow_request(100, 100))`,
    testHarness: `
import json
results = []
cases = [
    ((100, 100), False),
    ((99, 100), True),
    ((0, 5), True),
    ((5, 5), False),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = allow_request(inp[0], inp[1])
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"allow_request({inp[0]}, {inp[1]})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: "allow_request(100, 100) → False",
  },
  {
    id: "bug-302",
    codeId: "MISSION 06",
    title: "FIFO Cache Evicts Wrong Item",
    track: "system_design",
    difficulty: "Hard",
    timeLimitSec: 90,
    baseXp: 120,
    symptom:
      "When the cache is full, it removes the newest item at the end instead of the oldest item at index 0.",
    rootCauseHint:
      "Use cache.pop(0) to remove the oldest item from the front of the list.",
    buggyCode: `def push_to_cache(cache, new_item, capacity):
    if len(cache) >= capacity:
        # Remove the oldest item (index 0), not the newest:
        cache.pop(-1)
    cache.append(new_item)
    return cache

print(push_to_cache(["a", "b", "c"], "d", 3))`,
    testHarness: `
import json
results = []
cases = [
    ((["a", "b", "c"], "d", 3), ["b", "c", "d"]),
    ((["k1", "k2"], "k3", 2), ["k2", "k3"]),
    ((["only_one"], "second", 3), ["only_one", "second"]),
]
all_passed = True
for idx, (inp, exp) in enumerate(cases):
    actual = push_to_cache(list(inp[0]), inp[1], inp[2])
    passed = actual == exp
    if not passed:
        all_passed = False
    results.append({
        "id": idx + 1,
        "input": f"push_to_cache({inp[0]}, '{inp[1]}', {inp[2]})",
        "expected": str(exp),
        "actual": str(actual),
        "passed": passed
    })
json.dumps({"is_test_suite": True, "all_passed": all_passed, "results": results})
`,
    expectedSummary: 'push_to_cache(["a", "b", "c"], "d", 3) → ["b", "c", "d"]',
  },
];

interface BugTestResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface BugHuntArenaProps {
  pyodideReady: boolean;
  isPremium?: boolean;
  onRequirePro?: () => void;
  onExecutePatch: (
    userCode: string,
    testHarness: string,
  ) => Promise<{
    allPassed: boolean;
    results: BugTestResult[];
    stdout: string;
    error?: string;
  }>;
  onAwardBugHuntXp: (xpEarned: number, incidentId: string) => void;
  solvedIncidents: Record<string, boolean>;
  renderHighlightedPython: (source: string) => React.ReactNode;
}

export default function BugHuntArena({
  pyodideReady,
  isPremium = false,
  onRequirePro,
  onExecutePatch,
  onAwardBugHuntXp,
  solvedIncidents,
  renderHighlightedPython,
}: BugHuntArenaProps) {
  // null = Mission Select Lobby; number = Active Game Mission
  const [activeMissionIdx, setActiveMissionIdx] = useState<number | null>(null);
  const currentIncident =
    activeMissionIdx !== null ? BUG_INCIDENTS[activeMissionIdx] : null;

  const [code, setCode] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const [failedCase, setFailedCase] = useState<BugTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [patchStatus, setPatchStatus] = useState<
    "playing" | "resolved" | "failed" | "timeout"
  >("playing");
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");

  function startMission(index: number) {
    const inc = BUG_INCIDENTS[index];
    if (!inc) return;
    if (TrackThemes[inc.track]?.isPro && !isPremium) {
      onRequirePro?.();
      return;
    }
    setActiveMissionIdx(index);
    setCode(inc.buggyCode);
    setSecondsLeft(inc.timeLimitSec);
    setShowHint(false);
    setFailedCase(null);
    setErrorMessage("");
    setPatchStatus("playing");
    setEarnedXp(0);
    setShareFeedback("idle");
  }

  useEffect(() => {
    if (activeMissionIdx === null || patchStatus === "resolved") return;
    if (secondsLeft <= 0) {
      setPatchStatus("timeout");
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMissionIdx, secondsLeft, patchStatus]);

  const solvedCount = BUG_INCIDENTS.filter(
    (inc) => solvedIncidents[inc.id],
  ).length;

  // ============================================================================
  // PHASE 1: MISSION SELECT LOBBY (Timer does NOT run until user picks a card)
  // ============================================================================
  if (activeMissionIdx === null || !currentIncident) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.lobbyContent}
      >
        <View style={styles.lobbyHeader}>
          <View style={styles.lobbyPill}>
            <Text style={styles.lobbyPillText}>PRACTICE ARENA // TIME-ATTACK</Text>
          </View>
          <Text style={styles.lobbyTitle}>Production Bug Hunt</Text>
          <Text style={styles.lobbySubtitle}>
            Select an incident below. The countdown clock only starts once you
            enter a mission.
          </Text>
          <View style={styles.lobbyProgressPill}>
            <Text style={styles.lobbyProgressText}>
              {solvedCount} / {BUG_INCIDENTS.length} INCIDENTS PATCHED
            </Text>
          </View>
        </View>

        <View style={styles.missionGrid}>
          {BUG_INCIDENTS.map((inc, idx) => {
            const isSolved = Boolean(solvedIncidents[inc.id]);
            const tMeta = TrackThemes[inc.track] || TrackThemes.python_basics;
            const isLockedPro = Boolean(tMeta.isPro && !isPremium);

            return (
              <Pressable
                key={inc.id}
                style={({ pressed }) => [
                  styles.missionCard,
                  isSolved && styles.missionCardSolved,
                  isLockedPro && styles.missionCardLocked,
                  pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                ]}
                onPress={() => startMission(idx)}
              >
                <View
                  style={[
                    styles.missionTopRibbon,
                    {
                      backgroundColor: isLockedPro
                        ? StudioColors.pink
                        : isSolved
                          ? StudioColors.mint
                          : tMeta.stickerBg || StudioColors.yellow,
                    },
                  ]}
                />
                <View style={styles.missionCardTop}>
                  <Text style={styles.missionNumber}>
                    {isLockedPro ? `🔒 ${inc.codeId}` : inc.codeId}
                  </Text>
                  <View
                    style={[
                      styles.diffBadge,
                      isLockedPro
                        ? { backgroundColor: StudioColors.pink }
                        : inc.difficulty === "Easy"
                          ? styles.diffEasy
                          : inc.difficulty === "Medium"
                            ? styles.diffMedium
                            : styles.diffHard,
                    ]}
                  >
                    <Text style={styles.diffBadgeText}>
                      {isLockedPro ? "PRO TRACK" : inc.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.missionTitle}>{inc.title}</Text>
                <Text style={styles.missionDesc} numberOfLines={2}>
                  {inc.symptom}
                </Text>

                <View style={styles.missionMetaRow}>
                  <Text style={styles.missionMetaItem}>
                    ⏱ {inc.timeLimitSec}s
                  </Text>
                  <Text style={styles.missionMetaItem}>
                    ⚡ +{inc.baseXp} XP
                  </Text>
                </View>

                <View
                  style={[
                    styles.playBtn,
                    isSolved && styles.playBtnSolved,
                    isLockedPro && styles.playBtnProLocked,
                  ]}
                >
                  <Text style={styles.playBtnText}>
                    {isLockedPro
                      ? "🔒 UNLOCK PRO TRACK →"
                      : isSolved
                        ? "✓ PATCHED · REPLAY"
                        : "START MISSION →"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // ============================================================================
  // PHASE 2: ACTIVE GAME ARENA (Clean, focused, timer running)
  // ============================================================================
  const timeRatio = Math.max(
    0,
    Math.min(1, secondsLeft / currentIncident.timeLimitSec),
  );
  const timerColor =
    patchStatus === "resolved"
      ? StudioColors.emerald
      : timeRatio > 0.5
        ? StudioColors.emerald
        : timeRatio > 0.2
          ? StudioColors.amber
          : StudioColors.rose;

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;

  const lineCount = Math.max((code || "").split("\n").length, 8);

  async function handleDeployHotfix() {
    if (isDeploying || !currentIncident) return;
    setIsDeploying(true);
    setErrorMessage("");
    setFailedCase(null);

    try {
      const outcome = await onExecutePatch(code, currentIncident.testHarness);
      if (outcome.error) {
        setPatchStatus("failed");
        setErrorMessage(outcome.error);
      } else if (outcome.allPassed) {
        const speedBonus =
          secondsLeft >= Math.floor(currentIncident.timeLimitSec * 0.5)
            ? 25
            : 0;
        const total =
          secondsLeft > 0
            ? currentIncident.baseXp + speedBonus
            : Math.round(currentIncident.baseXp * 0.5);
        setEarnedXp(total);
        setPatchStatus("resolved");
        onAwardBugHuntXp(total, currentIncident.id);
      } else {
        setPatchStatus("failed");
        const firstFail = outcome.results.find((r) => !r.passed) || null;
        setFailedCase(firstFail);
      }
    } finally {
      setIsDeploying(false);
    }
  }

  async function handleSharePatch() {
    if (!currentIncident) return;
    playKeyClick();
    const isFast = secondsLeft >= Math.floor(currentIncident.timeLimitSec * 0.5);
    const speedBar = isFast ? "🟩🟩🟩 ⚡" : secondsLeft > 0 ? "🟩🟩🟨 🛠️" : "🟩🟨🟨 ⏱️";
    const url = buildChallengeUrl({ mode: "bughunt" });
    const message = [
      `🪲 DevLearn Bug Hunt — ${currentIncident.codeId}: ${currentIncident.title}`,
      `${speedBar} Defect Patched! (+${earnedXp} XP)`,
      `⏱ ${formattedTime} remaining · ${currentIncident.difficulty}`,
      `Can you fix this production bug faster? 👉 ${url}`,
    ].join("\n");
    const outcome = await shareOrCopyText({
      title: `DevLearn Bug Hunt — ${currentIncident.title}`,
      message,
    });
    if (outcome !== "failed") {
      setShareFeedback(outcome);
      setTimeout(() => setShareFeedback("idle"), 2500);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.gameContent}
    >
      {/* Clean Game HUD Bar */}
      <View style={styles.hudBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => setActiveMissionIdx(null)}
        >
          <Text style={styles.backBtnText}>◀ All Missions</Text>
        </Pressable>

        <View style={styles.hudCenter}>
          <Text style={styles.hudCode}>{currentIncident.codeId}</Text>
          <Text style={styles.hudTitle}>{currentIncident.title}</Text>
        </View>

        <View style={[styles.hudTimerBox, { borderColor: `${timerColor}88` }]}>
          <Text style={[styles.hudTimerText, { color: timerColor }]}>
            {patchStatus === "resolved"
              ? `✓ ${formattedTime}`
              : secondsLeft === 0
                ? "0:00"
                : formattedTime}
          </Text>
        </View>
      </View>

      {/* Slim Timer Progress Bar */}
      <View style={styles.timerStripTrack}>
        <View
          style={[
            styles.timerStripFill,
            {
              width: `${Math.round(timeRatio * 100)}%`,
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>

      {/* Brief Goal + Optional Hint */}
      <View style={styles.goalCard}>
        <View style={styles.goalLeft}>
          <Text style={styles.goalLabel}>SPECIFICATION // DEFECT</Text>
          <Text style={styles.goalText}>{currentIncident.symptom}</Text>
          <Text style={styles.goalExpected}>
            Expected: {currentIncident.expectedSummary}
          </Text>
        </View>

        <Pressable
          style={styles.hintPillBtn}
          onPress={() => setShowHint((prev) => !prev)}
        >
          <Text style={styles.hintPillText}>
            {showHint ? "Hide Clue" : "+ Reveal Clue"}
          </Text>
        </Pressable>
      </View>

      {showHint && (
        <View style={styles.hintBanner}>
          <Text style={styles.hintBannerText}>
            CLUE // {currentIncident.rootCauseHint}
          </Text>
        </View>
      )}

      {/* Win / Timeout / Fail Feedback Banner */}
      {patchStatus === "resolved" && (
        <View style={styles.winBanner}>
          <View>
            <Text style={styles.winTitle}>
              ✓ Defect Resolved (+{earnedXp} XP)
            </Text>
            <Text style={styles.winSub}>
              All assertions passed with {formattedTime} remaining on the clock.
            </Text>
          </View>
          <View style={styles.winActions}>
            <Pressable
              style={[
                styles.sharePatchBtn,
                shareFeedback !== "idle" && styles.sharePatchBtnDone,
              ]}
              onPress={handleSharePatch}
            >
              <Text style={styles.sharePatchBtnText}>
                {shareFeedback === "copied"
                  ? "✓ COPIED!"
                  : shareFeedback === "shared"
                    ? "✓ SHARED!"
                    : "📤 SHARE FIX ↗"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.nextBtn}
              onPress={() =>
                startMission((activeMissionIdx + 1) % BUG_INCIDENTS.length)
              }
            >
              <Text style={styles.nextBtnText}>Next Mission →</Text>
            </Pressable>
          </View>
        </View>
      )}

      {patchStatus === "timeout" && (
        <View style={styles.failBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.failTitle}>TIME EXPIRED</Text>
            <Text style={styles.failSub}>
              You can still verify your patch or reset the clock for full XP.
            </Text>
          </View>
          <Pressable
            style={styles.retryBtn}
            onPress={() => startMission(activeMissionIdx)}
          >
            <Text style={styles.retryBtnText}>↺ Reset Clock</Text>
          </Pressable>
        </View>
      )}

      {patchStatus === "failed" && (errorMessage || failedCase) && (
        <View style={styles.failBanner}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.failTitle}>ASSERTION FAILED</Text>
            {errorMessage ? (
              <Text style={styles.failCode}>{errorMessage}</Text>
            ) : failedCase ? (
              <Text style={styles.failCode}>
                For {failedCase.input} → Expected {failedCase.expected}, but got{" "}
                {failedCase.actual}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Focused Code Editor */}
      <View style={styles.ideFrame}>
        <View style={styles.ideHeader}>
          <Text style={styles.ideFilename}>patch.py</Text>
          <Pressable
            style={styles.resetCodeBtn}
            onPress={() => setCode(currentIncident.buggyCode)}
          >
            <Text style={styles.resetCodeBtnText}>↺ Reset Code</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.editorScroll}
          contentContainerStyle={[
            styles.editorBody,
            { minHeight: lineCount * 21 + 32 },
          ]}
        >
          <View style={styles.lineNumbers}>
            {Array.from({ length: lineCount }).map((_, i) => (
              <Text key={i} style={styles.lineNumberText}>
                {i + 1}
              </Text>
            ))}
          </View>

          <View
            style={[
              styles.editorCodeWrapper,
              { minHeight: lineCount * 21 + 32 },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.syntaxHighlightLayer,
                { minHeight: lineCount * 21 + 32 },
              ]}
            >
              <Text style={styles.syntaxHighlightText}>
                {renderHighlightedPython(code)}
                {code.endsWith("\n") ? " " : ""}
              </Text>
            </View>

            <TextInput
              style={[styles.codeEditor, { minHeight: lineCount * 21 + 32 }]}
              value={code}
              onChangeText={setCode}
              onKeyPress={(e: any) => {
                const nativeEv = e?.nativeEvent;
                if (
                  nativeEv &&
                  nativeEv.key === "Enter" &&
                  (nativeEv.metaKey || nativeEv.ctrlKey)
                ) {
                  e.preventDefault?.();
                  handleDeployHotfix();
                }
              }}
              multiline
              scrollEnabled={false}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </ScrollView>
      </View>

      {/* Single Primary Action Button */}
      <Pressable
        style={[
          styles.deployBtn,
          (!pyodideReady || isDeploying) && styles.deployBtnDisabled,
        ]}
        onPress={handleDeployHotfix}
        disabled={!pyodideReady || isDeploying}
      >
        <Text style={styles.deployBtnText}>
          {isDeploying
            ? "Verifying Patch..."
            : `Verify & Deploy Patch (+${currentIncident.baseXp} XP) →`}
        </Text>
        <View style={styles.deployShortcutBadge}>
          <Text style={styles.deployShortcutText}>⌘↵</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  // LOBBY STYLES
  lobbyContent: {
    padding: 28,
    paddingBottom: 60,
    maxWidth: 1020,
    width: "100%",
    alignSelf: "center",
    gap: 28,
  },
  lobbyHeader: {
    alignItems: "center",
    gap: 10,
  },
  lobbyPill: {
    backgroundColor: StudioColors.coral,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7,
    ...HardShadowSm,
  },
  lobbyPillText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  lobbyTitle: {
    color: StudioColors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  lobbySubtitle: {
    color: StudioColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 500,
    lineHeight: 20,
  },
  lobbyProgressPill: {
    marginTop: 4,
    backgroundColor: StudioColors.mint,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    ...HardShadowSm,
  },
  lobbyProgressText: {
    color: StudioColors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 0.8,
  },
  missionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    justifyContent: "center",
  },
  missionCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 20,
    paddingTop: 26,
    width: 300,
    gap: 10,
    position: "relative",
    overflow: "hidden",
    ...HardShadow,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  missionCardSolved: {
    borderColor: StudioColors.border,
  },
  missionCardLocked: {
    opacity: 0.85,
  },
  missionTopRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.border,
  },
  missionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  missionNumber: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
  },
  diffEasy: {
    backgroundColor: StudioColors.mint,
  },
  diffMedium: {
    backgroundColor: StudioColors.yellow,
  },
  diffHard: {
    backgroundColor: StudioColors.coral,
  },
  diffBadgeText: {
    color: StudioColors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  missionTitle: {
    color: StudioColors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  missionDesc: {
    color: StudioColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    minHeight: 38,
  },
  missionMetaRow: {
    flexDirection: "row",
    gap: 14,
    paddingTop: 4,
  },
  missionMetaItem: {
    color: StudioColors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  playBtn: {
    marginTop: 6,
    backgroundColor: StudioColors.lime,
    paddingVertical: 12,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    alignItems: "center",
    ...HardShadow,
  },
  playBtnSolved: {
    backgroundColor: StudioColors.mint,
  },
  playBtnProLocked: {
    backgroundColor: StudioColors.pink,
  },
  playBtnText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },

  // ACTIVE GAME STYLES
  gameContent: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 840,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },
  hudBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  backBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  backBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  hudCenter: {
    alignItems: "center",
  },
  hudCode: {
    color: StudioColors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  hudTitle: {
    color: StudioColors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  hudTimerBox: {
    backgroundColor: StudioColors.surface,
    borderWidth: 2,
    borderColor: StudioColors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    ...HardShadowSm,
  },
  hudTimerText: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  timerStripTrack: {
    height: 10,
    backgroundColor: StudioColors.surface,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  timerStripFill: {
    height: "100%",
  },
  goalCard: {
    backgroundColor: StudioColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    ...HardShadow,
  },
  goalLeft: {
    flex: 1,
    minWidth: 240,
    gap: 4,
  },
  goalLabel: {
    color: StudioColors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: MonoFont,
  },
  goalText: {
    color: StudioColors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  goalExpected: {
    color: StudioColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MonoFont,
    marginTop: 2,
  },
  hintPillBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  hintPillText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  hintBanner: {
    backgroundColor: StudioColors.yellow,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 12,
    ...HardShadowSm,
  },
  hintBannerText: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  winBanner: {
    backgroundColor: StudioColors.mint,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    ...HardShadow,
  },
  winTitle: {
    color: StudioColors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  winSub: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  winActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sharePatchBtn: {
    backgroundColor: StudioColors.yellow,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  sharePatchBtnDone: {
    backgroundColor: StudioColors.surface,
  },
  sharePatchBtnText: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  nextBtn: {
    backgroundColor: StudioColors.lime,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  nextBtnText: {
    color: StudioColors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  failBanner: {
    backgroundColor: StudioColors.coral,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.ink,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    ...HardShadowSm,
  },
  failTitle: {
    color: StudioColors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  failSub: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  failCode: {
    color: StudioColors.ink,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  retryBtn: {
    backgroundColor: StudioColors.surface,
    borderWidth: 1.5,
    borderColor: StudioColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...HardShadowSm,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  retryBtnText: {
    color: StudioColors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  ideFrame: {
    backgroundColor: StudioColors.codeBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: StudioColors.border,
    overflow: "hidden",
    ...HardShadow,
  },
  ideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: StudioColors.codeSurface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: StudioColors.codeBorder,
  },
  ideFilename: {
    color: StudioColors.codeText,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  resetCodeBtn: {
    backgroundColor: StudioColors.codeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: StudioColors.codeBorder,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  resetCodeBtnText: {
    color: StudioColors.codeMuted,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: MonoFont,
  },
  editorScroll: {
    maxHeight: 300,
  },
  editorBody: {
    flexDirection: "row",
    backgroundColor: StudioColors.codeBg,
  },
  lineNumbers: {
    width: 44,
    paddingVertical: 16,
    backgroundColor: StudioColors.codeSurface,
    borderRightWidth: 1,
    borderRightColor: StudioColors.codeBorder,
    alignItems: "center",
  },
  lineNumberText: {
    color: StudioColors.codeMuted,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: MonoFont,
  },
  editorCodeWrapper: {
    flex: 1,
    position: "relative",
  },
  syntaxHighlightLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  syntaxHighlightText: {
    fontSize: 13,
    lineHeight: 21,
    fontFamily: MonoFont,
    color: StudioColors.codeText,
  },
  codeEditor: {
    flex: 1,
    padding: 16,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: MonoFont,
    color: "transparent",
    backgroundColor: "transparent",
    zIndex: 2,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        caretColor: StudioColors.lime,
        resize: "none",
      } as any,
    }),
  },
  deployBtn: {
    backgroundColor: StudioColors.lime,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: StudioColors.ink,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    ...HardShadowHero,
    ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
  },
  deployBtnDisabled: {
    opacity: 0.5,
  },
  deployBtnText: {
    color: StudioColors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
  deployShortcutBadge: {
    backgroundColor: StudioColors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  deployShortcutText: {
    color: StudioColors.lime,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: MonoFont,
  },
});
