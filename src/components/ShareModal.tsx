import React, { useState, useEffect, useRef } from "react";

interface ShareModalProps {
  url: string;
  title: string;
  description: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const shareLinks = [
    {
      name: "Copy Link",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M9 15l6 -6"></path>
          <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
          <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
        </svg>
      ),
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error("Failed to copy text: ", err);
        }
      },
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          <line x1="8" y1="11" x2="8" y2="16"></line>
          <line x1="8" y1="8" x2="8" y2="8.01"></line>
          <line x1="12" y1="16" x2="12" y2="11"></line>
          <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-1 hover:opacity-75"
        onClick={() => setIsOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="6" r="3"></circle>
          <circle cx="18" cy="18" r="3"></circle>
          <line x1="8.7" y1="10.7" x2="15.3" y2="7.3"></line>
          <line x1="8.7" y1="13.3" x2="15.3" y2="16.7"></line>
        </svg>
        Share this post
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="relative w-full max-w-sm bg-skin-fill p-6 rounded-sm"
          >
            <button
              className="absolute top-2 right-2 text-skin-base opacity-30 hover:opacity-60"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-semibold mb-4">Share this post</h3>
            <div className="flex flex-col gap-3">
              {shareLinks.map(link =>
                link.onClick ? (
                  <button
                    key={link.name}
                    onClick={link.onClick}
                    className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted"
                  >
                    {link.icon}
                    <span>
                      {copySuccess && link.name === "Copy Link"
                        ? "Copied!"
                        : link.name}
                    </span>
                  </button>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareModal;
