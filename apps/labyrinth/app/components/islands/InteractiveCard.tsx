"use client";

// Island Component - Interactive card
// This component hydrates on the client for interactivity
// Marked with 'use client' directive

import { useState } from "react";

interface InteractiveCardProps {
  title: string;
  description: string;
  initialLikes?: number;
  onLike?: (count: number) => void;
}

export function InteractiveCard({
  title,
  description,
  initialLikes = 0,
  onLike,
}: InteractiveCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => {
    const newCount = likes + 1;
    setLikes(newCount);
    onLike?.(newCount);
  };

  return (
    <article className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <div
        className={`text-gray-600 mb-4 overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-full" : "max-h-20"}`}
      >
        {description}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          aria-label={`Like (${likes} likes)`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{likes}</span>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      </div>
    </article>
  );
}
