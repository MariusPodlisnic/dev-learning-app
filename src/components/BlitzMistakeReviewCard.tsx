import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./StudioIcon";
import { type BlitzCardItem } from "../constants/curriculumData/syntaxBlitzCards";
import { formatBlitzDeckLabel } from "../utils/arenaReplayability";
import { playKeyClick } from "../utils/soundEffects";
import { type SyntaxBlitzStyles } from "./syntaxBlitzStyles";

interface BlitzMistakeReviewCardProps {
  cards: BlitzCardItem[];
  styles: SyntaxBlitzStyles;
  onDismissCard: (cardId: string) => void;
  onClearAll: () => void;
  onBackToLobby: () => void;
}

export default function BlitzMistakeReviewCard({
  cards,
  styles,
  onDismissCard,
  onClearAll,
  onBackToLobby,
}: BlitzMistakeReviewCardProps) {
  return (
    <View style={styles.lobbyCard}>
      <View style={styles.mistakeStudyHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.mistakeStudyTitle}>
            📖 MISTAKE REVIEW &amp; EXPLANATIONS ({cards.length})
          </Text>
          <Text style={styles.mistakeStudySub}>
            No timer — read through the exact answer and explanation for each
            card you missed, then clear them when ready.
          </Text>
        </View>
        {cards.length > 0 && (
          <Pressable style={styles.clearAllMistakesBtn} onPress={onClearAll}>
            <Text style={styles.clearAllMistakesText}>
              ✓ CLEAR ALL ({cards.length})
            </Text>
          </Pressable>
        )}
      </View>

      {cards.length === 0 ? (
        <View style={styles.emptyMistakeStudyBox}>
          <Text style={styles.emptyMistakeStudyTitle}>
            ✓ ALL CAUGHT UP — ZERO MISTAKES QUEUED
          </Text>
          <Text style={styles.emptyMistakeStudyDesc}>
            Any wrong pick during Standard or Daily Seed Blitz is saved here
            with its full solution and explanation.
          </Text>
          <Pressable
            style={styles.startBlitzBtn}
            onPress={() => {
              playKeyClick();
              onBackToLobby();
            }}
          >
            <Text style={styles.startBlitzBtnText}>
              ← BACK TO 60s BLITZ LOBBY
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.mistakeCardsList}>
          {cards.map((card, idx) => {
            const correctToken = card.options[card.correctIndex];
            const solvedSnippet = card.codeTemplate.replace(
              "[ ___ ]",
              correctToken,
            );
            return (
              <View key={card.id} style={styles.mistakeStudyCard}>
                <View style={styles.mistakeCardTop}>
                  <View style={styles.topicTagPill}>
                    <Text style={styles.topicTagText}>
                      #{idx + 1} · {formatBlitzDeckLabel(card.deck)} ·{" "}
                      {card.tag}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.dismissMistakeBtn}
                    onPress={() => onDismissCard(card.id)}
                  >
                    <Text style={styles.dismissMistakeText}>
                      ✓ MARK READ &amp; REMOVE
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.mistakeCardPrompt}>{card.prompt}</Text>

                <View style={styles.codeTerminalBox}>
                  <Text style={styles.codeTerminalText}>{solvedSnippet}</Text>
                </View>

                <View style={styles.mistakeAnswerBox}>
                  <Text style={styles.mistakeAnswerLabel}>
                    ✓ CORRECT TOKEN: {correctToken}
                  </Text>
                  <Text style={styles.mistakeAnswerExplain}>
                    {card.explanation}
                  </Text>
                </View>
              </View>
            );
          })}

          <Pressable
            style={({ pressed }) => [
              styles.startBlitzBtn,
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
            onPress={onClearAll}
          >
            <Text style={styles.startBlitzBtnText}>
              ✓ I READ EVERYTHING — EMPTY MISTAKE LIST →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
