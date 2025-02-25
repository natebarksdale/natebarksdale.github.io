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
    // Base parallax value increases for each layer (higher layers move faster)
    const baseSpeed = -50;
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
    // Make each layer's clip path slightly different
    const variation = 5 + index * 2;

    // Create irregular quadrilateral by varying each point
    const topLeft = {
      x: variation + Math.random() * 5,
      y: variation + Math.random() * 5,
    };
    const topRight = {
      x: 100 - variation - Math.random() * 5,
      y: variation + Math.random() * 5,
    };
    const bottomRight = {
      x: 100 - variation - Math.random() * 5,
      y: 100 - variation - Math.random() * 5,
    };
    const bottomLeft = {
      x: variation + Math.random() * 5,
      y: 100 - variation - Math.random() * 5,
    };

    // Create clip path
    return `polygon(
      ${topLeft.x}% ${topLeft.y}%, 
      ${topRight.x}% ${topRight.y}%, 
      ${bottomRight.x}% ${bottomRight.y}%, 
      ${bottomLeft.x}% ${bottomLeft.y}%
    )`;
  };

  // Set up the layers (1 base map layer + 5 letter layers)
  const totalLayers = 6;
  const parallaxValues = useMemo(() => {
    return Array.from({ length: totalLayers }, (_, i) =>
      createParallaxValue(i, totalLayers)
    );
  }, [scrollYProgress]);

  // Get characters from the title for the letter layers
  const letterLayers = useMemo(() => {
    // Get up to 5 characters from the title for our layers
    const chars = title.replace(/\s+/g, "").slice(0, 5).toUpperCase().split("");

    return chars.map((char, index) => ({
      char,
      clipPath: generateClipPath(index + 1, totalLayers),
      color: getMidCenturyColor(),
      scale: 1.5 + index * 0.5 + Math.random() * 2, // Range from 1.5 to ~6x
      rotation:
        Math.random() < 0.5 ? Math.random() * 5 : 90 + Math.random() * 5,
      x: width * (0.2 + Math.random() * 0.6), // Position throughout middle 60% of width
      y: height * (0.3 + Math.random() * 0.4), // Position throughout middle 40% of height
      delay: 0.2 + index * 0.15, // Staggered animation delay
    }));
  }, [title, width, height]);

  // Create the static map URL
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}`;

  // Base layer clip path is slightly larger than the others
  const baseClipPath = useMemo(() => generateClipPath(0, totalLayers), []);

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ aspectRatio: "4/1", margin: "1em 0" }}
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
            viewBox={`0 0 ${width} ${height}`}
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
    </div>
  );
};

export default MapIllustration;
