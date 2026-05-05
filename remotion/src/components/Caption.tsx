import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface Props {
  palette: { text: string; accent: string; accentRgb: string };
  caption: string;
  progress: number;
  fps: number;
}

const FONT_SIZE = 42;

export const Caption: React.FC<Props> = ({ palette, caption, progress, fps }) => {
  const frame = useCurrentFrame();

  // Typewriter effect — reveal text progressively
  const typeRevealProgress = Math.min(progress * 2.4, 1);
  const visibleChars = Math.floor(caption.length * typeRevealProgress);

  // Word-level reveal (smoother than char-by-char)
  const words = caption.split(" ");
  let charCount = 0;
  let wordIndex = 0;
  for (let i = 0; i < words.length; i++) {
    charCount += words[i].length + 1; // +1 for space
    if (charCount > visibleChars) {
      wordIndex = i;
      break;
    }
    wordIndex = i + 1;
  }

  const visibleWords = words.slice(0, wordIndex);
  const nextWordPartial = wordIndex < words.length && visibleChars > charCount - words[wordIndex].length - 1;

  // Wrap into lines
  const containerWidth = 680; // max text width
  const lines: string[] = [];
  let currentLine = "";

  for (const word of visibleWords) {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (estimateWidth(testLine) > containerWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Add partial next word if mid-type
  if (nextWordPartial) {
    const partialChars = visibleChars - (visibleWords.join(" ").length + 1);
    const partialWord = words[wordIndex]?.slice(0, Math.max(0, partialChars));
    if (partialWord) {
      const lastLine = lines[lines.length - 1];
      const testLine = lastLine + " " + partialWord;
      if (estimateWidth(testLine) > containerWidth) {
        lines.push(partialWord);
      } else {
        lines[lines.length - 1] = testLine;
      }
    }
  }

  // Entrance for each line
  const lineDelay = 5; // frames between line reveals

  return (
    <div
      style={{
        position: "absolute",
        top: "42%",
        left: "50%",
        transform: "translateX(-50%)",
        width: containerWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "0 20px",
      }}
    >
      {lines.map((line, i) => {
        const lineEntrance = spring({
          frame: frame - i * lineDelay,
          fps,
          config: { damping: 20, stiffness: 100 },
          from: 0,
          to: 1,
          durationInFrames: 8,
        });

        const isLastLine = i === lines.length - 1;
        const isStillTyping = isLastLine && nextWordPartial;

        return (
          <div
            key={i}
            style={{
              fontSize: FONT_SIZE,
              fontWeight: 700,
              fontFamily: "'Geist', 'Inter', sans-serif",
              color: palette.text,
              textAlign: "center",
              lineHeight: 1.3,
              textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.8)",
              letterSpacing: "-0.02em",
              opacity: lineEntrance,
              transform: `translateY(${(1 - lineEntrance) * 12}px)`,
            }}
          >
            {line}
            {isStillTyping && (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: FONT_SIZE * 0.8,
                  backgroundColor: palette.accent,
                  marginLeft: 3,
                  verticalAlign: "text-bottom",
                  opacity: Math.sin(frame * 0.5) > 0 ? 1 : 0,
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Rough width estimator (no Canvas in headless rendering)
function estimateWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    if (char === " " || char === "." || char === ",") {
      width += 12;
    } else if (char === "i" || char === "l" || char === "I" || char === "!") {
      width += 14;
    } else if (char === "w" || char === "m" || char === "W" || char === "M") {
      width += 28;
    } else {
      width += 22;
    }
  }
  return width;
}
