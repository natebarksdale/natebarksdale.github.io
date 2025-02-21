import React, { useMemo, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MapIllustration = ({
  title,
  coordinates,
  mapboxToken,
  width = 900,
  height = 300,
  mwidth = 950,
  mheight = 350,
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
  const mapParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const letterParallax = useMemo(() => {
    const letters = title.replace(/\s+/g, "").slice(0, 5).toUpperCase();
    return letters
      .split("")
      .map(() =>
        useTransform(scrollYProgress, [0, 1], [0, -80 - Math.random() * 40])
      );
  }, [scrollYProgress, title]);

  // Generate irregular polygon clips for each layer
  const generateClipPath = () => {
    const jitter = 5; // Amount of randomness in pixels
    return `polygon(
      ${Math.random() * jitter}% ${Math.random() * jitter}%, 
      ${100 - Math.random() * jitter}% ${Math.random() * jitter}%, 
      ${100 - Math.random() * jitter}% ${100 - Math.random() * jitter}%, 
      ${Math.random() * jitter}% ${100 - Math.random() * jitter}%
    )`;
  };

  function getMidCenturyColor() {
    const colors = [
      "rgba(230, 30, 30, 0.85)", // Red matching theme
      "rgba(30, 100, 230, 0.85)", // Blue
      "rgba(230, 180, 30, 0.85)", // Yellow
      "rgba(255, 255, 255, 0.85)", // White
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const letterPositions = useMemo(() => {
    const letters = title.replace(/\s+/g, "").slice(0, 5).toUpperCase();
    return letters.split("").map((letter, index) => ({
      letter,
      x: Math.random() * width * 0.9 + width * 0.05,
      y: height * 0.85 + (Math.random() * height * 0.4 - height * 0.2),
      rotation:
        Math.random() < 0.5 ? -2 + Math.random() * 4 : 88 + Math.random() * 4,
      color: getMidCenturyColor(),
      scale: 1.5 + Math.random() * 2.5,
      clipPath: generateClipPath(),
    }));
  }, [title, width, height]);

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}`;

  return (
    <div ref={ref} className="relative w-full aspect-[3/1] overflow-visible">
      <motion.div
        className="absolute inset-0"
        style={{
          y: mapParallax,
          clipPath: generateClipPath(),
          marginTop: "2rem",
          zIndex: 1,
        }}
      >
        <div className="absolute inset-0 bg-[#f5e6d3] opacity-90"></div>
        <motion.img
          src={mapUrl}
          alt="Map"
          className="w-full h-full object-cover filter grayscale contrast-90 opacity-30 mix-blend-multiply"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        />
      </motion.div>

      {letterPositions.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            y: letterParallax[index],
            zIndex: index + 2,
            clipPath: pos.clipPath,
            marginTop: `${4 + Math.random() * 10}rem`,
          }}
        >
          <motion.svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <motion.g
              transform={`translate(${pos.x},${pos.y}) rotate(${pos.rotation})`}
            >
              <motion.text
                style={{
                  fill: pos.color,
                  fontSize: `${350 * pos.scale}px`,
                  fontFamily: "Faune",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  opacity: 0.8,
                  transformOrigin: "center",
                }}
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                {pos.letter}
              </motion.text>
            </motion.g>
          </motion.svg>
        </motion.div>
      ))}
    </div>
  );
};

export default MapIllustration;
