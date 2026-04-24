type HeroVideoProps = {
  src: string;
  className?: string;
};

export default function HeroVideo({ src, className }: HeroVideoProps) {
  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Hero background video"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
