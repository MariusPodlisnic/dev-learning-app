import { useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import type { Metadata } from "expo-router/server";
import React, { useEffect } from "react";
import ShowcaseLandingScreen from "../components/ShowcaseLandingScreen";
import { captureLandingAttribution } from "../utils/attribution";

export function generateMetadata(): Metadata {
  return {
    title: "Devy — Code Like It's an Adventure | Interactive Coding Studio",
    description:
      "Write live Python 3.11 in your browser, visualize 8 algorithm engines, play 6 coding mini-games, and master Algorithms & System Design.",
    openGraph: {
      title: "Devy — Code Like It's an Adventure",
      description:
        "Master Python, Algorithms & System Design with browser-based code execution, 3D interactive labs, and 6 retro arcade cartridges.",
      type: "website",
      images: ["/og-preview.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Devy — Code Like It's an Adventure",
      description:
        "Interactive coding studio with live Python 3.11, visual algorithm labs, and 6 cozy coding mini-games.",
      images: ["/og-preview.jpg"],
    },
  };
}

export default function ExploreScreen() {
  const searchParams = useLocalSearchParams<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    ref?: string;
  }>();

  const {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    ref: refCode,
  } = searchParams;

  useEffect(() => {
    captureLandingAttribution({
      path: "/explore",
      searchParams: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        ref: refCode,
      },
      milestone: "landed_explore",
    });
  }, [utm_source, utm_medium, utm_campaign, utm_content, utm_term, refCode]);

  const pageTitle = "Devy — Code Like It's an Adventure | Interactive Coding Studio";
  const pageDesc =
    "Write live Python 3.11 in your browser, visualize 8 algorithm engines, play 6 coding mini-games, and master Algorithms & System Design.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content="/og-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Head>

      <ShowcaseLandingScreen />
    </>
  );
}
