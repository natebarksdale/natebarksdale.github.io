import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";

interface ShareModalProps {
  url: string;
  title: string;
  description: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share</span>
      </button>

      {/* Modal Overlay */}
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
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Content */}
            <h2 className="mb-4 text-xl font-semibold text-skin-base">
              Share this post
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Link</span>
              </button>

              <EmailShareButton url={url} subject={title} body={description}>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted">
                  <EmailIcon size={20} round />
                  <span>Email</span>
                </div>
              </EmailShareButton>

              <TwitterShareButton url={url} title={title}>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted">
                  <TwitterIcon size={20} round />
                  <span>Twitter</span>
                </div>
              </TwitterShareButton>

              <LinkedinShareButton
                url={url}
                title={title}
                summary={description}
              >
                <div className="flex items-center justify-center gap-2 rounded-lg border border-skin-line p-3 hover:bg-skin-accent hover:text-skin-inverted">
                  <LinkedinIcon size={20} round />
                  <span>LinkedIn</span>
                </div>
              </LinkedinShareButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareModal;
