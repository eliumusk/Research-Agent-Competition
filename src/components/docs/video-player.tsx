interface VideoPlayerProps {
  src: string;
  width?: number | string;
  height?: number | string;
  poster?: string;
  className?: string;
}

/**
 * VideoPlayer component for embedding MP4 videos in MDX
 *
 * @param {string} src - The URL of the video file (MP4)
 * @param {number|string} width - The width of the video player (default: 100%)
 * @param {number|string} height - The height of the video player (default: auto)
 * @param {string} poster - Optional poster image URL
 * @param {string} className - Optional CSS classes
 *
 * @example
 * <VideoPlayer 
 *   src="https://cdn.example.com/videos/demo.mp4" 
 *   poster="https://cdn.example.com/images/poster.jpg"
 * />
 */
export const VideoPlayer = ({
  src,
  width = '100%',
  height = 'auto',
  poster,
  className = '',
}: VideoPlayerProps) => {
  return (
    <div className={`my-4 ${className}`}>
      <video
        width={width}
        height={height}
        controls
        poster={poster}
        className="rounded-lg border shadow-sm w-full"
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

