import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className,
}: ScrollRevealProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        'scroll-reveal',
        `scroll-reveal--${variant}`,
        visible && 'scroll-reveal--visible',
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
