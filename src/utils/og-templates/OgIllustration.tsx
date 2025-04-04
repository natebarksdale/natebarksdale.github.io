import React from "react";

const OgIllustration = ({ title, width = 1200, height = 630 }) => {
  // Colors for our mid-century modern palette
  const getMidCenturyColor = () => {
    const colors = [
      "rgba(230, 30, 30, 0.50)", // Red
      "rgba(30, 100, 230, 0.50)", // Blue
      "rgba(230, 180, 30, 0.50)", // Yellow/Gold
      "rgba(240, 100, 10, 0.50)", // Orange
      "rgba(30, 150, 120, 0.50)", // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate more rectangular clip paths with slight variations
  const generateClipPath = (index, total) => {
    // Reduced randomness for more rectangular shapes
    const edgeEmphasis = index % 4;
    const overlap = 8 + Math.random() * 5; // Reduced overlap
    const variation = 5; // Reduced variation for more rectangular shapes

    let topLeft, topRight, bottomRight, bottomLeft;

    switch (edgeEmphasis) {
      case 0: // Top - slightly irregular rectangle
        topLeft = { x: 0, y: -overlap };
        topRight = { x: 100, y: -overlap + Math.random() * variation };
        bottomRight = { x: 100 - Math.random() * variation, y: 100 };
        bottomLeft = { x: Math.random() * variation, y: 100 };
        break;
      case 1: // Right - slightly irregular rectangle
        topLeft = { x: 0, y: 0 };
        topRight = { x: 100 + overlap, y: 0 };
        bottomRight = { x: 100 + overlap, y: 100 };
        bottomLeft = { x: 0, y: 100 - Math.random() * variation };
        break;
      case 2: // Bottom - slightly irregular rectangle
        topLeft = { x: Math.random() * variation, y: 0 };
        topRight = { x: 100 - Math.random() * variation, y: 0 };
        bottomRight = { x: 100, y: 100 + overlap };
        bottomLeft = { x: 0, y: 100 + overlap };
        break;
      case 3: // Left - slightly irregular rectangle
        topLeft = { x: -overlap, y: Math.random() * variation };
        topRight = { x: 100, y: 0 };
        bottomRight = { x: 100, y: 100 };
        bottomLeft = { x: -overlap, y: 100 - Math.random() * variation };
        break;
    }

    return `polygon(
      ${topLeft.x}% ${topLeft.y}%, 
      ${topRight.x}% ${topRight.y}%, 
      ${bottomRight.x}% ${bottomRight.y}%, 
      ${bottomLeft.x}% ${bottomLeft.y}%
    )`;
  };

  // Set up the layers and dimensions
  const totalLayers = 5;

  // Base layer clip path
  const baseClipPath = generateClipPath(0, totalLayers);

  // Get words from the title for the letter layers
  const letterLayers = (() => {
    // Use words from the title for the layers
    const words = title
      ? title.replace(/\s+/g, " ").split(" ")
      : ["What", "Comes", "Next"];
    const selectedWords = [];

    // Select up to 5 words for our layers, or use all words if fewer than 5
    const wordCount = Math.min(words.length, 5);

    for (let i = 0; i < wordCount; i++) {
      if (words[i] && words[i].length > 2) {
        // Only use words longer than 2 characters
        selectedWords.push(words[i]);
      }
    }

    // If we don't have enough words, pad with defaults
    while (selectedWords.length < 5) {
      selectedWords.push(
        ["What", "Comes", "Next", "Design", "Writing"][selectedWords.length % 5]
      );
    }

    // Randomly select one layer to display a longer phrase
    const fullPhraseLayerIndex = Math.floor(
      Math.random() * selectedWords.length
    );
    let fullPhrase = title || "Nate Barksdale Writing + Design";
    if (fullPhrase.length > 20) {
      fullPhrase = fullPhrase.substring(0, 20) + "...";
    }

    return selectedWords.map((word, index) => {
      const makeReadable = index % 2 === 0;

      const scale = makeReadable
        ? 0.75 + Math.random() * 0.45
        : 2 + Math.random() * 2;

      const x = width * (0.2 + Math.random() * 0.6);
      const y = height * (0.3 + Math.random() * 0.4);

      return {
        text:
          index === fullPhraseLayerIndex
            ? fullPhrase.toUpperCase()
            : word.toUpperCase(),
        clipPath: generateClipPath(index + 1, totalLayers),
        color: getMidCenturyColor(),
        scale,
        rotation: makeReadable
          ? Math.random() * 5 - 2.5
          : Math.random() < 0.5
            ? Math.random() * 5
            : 90 + Math.random() * 5,
        x,
        y,
      };
    });
  })();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Base layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: baseClipPath,
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#f5e6d3",
            opacity: 0.75,
          }}
        />
      </div>

      {/* Text layers */}
      {letterLayers.map((layer, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            inset: 0,
            clipPath: layer.clipPath,
            zIndex: index + 2,
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation})`}
              style={{
                filter: "blur(15px)",
              }}
            >
              <text
                style={{
                  fill: layer.color,
                  fontSize: `${Math.min(width, height) * 0.3 * layer.scale}px`,
                  fontFamily: "Faune",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  opacity: 0.9,
                  transformOrigin: "center",
                }}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {layer.text}
              </text>
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default OgIllustration;
