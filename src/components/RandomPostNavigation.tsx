import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface PostNavigationProps {
  currentSlug: string;
  availableSlugs: string[];
  nextPostSlug?: string;
  nextPostTitle?: string;
}

const PostNavigation: React.FC<PostNavigationProps> = ({ 
  currentSlug, 
  availableSlugs, 
  nextPostSlug,
  nextPostTitle
}) => {
  const handleRandomPost = () => {
    const otherSlugs = availableSlugs.filter(slug => slug !== currentSlug);
    const randomSlug = otherSlugs[Math.floor(Math.random() * otherSlugs.length)];
    window.location.href = `/posts/${randomSlug}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-skin-card bg-opacity-80 backdrop-blur-sm border-t border-b border-skin-line">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
        {nextPostSlug ? (
          <button 
            onClick={() => window.location.href = `/posts/${nextPostSlug}`}
            className="flex items-center gap-2 px-4 py-2 hover:opacity-75 transition-opacity text-left"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="rotate-180"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <div>
              <div className="text-sm text-skin-accent">Next Post</div>
              <div className="text-skin-base font-medium truncate max-w-[200px]">
                {nextPostTitle}
              </div>
            </div>
          </button>
        ) : (
          <div /> {/* Empty div to maintain spacing when there's no next post */}
        )}
        
        <button 
          onClick={handleRandomPost}
          className="px-4 py-2 bg-skin-accent text-white rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M18 4l3 3l-3 3"/>
            <path d="M18 20l3-3l-3-3"/>
            <path d="M21 7H3"/>
            <path d="M21 17H3"/>
          </svg>
          Random Post
        </button>
      </div>
    </div>
  );
};

export default PostNavigation;