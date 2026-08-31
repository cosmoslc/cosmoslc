import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

/**
 * MorphDropdown Component
 * Implements exact uniform-scaling iOS / HyperOS morphing animation from trigger bounds:
 * - Grows out from trigger button bounds into full dropdown menu size.
 * - Content wrapper is pinned to target width so text & elements never reflow or distort.
 * - Scales smoothly using uniform scale (s = sqrt(sx * sy)).
 * - On close: panel and content shrink back uniformly into trigger button bounds.
 * - Built-in overlay backdrop for closing on outside taps/clicks.
 * - Suppresses scrollbars during open/close animation to eliminate scroll lines.
 */
export function MorphDropdown({
  isOpen,
  onClose,
  triggerRef,
  children,
  align = "right", // "right" | "left" | "center"
  className = "",
  style = {},
  offsetY = 6,
  matchTriggerWidth = false,
  showBackdrop = true,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const hideTimerRef = useRef(null);
  const animDoneTimerRef = useRef(null);

  useLayoutEffect(() => {
    if (isOpen) {
      clearTimeout(hideTimerRef.current);
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted || !panelRef.current || !triggerRef?.current) return;

    const panel = panelRef.current;
    const content = contentRef.current;
    const trigger = triggerRef.current;

    if (isOpen) {
      clearTimeout(animDoneTimerRef.current);
      const originRect = trigger.getBoundingClientRect();
      const originRadius =
        window.getComputedStyle(trigger).borderRadius || "12px";

      // 1. Measure natural target size
      panel.classList.add("is-animating");
      panel.style.transition = "none";
      panel.style.top = `${originRect.bottom + offsetY}px`;
      if (align === "right") {
        panel.style.left = `${originRect.right - 260}px`;
      } else {
        panel.style.left = `${originRect.left}px`;
      }

      const hasExplicitWidth = /\bw-\d+|\bw-\[|\bmax-w-|\bmin-w-/.test(className);

      if (matchTriggerWidth || className.includes("w-full")) {
        panel.style.width = `${Math.max(originRect.width, 200)}px`;
      } else if (hasExplicitWidth) {
        // Allow Tailwind width class from className to apply naturally
        panel.style.width = "";
      } else {
        panel.style.width = "max-content";
      }

      panel.style.height = "auto";
      panel.style.visibility = "hidden";
      panel.style.opacity = "0";

      if (content) {
        content.style.width = "auto";
      }

      const finalRect = panel.getBoundingClientRect();
      let targetWidth = finalRect.width;

      if (matchTriggerWidth || className.includes("w-full")) {
        targetWidth = Math.max(originRect.width, targetWidth);
      }

      // Clamp targetWidth to viewport
      if (targetWidth > window.innerWidth - 16) {
        targetWidth = window.innerWidth - 16;
      }

      // Pin content wrapper to target width to prevent reflow during animation
      if (content) {
        content.style.width = `${targetWidth}px`;
      }

      // Adjust left alignment & clamp
      let targetLeft = originRect.left;
      if (align === "right") {
        targetLeft = originRect.right - targetWidth;
      } else if (align === "center") {
        targetLeft = originRect.left + originRect.width / 2 - targetWidth / 2;
      }

      if (targetLeft < 8) targetLeft = 8;
      if (targetLeft + targetWidth > window.innerWidth - 8) {
        targetLeft = window.innerWidth - targetWidth - 8;
      }

      // Check vertical collision (open upwards if bottom overflow)
      let opensUpward = false;
      let startTop = originRect.bottom + offsetY;
      let targetTop = originRect.bottom + offsetY;

      if (targetTop + finalRect.height > window.innerHeight - 12) {
        opensUpward = true;
        targetTop = Math.max(8, originRect.top - finalRect.height - offsetY);
        startTop = originRect.top - (originRect.height || 4);
      }

      // Calculate uniform scale s = sqrt(sx * sy)
      const sx = targetWidth > 0 ? originRect.width / targetWidth : 1;
      const sy = finalRect.height > 0 ? (originRect.height || 6) / finalRect.height : 1;
      const s = Math.sqrt(Math.max(0.01, sx * sy));

      // Determine transform origin for content
      let transformOrigin = "top left";
      if (opensUpward) {
        transformOrigin = align === "right" ? "bottom right" : align === "center" ? "bottom center" : "bottom left";
      } else {
        transformOrigin = align === "right" ? "top right" : align === "center" ? "top center" : "top left";
      }

      // 2. Snap panel & content to origin trigger button bounds
      let startLeft = originRect.left;
      if (align === "right") {
        startLeft = originRect.right - originRect.width;
      } else if (align === "center") {
        startLeft = originRect.left + originRect.width / 2 - originRect.width / 2;
      }

      panel.style.transform = "none";
      panel.style.top = `${startTop}px`;
      panel.style.left = `${startLeft}px`;
      panel.style.width = `${originRect.width}px`;
      panel.style.height = `${originRect.height || 6}px`;
      panel.style.borderRadius = originRadius || "12px";
      panel.style.visibility = "visible";
      panel.style.opacity = "1";

      if (content) {
        content.style.transformOrigin = transformOrigin;
        content.style.transition = "none";
        content.style.transform = `scale(${s})`;
      }

      // Force reflow
      void panel.offsetHeight;

      // 3. Animate panel & content to target bounds
      const DURATION = 360;
      const EASE = "360ms cubic-bezier(.32,.72,0,1)";

      panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}`;
      panel.style.top = `${targetTop}px`;
      panel.style.left = `${targetLeft}px`;
      panel.style.width = `${targetWidth}px`;
      panel.style.height = `${finalRect.height}px`;
      panel.style.borderRadius = "16px";

      if (content) {
        content.style.transition = `transform ${EASE}`;
        content.style.transform = "scale(1)";
      }

      // 4. Stagger items inside panel
      const items = panel.querySelectorAll(".morph-menu-item");
      items.forEach((item, i) => {
        item.style.transitionDelay = `${100 + i * 30}ms`;
      });

      panel.classList.remove("content-in");
      requestAnimationFrame(() => panel.classList.add("content-in"));

      // Remove animating lock when done so internal scroll works
      animDoneTimerRef.current = setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.classList.remove("is-animating");
        }
      }, DURATION + 20);
    } else {
      // Closing animation
      clearTimeout(animDoneTimerRef.current);
      panel.classList.add("is-animating");

      const originRect = trigger.getBoundingClientRect();
      const originRadius =
        window.getComputedStyle(trigger).borderRadius || "12px";

      const currentRect = panel.getBoundingClientRect();
      const currentWidth = currentRect.width || 200;
      const currentHeight = currentRect.height || 100;

      const sx = currentWidth > 0 ? originRect.width / currentWidth : 1;
      const sy = currentHeight > 0 ? (originRect.height || 6) / currentHeight : 1;
      const s = Math.sqrt(Math.max(0.01, sx * sy));

      const items = panel.querySelectorAll(".morph-menu-item");
      items.forEach((item) => {
        item.style.transitionDelay = "0ms";
      });
      panel.classList.remove("content-in");

      let startLeft = originRect.left;
      if (align === "right") {
        startLeft = originRect.right - originRect.width;
      }
      const startTop = originRect.bottom + offsetY;

      const DURATION = 280;
      const EASE = "280ms cubic-bezier(.32,.72,0,1)";

      panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}, opacity ${DURATION * 0.4}ms ease-in ${DURATION * 0.6}ms`;
      panel.style.top = `${startTop}px`;
      panel.style.left = `${startLeft}px`;
      panel.style.width = `${originRect.width}px`;
      panel.style.height = `${originRect.height || 6}px`;
      panel.style.borderRadius = originRadius || "12px";
      panel.style.opacity = "0";

      if (content) {
        content.style.transition = `transform ${EASE}`;
        content.style.transform = `scale(${s})`;
      }

      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsMounted(false);
      }, DURATION);
    }
  }, [isOpen, isMounted, triggerRef, align, offsetY, matchTriggerWidth, className]);

  // Handle click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isMounted) return null;

  // Clean w-full from class string so fixed positioning in portal isn't 100vw
  const cleanClassName = className.replace(/\bw-full\b/g, "").trim();

  return createPortal(
    <>
      {/* Transparent Click-Outside Overlay / Backdrop */}
      {showBackdrop && (
        <div
          className="fixed inset-0 z-[9998] bg-black/0 cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          aria-hidden="true"
        />
      )}

      {/* Morphing Dropdown Panel */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          zIndex: 9999,
          willChange: "top, left, width, height, border-radius, opacity",
          overflow: "hidden",
          ...style,
        }}
        className={`morph-dropdown-panel bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl ${cleanClassName}`}
      >
        <div
          ref={contentRef}
          className="morph-dropdown-content shrink-0 origin-top-left w-full h-full"
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

