import React, { useMemo, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TypewriterEffect from "./TypewriterEffect";

const HeaderIllustration = ({ mapboxToken }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Create different parallax rates for each layer
  const createParallaxValue = (index, total) => {
    const baseSpeed = -10; // Adjusted to reduce negative translateY
    const speedFactor = 1 + (index / total) * 1.5;
    return useTransform(scrollYProgress, [0, 1], [0, baseSpeed * speedFactor]);
  };

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

  // Random coordinates
  const generateRandomCoordinates = () => {
    // Generate random latitude (-90 to 90) and longitude (-180 to 180)
    const lat = Math.random() * 180 - 90;
    const lng = Math.random() * 360 - 180;
    return [lat, lng];
  };

  const coordinates = useMemo(() => generateRandomCoordinates(), []);

  // Set up the layers and dimensions
  const width = 750;
  const height = 230; // Reduced height
  const mwidth = 850;
  const mheight = 330; // Adjusted to maintain aspect ratio
  const zoom = 3;
  const bearing = 0;
  const pitch = 0;

  // Set up the layers (1 base map layer + text layers)
  const totalLayers = 3;
  const parallaxValues = useMemo(() => {
    return Array.from({ length: totalLayers }, (_, i) =>
      createParallaxValue(i, totalLayers)
    );
  }, [scrollYProgress]);

  // Use the p element content for the colored type layers
  const sourceText =
    "I've been thinking a lot about and experimenting a lot with the uses of AI Large Language models work in the principle of a predicting the next element in sequence of tokens of words and fragments given what came before what comes next";

  // Create refs for blur states
  const blurRefs = useRef([]).current;
  while (blurRefs.length < 5) {
    blurRefs.push(React.createRef());
  }

  // Cycle blur animation
  useEffect(() => {
    // Preload the map image
    const img = new Image();
    img.src = mapUrl;

    // Start with all layers blurred
    blurRefs.forEach(ref => {
      if (ref.current) {
        ref.current.style.filter = "blur(100px)";
      }
    });

    // Create animations for each layer with staggered delays
    blurRefs.forEach((ref, index) => {
      const cycleTime = 1 + Math.random() * 2; // Between 5-10 seconds
      const delay = index * 1.5; // Stagger the starts

      const animate = () => {
        if (!ref.current) return;

        // Fade in (become focused)
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.transition = "filter 1.5s ease-in-out";
            ref.current.style.filter = "blur(0px)";
          }
        }, delay * 1000);

        // Stay focused for a moment
        setTimeout(
          () => {
            if (ref.current) {
              ref.current.style.transition = "filter 1.5s ease-in-out";
              ref.current.style.filter = "blur(15px)";
            }
          },
          (delay + cycleTime * 0.3) * 1000
        );

        // Repeat the animation
        setTimeout(() => animate(), cycleTime * 1000);
      };

      // Start the animation loop
      animate();
    });
  }, []);

  // Get characters from the source text for the letter layers
  const letterLayers = useMemo(() => {
    const words = sourceText.replace(/\s+/g, " ").split(" ");
    const selectedWords = [];

    // Select 5 random words for our layers
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }

    // Randomly select one layer to display a longer phrase
    const fullPhraseLayerIndex = Math.floor(
      Math.random() * selectedWords.length
    );
    const randomPhraseStart = Math.floor(Math.random() * (words.length - 3));
    const fullPhrase = words
      .slice(randomPhraseStart, randomPhraseStart + 3)
      .join(" ");

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
        delay: 0.2 + index * 0.15,
      };
    });
  }, [width, height]);

  // Create the static map URL with mapbox token from props - with eager loading
  const mapUrl = useMemo(() => {
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}`;
  }, [coordinates, zoom, bearing, pitch, mwidth, mheight, mapboxToken]);

  // Base layer clip path
  const baseClipPath = useMemo(() => generateClipPath(0, totalLayers), []);

  // Define typewriter sequences with corrections/edits
  const typewriterSequences = [
    { text: "What Comes Before", delayAfter: 300, deleteChars: 6 },
    { text: "What Comes Soon", delayAfter: 600, deleteChars: 4 },
    { text: "What Comes Now", delayAfter: 600, deleteChars: 3 },
    { text: "What Comes Next", delayAfter: 1000 },
  ];

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{
        width: "100%",
        height: "230px",
        maxWidth: "750px",
        margin: "6em auto 16em auto",
        padding: "3em auto 3em auto",
      }}
    >
      {/* Base map layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: parallaxValues[0],
          clipPath: baseClipPath,
          zIndex: 1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute inset-0 bg-[#f5e6d3] opacity-75"></div>
        <motion.img
          src={mapUrl}
          alt="Map"
          loading="eager"
          className="w-full h-full object-cover filter grayscale contrast-150 opacity-10 brightness-200 mix-blend-hard-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.5 }}
        />
      </motion.div>

      {/* Text layers */}
      {letterLayers.map((layer, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            y: parallaxValues[index + 1],
            clipPath: layer.clipPath,
            zIndex: index + 2,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: layer.delay }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              ref={blurRefs[index]}
              transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation})`}
              style={{
                filter: "blur(15px)",
                transition: "filter 1.5s ease-in-out",
              }}
            >
              <text
                style={{
                  fill: layer.color,
                  fontSize: `${350 * layer.scale}px`,
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
        </motion.div>
      ))}

      {/* H1 Layer with Typewriter Effect */}
      <div className="absolute bottom-0 left-0 p-6 my-3 z-10">
        <h1 className="text-white mx-3 p-0 flex text-3xl! items-center drop-shadow-xl">
          <TypewriterEffect
            sequences={typewriterSequences}
            className="text-white"
          />
        </h1>
      </div>
    </div>
  );
};

export default HeaderIllustration;
