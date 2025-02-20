import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface RandomPostNavigationProps {
  currentSlug: string;
  onRandomPost: () => void;
}

const RandomPostNavigation: React.FC<RandomPostNavigationProps> = ({ currentSlug, onRandomPost }) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  
  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    if (Math.abs(offset) > 100) {
      await controls.start({ x: offset < 0 ? -300 : 300, opacity: 0 });
      onRandomPost();
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center">
      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, opacity }}
        className="bg-skin-card rounded-lg shadow-lg p-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="md:hidden">← Swipe for a random post →</span>
          <button 
            onClick={onRandomPost}
            className="hidden md:block px-4 py-2 bg-skin-accent text-white rounded hover:opacity-90 transition-opacity"
          >
            Read Another Post
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RandomPostNavigation;