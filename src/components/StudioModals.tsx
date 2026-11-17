import React from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { CertificateData } from "../constants/certificates";
import { StreakMilestone } from "../constants/streaks";
import { TrackThemes } from "../constants/theme";
import {
  getLessonStarRating,
  Lesson,
} from "../types/lesson";
import { LessonEnrichment } from "../constants/curriculum";
import Auth, { type AuthModalMode } from "./Auth";
import CertificateModal from "./CertificateModal";
import PaywallModal, {
  PaywallPlanId,
  PaywallTriggerContext,
} from "./PaywallModal";
import ProfileStatsModal from "./ProfileStatsModal";
import StreakMilestoneModal from "./StreakMilestoneModal";
import SuccessModal from "./SuccessModal";

interface StudioModalsProps {
  styles: any;
  keyboardBehavior: "padding" | "height" | undefined;
  showAuthModal: boolean;
  authDefaultMode: AuthModalMode;
  authPromptReason?: string;
  onAuthSuccess: () => void;
  onCloseAuth: () => void;
  showPaywallModal: boolean;
  onClosePaywall: () => void;
  onUpgradeToPro: (plan: PaywallPlanId) => Promise<void> | void;
  upgrading: boolean;
  lessons: Lesson[];
  algoModulesCount: number;
  sysDesignModulesCount: number;
  xpPoints: number;
  totalSolvedCount: number;
  streakCount: number;
  hasSession: boolean;
  paywallContext: PaywallTriggerContext;
  paywallFreePreviewLesson?: Lesson;
  onTryFreePreviewLesson: (lesson: Lesson) => void;
  showSuccessModal: boolean;
  selectedLesson: Lesson | null;
  activeChallengeIdx: number;
  lessonEnrichment: LessonEnrichment | null;
  hasNextLesson: boolean;
  currentLessons: Lesson[];
  currentLessonIndex: number;
  completedLessons: Record<string, boolean>;
  completedChallenges: Record<string, boolean>;
  peekedSolutions: Record<string, boolean>;
  activeTrack: string;
  completedCount: number;
  onOpenAuthPrompt: (mode: "signup" | "signin", reason?: string) => void;
  onOpenTrackCertificate: (trackKey: string) => void;
  onNextLesson: () => void;
  onCloseSuccess: () => void;
  showProfileModal: boolean;
  effectiveIsPremium: boolean;
  userEmail?: string;
  onSelectTrack: (trackKey: string) => void;
  onOpenCertificate: (cert: CertificateData) => void;
  onOpenAchievementsTab: () => void;
  onToggleDevPro?: () => void;
  onCloseProfile: () => void;
  activeCertificate: CertificateData | null;
  onCloseCertificate: () => void;
  activeStreakMilestone: StreakMilestone | null;
  devRank: { level: number; title: string };
  onCloseStreakMilestone: () => void;
}

