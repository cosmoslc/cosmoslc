import React, { useEffect, useRef } from 'react';

/**
 * NavIndicator hook & component
 * Provides a floating sliding indicator behind active navigation items with
 * the iOS easing and squish animation from the demo file.
 */
export function useNavIndicator(dependencies = [], containerRef) {
  const indicatorRef = useRef(null);
  const prevPosRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      const container = containerRef?.current;
      const indicator = indicatorRef?.current;
      if (!container || !indicator) return;

      // Find the active element in sidebar (prioritize exact active nav-item or nav-sub-item)
      let activeEl = container.querySelector(
        '.nav-item.active, .nav-sub-item.active'
      );

      // If no direct active child, fallback to parent with active child if menu is collapsed
      if (!activeEl) {
        activeEl = container.querySelector('.nav-parent-item.has-active-child');
      }

      if (!activeEl) {
        indicator.style.opacity = '0';
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      // If element is hidden (collapsed or zero size)
      if (activeRect.width === 0 || activeRect.height === 0) {
        indicator.style.opacity = '0';
        return;
      }

      const toY = activeRect.top - containerRect.top + container.scrollTop;
      const toX = activeRect.left - containerRect.left;
      const toW = activeRect.width;
      const toH = activeRect.height;
      const computed = window.getComputedStyle(activeEl);
      const toRadius = computed.borderRadius || '12px';
      const isSub = activeEl.classList.contains('nav-sub-item');

      const isDark = document.documentElement.classList.contains('dark');
      if (isSub) {
        indicator.style.background = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e9efff';
        indicator.style.boxShadow = 'none';
      } else {
        indicator.style.background = isDark
          ? 'linear-gradient(135deg, #4338ca, #6366f1)'
          : 'linear-gradient(135deg, var(--primary), #5b63f2)';
        indicator.style.boxShadow = '0 8px 20px -4px rgba(63, 109, 246, 0.45)';
      }

      const prev = prevPosRef.current;
      prevPosRef.current = { y: toY, x: toX, w: toW, h: toH };

      indicator.style.opacity = '1';
      indicator.style.width = `${toW}px`;
      indicator.style.height = `${toH}px`;
      indicator.style.borderRadius = toRadius;

      // First time or same position
      if (!prev || (Math.abs(prev.y - toY) < 1 && Math.abs(prev.x - toX) < 1)) {
        indicator.style.transform = `translate3d(${toX}px, ${toY}px, 0) scaleX(1) scaleY(1)`;
        return;
      }

      const fromY = prev.y;
      const fromX = prev.x;
      const fromH = prev.h;
      const fromW = prev.w;

      // Animate with exact elastic squish from demo
      indicator.getAnimations().forEach((a) => a.cancel());
      indicator.animate(
        [
          {
            transform: `translate3d(${fromX}px, ${fromY}px, 0) scaleX(1) scaleY(1)`,
            height: `${fromH}px`,
            width: `${fromW}px`,
          },
          {
            transform: `translate3d(${(fromX + toX) / 2}px, ${(fromY + toY) / 2}px, 0) scaleX(0.88) scaleY(1.04)`,
            height: `${(fromH + toH) / 2}px`,
            width: `${toW}px`,
            offset: 0.45,
          },
          {
            transform: `translate3d(${toX}px, ${toY}px, 0) scaleX(1) scaleY(1)`,
            height: `${toH}px`,
            width: `${toW}px`,
          },
        ],
        {
          duration: 380,
          easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
          fill: 'forwards',
        }
      );
    };

    const frameId = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePosition);
    };
  }, dependencies);

  return indicatorRef;
}

export function NavIndicator({ indicatorRef }) {
  return (
    <span
      ref={indicatorRef}
      className="nav-indicator"
      aria-hidden="true"
    />
  );
}
