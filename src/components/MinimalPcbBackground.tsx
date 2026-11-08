import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { StudioColors } from "../constants/theme";

/**
 * Minimalist PCB & Contour Margin Frame (Option #4).
 * Renders subtle, low-opacity geometric circuit traces and circular node vias (○)
 * strictly along the far left and right outer margins, keeping the central canvas
 * 100% clean and distraction-free.
 */
export default function MinimalPcbBackground() {
  const { width } = useWindowDimensions();
  const isCompact = width > 0 && width < 960;

  return (
    <View
      style={[styles.overlay, isCompact && styles.overlayCompact]}
      pointerEvents="none"
    >
      {/* Left Outer Margin PCB Traces */}
      <View style={styles.leftRail}>
        {/* Trace 1: Outer long vertical bus with top & bottom vias */}
        <View style={[styles.vLine, { left: 22, top: 48, height: 260 }]} />
        <View style={[styles.viaNode, { left: 18.5, top: 42 }]} />
        <View
          style={[
            styles.diagSegmentDownRight,
            { left: 22, top: 306, width: 26 },
          ]}
        />
        <View style={[styles.vLine, { left: 40, top: 324, height: 180 }]} />
        <View style={[styles.viaNode, { left: 36.5, top: 504 }]} />

        {/* Trace 2: Inner secondary trace with elbow */}
        <View style={[styles.vLine, { left: 54, top: 96, height: 130 }]} />
        <View style={[styles.viaNode, { left: 50.5, top: 90 }]} />
        <View
          style={[
            styles.diagSegmentDownRight,
            { left: 54, top: 224, width: 22 },
          ]}
        />
        <View style={[styles.vLine, { left: 70, top: 240, height: 95 }]} />
        <View style={[styles.viaNode, { left: 66.5, top: 335 }]} />

        {/* Trace 3: Lower margin trace */}
        <View style={[styles.vLine, { left: 24, top: 560, height: 150 }]} />
        <View style={[styles.viaNode, { left: 20.5, top: 554 }]} />
        <View style={[styles.viaNode, { left: 20.5, top: 710 }]} />
      </View>

      {/* Right Outer Margin PCB Traces (Mirrored) */}
      <View style={styles.rightRail}>
        {/* Trace 1: Outer long vertical bus with top & bottom vias */}
        <View style={[styles.vLine, { right: 22, top: 48, height: 260 }]} />
        <View style={[styles.viaNode, { right: 18.5, top: 42 }]} />
        <View
          style={[
            styles.diagSegmentDownLeft,
            { right: 22, top: 306, width: 26 },
          ]}
        />
        <View style={[styles.vLine, { right: 40, top: 324, height: 180 }]} />
        <View style={[styles.viaNode, { right: 36.5, top: 504 }]} />

        {/* Trace 2: Inner secondary trace with elbow */}
        <View style={[styles.vLine, { right: 54, top: 96, height: 130 }]} />
        <View style={[styles.viaNode, { right: 50.5, top: 90 }]} />
        <View
          style={[
            styles.diagSegmentDownLeft,
            { right: 54, top: 224, width: 22 },
          ]}
        />
        <View style={[styles.vLine, { right: 70, top: 240, height: 95 }]} />
        <View style={[styles.viaNode, { right: 66.5, top: 335 }]} />

        {/* Trace 3: Lower margin trace */}
        <View style={[styles.vLine, { right: 24, top: 560, height: 150 }]} />
        <View style={[styles.viaNode, { right: 20.5, top: 554 }]} />
        <View style={[styles.viaNode, { right: 20.5, top: 710 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.65,
  },
  overlayCompact: {
    opacity: 0.25,
  },
  leftRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 110,
  },
  rightRail: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 110,
  },
  vLine: {
    position: "absolute",
    width: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    borderRadius: 1,
  },
  diagSegmentDownRight: {
    position: "absolute",
    height: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    transform: [{ rotate: "45deg" }],
    transformOrigin: "left center",
  },
  diagSegmentDownLeft: {
    position: "absolute",
    height: 1.5,
    backgroundColor: StudioColors.borderSubtle,
    transform: [{ rotate: "-45deg" }],
    transformOrigin: "right center",
  },
  viaNode: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: StudioColors.borderSubtle,
    backgroundColor: StudioColors.bg,
  },
});