export default function StudioModals({
  styles,
  keyboardBehavior,
  showAuthModal,
  authDefaultMode,
  authPromptReason,
  onAuthSuccess,
  onCloseAuth,
  showPaywallModal,
  onClosePaywall,
  onUpgradeToPro,
  upgrading,
  lessons,
  algoModulesCount,
  sysDesignModulesCount,
  xpPoints,
  totalSolvedCount,
  streakCount,
  hasSession,
  paywallContext,
  paywallFreePreviewLesson,
  onTryFreePreviewLesson,
  showSuccessModal,
  selectedLesson,
  activeChallengeIdx,
  lessonEnrichment,
  hasNextLesson,
  currentLessons,
  currentLessonIndex,
  completedLessons,
  completedChallenges,
  peekedSolutions,
  activeTrack,
  completedCount,
  onOpenAuthPrompt,
  onOpenTrackCertificate,
  onNextLesson,
  onCloseSuccess,
  showProfileModal,
  effectiveIsPremium,
  userEmail,
  onSelectTrack,
  onOpenCertificate,
  onOpenAchievementsTab,
  onToggleDevPro,
  onCloseProfile,
  activeCertificate,
  onCloseCertificate,
  activeStreakMilestone,
  devRank,
  onCloseStreakMilestone,
}: StudioModalsProps) {
  return (
    <>
      {showAuthModal && (
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={keyboardBehavior}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close authentication backdrop"
            style={StyleSheet.absoluteFill}
            onPress={onCloseAuth}
          />
          <View style={styles.modalContent}>
            <Auth
              defaultMode={authDefaultMode}
              guestXp={xpPoints}
              guestSolvedCount={totalSolvedCount}
              promptReason={authPromptReason}
              onSuccess={onAuthSuccess}
              onClose={onCloseAuth}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {showPaywallModal && (
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close upgrade modal"
            style={StyleSheet.absoluteFill}
            onPress={onClosePaywall}
          />
          <PaywallModal
            onClose={onClosePaywall}
            onUpgrade={onUpgradeToPro}
            loading={upgrading}
            totalModules={lessons.length || 64}
            algoModulesCount={algoModulesCount || 20}
            sysDesignModulesCount={sysDesignModulesCount || 20}
            xpPoints={xpPoints}
            completedCount={totalSolvedCount}
            streakCount={streakCount}
            hasSession={hasSession}
            triggerContext={paywallContext}
            freePreviewLessonTitle={paywallFreePreviewLesson?.title}
            onTryFreePreview={
              paywallFreePreviewLesson
                ? () => {
                    onClosePaywall();
                    onTryFreePreviewLesson(paywallFreePreviewLesson);
                  }
                : undefined
            }
          />
        </View>
      )}

      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <SuccessModal
            xpEarned={
              activeChallengeIdx > 0 &&
              selectedLesson?.practiceChallenges?.[activeChallengeIdx - 1]
                ?.xpReward
                ? selectedLesson.practiceChallenges[activeChallengeIdx - 1]
                    .xpReward!
                : 50
            }
            totalXp={xpPoints}
            streakCount={streakCount}
            lessonId={selectedLesson?.id}
            lessonTitle={
              activeChallengeIdx > 0 &&
              selectedLesson?.practiceChallenges?.[activeChallengeIdx - 1]
                ? `${selectedLesson.title} — ${selectedLesson.practiceChallenges[activeChallengeIdx - 1].title}`
                : selectedLesson?.title || ""
            }
            challengeStepLabel={
              selectedLesson?.practiceChallenges?.length
                ? `STAGE ${activeChallengeIdx + 1} OF ${1 + selectedLesson.practiceChallenges.length} COMPLETE`
                : undefined
            }
            keyTakeaway={
              lessonEnrichment?.realWorldUse || selectedLesson?.description
            }
            nextLessonTitle={
              selectedLesson?.practiceChallenges &&
              activeChallengeIdx < selectedLesson.practiceChallenges.length
                ? `Stage ${activeChallengeIdx + 2}: ${selectedLesson.practiceChallenges[activeChallengeIdx].title}`
                : hasNextLesson
                  ? currentLessons[currentLessonIndex + 1]?.title
                  : undefined
            }
            nextActionLabel={
              selectedLesson?.practiceChallenges &&
              activeChallengeIdx < selectedLesson.practiceChallenges.length
                ? `START PRACTICE STAGE ${activeChallengeIdx + 2} (${selectedLesson.practiceChallenges[activeChallengeIdx].title.toUpperCase()}) →`
                : undefined
            }
            starRating={
              selectedLesson
                ? getLessonStarRating(
                    selectedLesson,
                    completedLessons,
                    completedChallenges,
                    peekedSolutions,
                  )
                : undefined
            }
            hasNextLesson={Boolean(
              (selectedLesson?.practiceChallenges &&
                activeChallengeIdx <
                  selectedLesson.practiceChallenges.length) ||
                hasNextLesson,
            )}
            isGuest={!hasSession}
            totalSolvedCount={totalSolvedCount}
            onSaveProgress={() => {
              onCloseSuccess();
              onOpenAuthPrompt(
                "signup",
                `Save your ${xpPoints} XP and ${totalSolvedCount} solved modules before closing this browser.`,
              );
            }}
            trackCertificateLabel={
              currentLessons.length > 0 &&
              completedCount === currentLessons.length
                ? (TrackThemes[activeTrack] || TrackThemes.python_basics).label
                : undefined
            }
            onViewCertificate={
              currentLessons.length > 0 &&
              completedCount === currentLessons.length
                ? () => {
                    onCloseSuccess();
                    onOpenTrackCertificate(activeTrack);
                  }
                : undefined
            }
            onNextLesson={onNextLesson}
            onClose={onCloseSuccess}
          />
        </View>
      )}

      {showProfileModal && (
        <View style={styles.modalOverlay}>
          <ProfileStatsModal
            xpPoints={xpPoints}
            streakCount={streakCount}
            isPremium={effectiveIsPremium}
            userEmail={userEmail}
            lessons={lessons}
            completedLessons={completedLessons}
            onSelectTrack={onSelectTrack}
            onOpenCertificate={onOpenCertificate}
            onOpenAchievementsTab={onOpenAchievementsTab}
            onToggleDevPro={onToggleDevPro}
            onOpenAuth={() => onOpenAuthPrompt("signin")}
            onClose={onCloseProfile}
          />
        </View>
      )}

      {activeCertificate && (
        <View style={styles.modalOverlay}>
          <CertificateModal
            certificate={activeCertificate}
            onClose={onCloseCertificate}
          />
        </View>
      )}

      {activeStreakMilestone && (
        <View style={styles.modalOverlay}>
          <StreakMilestoneModal
            milestone={activeStreakMilestone}
            streakCount={streakCount}
            xpPoints={xpPoints}
            rankTitle={`L${devRank.level} ${devRank.title}`}
            onClose={onCloseStreakMilestone}
          />
        </View>
      )}
    </>
  );
}
