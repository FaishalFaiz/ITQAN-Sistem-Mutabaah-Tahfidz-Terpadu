import gsap from 'gsap';

/**
 * Animate numbers counting up smoothly
 */
export const animateCounter = (
  element: HTMLElement | null,
  targetValue: number,
  duration: number = 0.8
) => {
  if (!element) return;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: targetValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const current = Math.round(obj.val);
      element.innerText = current < 10 ? `0${current}` : `${current}`;
    },
  });
};

/**
 * Animate staggered child elements on mount
 */
export const animateStaggerIn = (
  targets: string | Element | Element[],
  options?: {
    stagger?: number;
    duration?: number;
    delay?: number;
    y?: number;
  }
) => {
  return gsap.fromTo(
    targets,
    {
      opacity: 0,
      y: options?.y ?? 16,
      scale: 0.98,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: options?.duration ?? 0.5,
      stagger: options?.stagger ?? 0.06,
      delay: options?.delay ?? 0.05,
      ease: 'power3.out',
      clearProps: 'transform',
    }
  );
};

/**
 * Animate progress bar filling
 */
export const animateProgress = (
  element: HTMLElement | null,
  targetWidthPercent: number,
  duration: number = 0.9
) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { width: '0%' },
    {
      width: `${Math.max(0, Math.min(100, targetWidthPercent))}%`,
      duration,
      ease: 'power2.out',
    }
  );
};
