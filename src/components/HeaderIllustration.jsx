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

  // Define top 20 urban areas globally with their center coordinates
  const topUrbanAreas = useMemo(
    () => [
      { name: "Tokyo", coords: [35.6762, 139.6503] },
      { name: "Delhi", coords: [28.7041, 77.1025] },
      { name: "Shanghai", coords: [31.2304, 121.4737] },
      { name: "São Paulo", coords: [-23.5505, -46.6333] },
      { name: "Mexico City", coords: [19.4326, -99.1332] },
      { name: "Cairo", coords: [30.0444, 31.2357] },
      { name: "Mumbai", coords: [19.076, 72.8777] },
      { name: "Beijing", coords: [39.9042, 116.4074] },
      { name: "Dhaka", coords: [23.8103, 90.4125] },
      { name: "Osaka", coords: [34.6937, 135.5022] },
      { name: "New York", coords: [40.7128, -74.006] },
      { name: "Karachi", coords: [24.8607, 67.0011] },
      { name: "Buenos Aires", coords: [-34.6037, -58.3816] },
      { name: "Chongqing", coords: [29.4316, 106.9123] },
      { name: "Istanbul", coords: [41.0082, 28.9784] },
      { name: "Kolkata", coords: [22.5726, 88.3639] },
      { name: "Manila", coords: [14.5995, 120.9842] },
      { name: "Lagos", coords: [6.5244, 3.3792] },
      { name: "Rio de Janeiro", coords: [-22.9068, -43.1729] },
      { name: "Tianjin", coords: [39.3434, 117.3616] },
      { name: "London", coords: [51.5074, -0.1278] },
      { name: "Paris", coords: [48.8566, 2.3522] },
    ],
    []
  );

  // Generate random coordinates from one of the top urban areas with slight variation
  const generateRandomCoordinates = () => {
    // Select a random urban area
    const randomCity =
      topUrbanAreas[Math.floor(Math.random() * topUrbanAreas.length)];

    // Add slight variation (up to ~0.5 mile in any direction)
    // 0.007 degrees is approximately 0.5 miles at the equator
    const variation = 0.007;
    const latVariation = (Math.random() * 2 - 1) * variation;
    const lngVariation = (Math.random() * 2 - 1) * variation;

    return [
      randomCity.coords[0] + latVariation,
      randomCity.coords[1] + lngVariation,
    ];
  };

  const coordinates = useMemo(
    () => generateRandomCoordinates(),
    [topUrbanAreas]
  );

  // Set up the layers and dimensions
  const width = 750;
  const height = 230; // Reduced height
  const mwidth = 850;
  const mheight = 330; // Adjusted to maintain aspect ratio
  const zoom = 15; // Higher zoom to see individual buildings
  const bearing = 0;
  const pitch = 0;

  // Set up the layers (1 base map layer + text layers)
  const totalLayers = 6;
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
    for (let i = 0; i < 3; i++) {
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

  // Define potential typewriter sequences
  const potentialSequences = useMemo(
    () => [
      { text: "What Comes Before", delayAfter: 600, deleteChars: 6 },
      { text: "What Comes Soon", delayAfter: 700, deleteChars: 4 },
      { text: "What Comes Now", delayAfter: 800, deleteChars: 3 },
      { text: "What Comes First", delayAfter: 500, deleteChars: 5 },
      { text: "What Comes After", delayAfter: 400, deleteChars: 5 },
      { text: "What Comes Together", delayAfter: 350, deleteChars: 8 },
      { text: "What Comes Around", delayAfter: 450, deleteChars: 6 },
      { text: "What Comes Back", delayAfter: 550, deleteChars: 4 },
      { text: "What Comes Up", delayAfter: 500, deleteChars: 2 },
      { text: "What Comes Down", delayAfter: 400, deleteChars: 4 },
      { text: "What Comes Through", delayAfter: 550, deleteChars: 7 },
    ],
    []
  );

  // Randomly select 3 sequences from the potential options and add the final "Next" sequence
  const typewriterSequences = useMemo(() => {
    const shuffled = [...potentialSequences].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    // Add the final sequence that always remains the same
    selected.push({ text: "What Comes Next", delayAfter: 1000 });
    return selected;
  }, [potentialSequences]);

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{
        width: "100%",
        height: "230px",
        maxWidth: "750px",
        margin: "1.5em auto 1.5em auto",
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
        <div className="absolute inset-0 bg-[#5d3b10] opacity-75"></div>
        <motion.img
          src={mapUrl}
          alt="Map"
          loading="eager"
          className="w-full h-full object-cover filter grayscale opacity-10 mix-blend-hard-light"
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
        <h1 className="text-white mx-2 p-0 flex items-center drop-shadow-xl">
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
