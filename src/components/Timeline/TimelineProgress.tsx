import { useRef, useEffect, useState, useId } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface TimelineProgressProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function TimelineProgress({ containerRef }: TimelineProgressProps) {
  const svgId = useId();
  const gradientId = `timeline-grad-${svgId.replace(/:/g, '')}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, svgHeight]);
  const springHeight = useSpring(heightTransform, { stiffness: 100, damping: 30 });

  if (svgHeight <= 0) return null;

  return (
    <svg
      ref={svgRef}
      className="timeline__svg"
      viewBox={`0 0 20 ${svgHeight}`}
      width="20"
      height={svgHeight}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C85A3A" />
          <stop offset="50%" stopColor="#D4704E" />
          <stop offset="100%" stopColor="#E8956F" />
        </linearGradient>
      </defs>
      {/* Static track */}
      <line
        x1="10" y1="0" x2="10" y2={svgHeight}
        className="timeline__track"
      />
      {/* Animated progress line */}
      <motion.line
        x1="10" y1="0" x2="10"
        y2={springHeight}
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
