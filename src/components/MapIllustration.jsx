import React, { useMemo, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MapIllustration = ({
  title,
  coordinates,
  mapboxToken,
  width = 900,
  height = 225, // 4:1 aspect ratio
  mwidth = 950,
  mheight = 275,
  zoom = 5,
  bearing = 0,
  pitch = 0,
}) => {
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
      "rgba(230, 30, 30, 0.75)", // Red
      "rgba(30, 100, 230, 0.75)", // Blue
      "rgba(230, 180, 30, 0.75)", // Yellow/Gold
      "rgba(240, 100, 10, 0.75)", // Orange
      "rgba(30, 150, 120, 0.75)", // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate irregular quadrilateral clip paths
  const generateClipPath = (index, total) => {
    const edgeEmphasis = index % 4;
    const overlap = 15 + Math.random() * 10;

    let topLeft, topRight, bottomRight, bottomLeft;

    switch (edgeEmphasis) {
      case 0: // Top
        topLeft = { x: 5 + Math.random() * 10, y: -overlap };
        topRight = {
          x: 90 - Math.random() * 10,
          y: -overlap + Math.random() * 5,
        };
        bottomRight = { x: 95 - Math.random() * 10, y: 90 + Math.random() * 5 };
        bottomLeft = { x: 5 + Math.random() * 10, y: 90 + Math.random() * 5 };
        break;
      case 1: // Right
        topLeft = { x: 10 + Math.random() * 10, y: 5 + Math.random() * 10 };
        topRight = { x: 100 + overlap, y: 5 + Math.random() * 10 };
        bottomRight = { x: 100 + overlap, y: 90 - Math.random() * 10 };
        bottomLeft = { x: 10 + Math.random() * 10, y: 95 - Math.random() * 10 };
        break;
      case 2: // Bottom
        topLeft = { x: 5 + Math.random() * 10, y: 10 + Math.random() * 10 };
        topRight = { x: 95 - Math.random() * 10, y: 5 + Math.random() * 10 };
        bottomRight = { x: 90 - Math.random() * 10, y: 100 + overlap };
        bottomLeft = { x: 10 + Math.random() * 10, y: 100 + overlap };
        break;
      case 3: // Left
        topLeft = { x: -overlap, y: 5 + Math.random() * 10 };
        topRight = { x: 90 - Math.random() * 10, y: 10 + Math.random() * 10 };
        bottomRight = {
          x: 95 - Math.random() * 10,
          y: 90 - Math.random() * 10,
        };
        bottomLeft = { x: -overlap, y: 90 - Math.random() * 10 };
        break;
    }

    return `polygon(
      ${topLeft.x}% ${topLeft.y}%, 
      ${topRight.x}% ${topRight.y}%, 
      ${bottomRight.x}% ${bottomRight.y}%, 
      ${bottomLeft.x}% ${bottomLeft.y}%
    )`;
  };

  // Function to generate a guilloche pattern
  const generateGuillochePattern = () => {
    const lines = [];
    const numLines = 20; // Number of lines in the pattern
    const amplitude = height / 4; // Amplitude of the wave
    const frequency = 10; // Increase frequency for more curves

    for (let i = 0; i < numLines; i++) {
      const offset = (i / numLines) * Math.PI * 2; // Offset for each line
      const pathData = Array.from({ length: frequency + 1 }, (_, j) => {
        const x = (j / frequency) * width;
        const y =
          amplitude * Math.sin((j / frequency) * Math.PI * 2 + offset) +
          (i * height) / numLines;
        return `${x},${y}`;
      }).join(" L ");

      lines.push(
        `M0,${(i * height) / numLines} L ${pathData} L ${width},${(i * height) / numLines}`
      );
    }

    return lines;
  };

  // Set up the layers (1 base map layer + 5 letter layers + 1 guilloche pattern layer)
  const totalLayers = 7;
  const parallaxValues = useMemo(() => {
    return Array.from({ length: totalLayers }, (_, i) =>
      createParallaxValue(i, totalLayers)
    );
  }, [scrollYProgress]);

  // Get characters from the title for the letter layers
  const letterLayers = useMemo(() => {
    const chars = title.replace(/\s+/g, "").slice(0, 5).toUpperCase().split("");

    // Randomly select one layer to display the full title
    const fullTitleLayerIndex = Math.floor(Math.random() * chars.length);

    return chars.map((char, index) => {
      const makeReadable = index % 2 === 0;

      const scale = makeReadable
        ? 0.75 + Math.random() * 0.45
        : 2 + Math.random() * 2;

      const x = width * (0.2 + Math.random() * 0.6);
      const y = height * (0.3 + Math.random() * 0.4);

      return {
        char: index === fullTitleLayerIndex ? title.toUpperCase() : char,
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
  }, [title, width, height]);

  // Create the static map URL
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}`;

  // Base layer clip path
  const baseClipPath = useMemo(() => generateClipPath(0, totalLayers), []);

  // Randomize the position of the guilloche pattern layer
  const guillochePatternLayerIndex =
    Math.floor(Math.random() * (totalLayers - 1)) + 1;

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{
        aspectRatio: "4/1",
        margin: "0", // Remove margin completely
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
        <div className="absolute inset-0 bg-[#f5e6d3] opacity-90"></div>
        <motion.img
          src={mapUrl}
          alt="Map"
          className="w-full h-full object-cover filter grayscale contrast-110 opacity-60 mix-blend-multiply"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5 }}
        />
      </motion.div>

      {/* Letter layers */}
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
            viewBox={`0 0 ${width} ${height}`} // now will this work?
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation})`}
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
                {layer.char}
              </text>
            </g>
          </svg>
        </motion.div>
      ))}

      {/* Guilloche pattern layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: parallaxValues[guillochePatternLayerIndex],
          clipPath: generateClipPath(guillochePatternLayerIndex, totalLayers),
          zIndex: guillochePatternLayerIndex + 2,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }} // 50% opacity
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {generateGuillochePattern().map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="white"
              strokeWidth="1"
              fill="none"
              vectorEffect="non-scaling-stroke" // Ensures lines scale with the SVG
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
};

export default MapIllustration;
