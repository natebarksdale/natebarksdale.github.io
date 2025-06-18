import React from "react";

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
  prevPostTitle,
}) => {
  const handleRandomPost = () => {
    const otherSlugs = availableSlugs.filter(slug => slug !== currentSlug);
    const randomSlug =
      otherSlugs[Math.floor(Math.random() * otherSlugs.length)];
    window.location.href = `/posts/${randomSlug}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-skin-card bg-opacity-80 backdrop-blur-sm border-t border-b border-skin-line z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center gap-2">
        {prevPostSlug ? (
          <button
            onClick={() => (window.location.href = `/posts/${prevPostSlug}`)}
            className="flex-1 flex items-center gap-2 px-4 py-2 hover:opacity-75 transition-opacity text-left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
            <div className="hidden sm:block">
              <div className="text-sm text-skin-accent">Previous Post</div>
              <div className="text-skin-base font-medium truncate max-w-[200px]">
                {prevPostTitle}
              </div>
            </div>
            <span className="block sm:hidden text-skin-base">
              Previous Post
            </span>
          </button>
        ) : (
          <div className="flex-1"></div>
        )}

        <button
          onClick={handleRandomPost}
          className="w-12 h-12 bg-skin-accent text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center flex-shrink-0"
        >
          <span style={{ fontFamily: '"Noto Emoji"' }} className="text-xl">
            🎲
          </span>
          <span className="sr-only">Random Post</span>
        </button>

        {nextPostSlug ? (
          <button
            onClick={() => (window.location.href = `/posts/${nextPostSlug}`)}
            className="flex-1 flex items-center gap-2 px-4 py-2 hover:opacity-75 transition-opacity text-right justify-end"
          >
            <span className="block sm:hidden text-skin-base">Next Post</span>
            <div className="hidden sm:block">
              <div className="text-sm text-skin-accent">Next Post</div>
              <div className="text-skin-base font-medium truncate max-w-[200px]">
                {nextPostTitle}
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              style={{ transform: "rotate(180deg)" }}
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
    </div>
  );
};

export default PostNavigation;
