import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

/**
 * MorphDropdown Component
 * Implements the exact iOS / HyperOS morphing animation from trigger bounds:
 * - Grows out from underneath trigger button bounds as a 2px strip into full menu size.
 * - Staggers child items with translateY and opacity fade-in.
 * - On close: items collapse together and panel shrinks back into a 2px strip under the trigger button.
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
}) {
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef(null);
  const hideTimerRef = useRef(null);

  useLayoutEffect(() => {
    if (isOpen) {
      clearTimeout(hideTimerRef.current);
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted || !panelRef.current || !triggerRef?.current) return;

    const panel = panelRef.current;
    const trigger = triggerRef.current;

    if (isOpen) {
      const originRect = trigger.getBoundingClientRect();

      // 1. Measure target natural size offscreen/hidden
      panel.style.transition = "none";
      panel.style.top = `${originRect.bottom + offsetY}px`;
      if (align === "right") {
        panel.style.left = `${originRect.right - 260}px`; // estimate
      } else {
        panel.style.left = `${originRect.left}px`;
      }
      panel.style.width = "auto";
      panel.style.height = "auto";
      panel.style.visibility = "hidden";
      panel.style.opacity = "0";

      const finalRect = panel.getBoundingClientRect();

      // Adjust left if overflowing window edge or right align
      let targetLeft = originRect.left;
      if (align === "right") {
        targetLeft = originRect.right - finalRect.width;
      } else if (align === "center") {
        targetLeft = originRect.left + originRect.width / 2 - finalRect.width / 2;
      }

      // Clamp targetLeft to viewport padding
      if (targetLeft < 8) targetLeft = 8;
      if (targetLeft + finalRect.width > window.innerWidth - 8) {
        targetLeft = window.innerWidth - finalRect.width - 8;
      }

      // Check if opens upwards if bottom overflow
      let startTop = originRect.bottom + offsetY;
      let targetTop = originRect.bottom + offsetY;
      if (targetTop + finalRect.height > window.innerHeight - 12) {
        targetTop = Math.max(8, originRect.top - finalRect.height - offsetY);
        startTop = originRect.top - 4;
      }

      // 2. Set initial thin strip starting position under/above button
      panel.style.top = `${startTop}px`;
      panel.style.left = `${align === "right" ? originRect.right - originRect.width : originRect.left}px`;
      panel.style.width = `${originRect.width}px`;
      panel.style.height = "2px";
      panel.style.borderRadius = "10px";
      panel.style.visibility = "visible";
      panel.style.opacity = "1";

      // Force reflow
      void panel.offsetHeight;

      // 3. Animate to expanded target dimensions
      const DURATION = 380;
      const EASE = "380ms cubic-bezier(.32,.72,0,1)";
      panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}`;
      panel.style.top = `${targetTop}px`;
      panel.style.left = `${targetLeft}px`;
      panel.style.width = `${finalRect.width}px`;
      panel.style.height = `${finalRect.height}px`;
      panel.style.borderRadius = "16px";

      // 4. Stagger items inside panel
      const items = panel.querySelectorAll(
        ".morph-menu-item, .dropdown button, button, a"
      );
      items.forEach((item, i) => {
        item.style.transitionDelay = `${140 + i * 45}ms`;
      });

      panel.classList.remove("content-in");
      requestAnimationFrame(() => panel.classList.add("content-in"));
    } else {
      // Closing
      const items = panel.querySelectorAll(
        ".morph-menu-item, .dropdown button, button, a"
      );
      items.forEach((item) => {
        item.style.transitionDelay = "0ms";
      });
      panel.classList.remove("content-in");

      const originRect = trigger.getBoundingClientRect();
      const startTop = originRect.bottom + 4;

      const DURATION = 300;
      const EASE = "300ms cubic-bezier(.32,.72,0,1)";
      panel.style.transition = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}, border-radius ${EASE}, opacity ${DURATION * 0.4}ms ease-in ${DURATION * 0.6}ms`;
      panel.style.top = `${startTop}px`;
      panel.style.left = `${align === "right" ? originRect.right - originRect.width : originRect.left}px`;
      panel.style.width = `${originRect.width}px`;
      panel.style.height = "2px";
      panel.style.borderRadius = "10px";
      panel.style.opacity = "0";

      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsMounted(false);
      }, DURATION);
    }
  }, [isOpen, isMounted, triggerRef, align, offsetY]);

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

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        zIndex: 9999,
        willChange: "top, left, width, height, border-radius, opacity",
        overflow: "hidden",
        ...style,
      }}
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl ${className}`}
    >
      <div className="p-1.5">{children}</div>
    </div>,
    document.body
  );
}
