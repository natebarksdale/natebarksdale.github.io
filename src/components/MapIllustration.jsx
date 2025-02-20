import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MapIllustration = ({ 
  title,
  coordinates,
  mapboxToken,
  width = 800,
  height = 200,
  mwidth = 850,
  mheight = 250,
  zoom = 5,
  bearing = 0,
  pitch = 0
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  
  // Create different parallax rates for each layer
  const mapParallax = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const letterParallax = useMemo(() => {
    const letters = title.replace(/\s+/g, '').slice(0, 5).toUpperCase();
    return letters.split('').map(() => 
      useTransform(scrollYProgress, [0, 1], [0, -30 - Math.random() * 20])
    );
  }, [scrollYProgress, title]);

  // Generate irregular polygon clips for each layer
  const generateClipPath = () => {
    const jitter = 20; // Amount of randomness in pixels
    return `polygon(
      ${Math.random() * jitter}% ${Math.random() * jitter}%, 
      ${100 - Math.random() * jitter}% ${Math.random() * jitter}%, 
      ${100 - Math.random() * jitter}% ${100 - Math.random() * jitter}%, 
      ${Math.random() * jitter}% ${100 - Math.random() * jitter}%
    )`;
  };

  const letterPositions = useMemo(() => {
    const letters = title.replace(/\s+/g, '').slice(0, 5).toUpperCase();
    return letters.split('').map(letter => ({
      letter,
      x: Math.random() * width * 0.9 + width * 0.05,
      y: Math.random() * height * 0.9 + height * 0.05,
      rotation: Math.random() * 45 - 22.5, // More subtle rotation
      color: getMidCenturyColor(),
      scale: 1.5 + Math.random() * 0.8,
      clipPath: generateClipPath()
    }));
  }, [title, width, height]);

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}`;

  return (
    <div ref={ref} className="relative w-full h-[200px] overflow-visible">
      <motion.div 
        className="absolute inset-0" 
        style={{ 
          y: mapParallax,
          clipPath: generateClipPath(),
          zIndex: 1
        }}
      >
        <motion.img 
          src={mapUrl} 
          alt="Map"
          className="w-full h-full object-cover filter grayscale contrast-90" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
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
            clipPath: pos.clipPath
          }}
        >
          <motion.svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="none"
          >
            <motion.g transform={`translate(${pos.x},${pos.y}) rotate(${pos.rotation})`}>
              <motion.text
                style={{
                  fill: pos.color,
                  fontSize: `${350 * pos.scale}px`,
                  fontFamily: 'Faune, sans-serif',
                  opacity: 0.8,
                  transformOrigin: 'center',
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

function getMidCenturyColor() {
  const colors = ['rgba(230, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.6)'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default MapIllustration;
