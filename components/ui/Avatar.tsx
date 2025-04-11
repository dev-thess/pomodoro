"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  src: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  fallbackType?: "initials" | "image";
}

/**
 * Avatar component with fallback handling:
 * - Shows user image from src if available and loads successfully
 * - Falls back to initials (default) or default image on error
 * - Handles Google OAuth image URLs that might return 400 errors
 */
export function Avatar({
  src,
  name,
  size = 32,
  className = "",
  fallbackType = "initials",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initial letter (or default if no name)
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  // Only attempt to display image if we have a source and no error
  const showImage = src && !imageError;

  // Handle image load error
  const handleImageError = () => {
    console.warn("Avatar image failed to load:", src);
    setImageError(true);
  };

  return (
    <div
      className={`rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name || "User"}
          width={size}
          height={size}
          onError={handleImageError}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      ) : fallbackType === "initials" ? (
        <div
          className='flex items-center justify-center w-full h-full bg-red-100 text-red-500'
          style={{ fontSize: Math.max(size / 2, 12) }}
        >
          {initial}
        </div>
      ) : (
        <Image
          src='/images/default-avatar.svg'
          alt={name || "User"}
          width={size}
          height={size}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
}
