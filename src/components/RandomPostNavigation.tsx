import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface PostNavigationProps {
  currentSlug: string;
  availableSlugs: string[];
  nextPostSlug?: string;
  nextPostTitle?: string;
  prevPostSlug?: string;
  prevPostTitle?: string;
}

const PostNavigation: React.FC<PostNavigationProps> = ({ 
  currentSlug, 
  availableSlugs, 
  nextPostSlug,
  nextPostTitle,
  prevPostSlug,
  prevPostTitle
}) => {
  const handleRandomPost = () => {
    const otherSlugs = availableSlugs.filter(slug => slug !== currentSlug);
    const randomSlug = otherSlugs[Math.floor(Math.random() * otherSlugs.length)];
    window.location.href = `/posts/${randomSlug}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-skin-card bg-opacity-80 backdrop-blur-sm border-t border-b border-skin-line">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center gap-2">
        {prevPostSlug ? (
          <button 
            onClick={() => window.location.href = `/posts/${prevPostSlug}`}
            className="flex-1 flex items-center gap-2 px-4 py-2 hover:opacity-75 transition-opacity text-left"
          >
            <span className="text-xl">⬅️</span>
            <div>
              <div className="text-sm text-skin-accent">Previous Post</div>
              <div className="text-skin-base font-medium truncate max-w-[200px]">
                {prevPostTitle}
              </div>
            </div>
          </button>
        ) : (
          <div className="flex-1"></div>
        )}
        
        <button 
          onClick={handleRandomPost}
          className="px-6 py-2 bg-skin-accent text-white rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="text-xl">🎲</span>
          <span className="sr-only">Random Post</span>
        </button>

        {nextPostSlug ? (
          <button 
            onClick={() => window.location.href = `/posts/${nextPostSlug}`}
            className="flex-1 flex items-center gap-2 px-4 py-2 hover:opacity-75 transition-opacity text-right justify-end"
          >
            <div>
              <div className="text-sm text-skin-accent">Next Post</div>
              <div className="text-skin-base font-medium truncate max-w-[200px]">
                {nextPostTitle}
              </div>
            </div>
            <span className="text-xl">➡️</span>
          </button>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
    </div>
  );
};

export default PostNavigation;