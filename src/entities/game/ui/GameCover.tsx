import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/Primitives";

interface GameCoverProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  steamAppID?: string | null;
}

const DEFAULT_FALLBACK = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'%3EOffline / No Image%3C/text%3E%3C/svg%3E";

export function GameCover({
  src,
  alt,
  className,
  fallbackSrc,
  steamAppID,
  ...props
}: GameCoverProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If steamAppID is provided, try to fetch the high-res steam header, otherwise use the provided src
  const imageSrc = steamAppID && !hasError
    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppID}/header.jpg`
    : (hasError ? (fallbackSrc || DEFAULT_FALLBACK) : src);

  return (
    <div className={cn("relative overflow-hidden bg-black/40", className)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      <img
        src={imageSrc}
        alt={alt || "Game Cover"}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          } else if (imageSrc !== DEFAULT_FALLBACK) {
             setIsLoading(false); 
          }
        }}
        {...props}
      />
    </div>
  );
}
