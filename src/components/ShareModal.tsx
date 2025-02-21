import React, { useState } from "react";

interface ShareModalProps {
  url: string;
  title: string;
  description: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
          <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
        </svg>
      ),
      onClick: async () => {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
    },
    {
      name: "Twitter",
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
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
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
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Email",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <rect x="3" y="5" width="18" height="14" rx="2"></rect>
          <polyline points="3 7 12 13 21 7"></polyline>
        </svg>
      ),
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
    },
  ];

  return (
    <div className="relative inline-block">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-skin-line px-4 py-2 hover:bg-skin-accent hover:text-skin-inverted"
        aria-label="Share this post"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon-tabler"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          <path d="M8.7 10.7l6.6 -3.4"></path>
          <path d="M8.7 13.3l6.6 3.4"></path>
        </svg>
        <span>Share</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-skin-fill p-6 shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-skin-base hover:text-skin-accent"
              aria-label="Close share modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-tabler"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="mb-4 text-xl font-semibold text-skin-base">
              Share this post
            </h2>

            <div className="grid grid-cols-2 gap-4">
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
