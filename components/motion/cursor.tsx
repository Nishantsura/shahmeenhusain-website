"use client";

import { motion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const POSITION_SPRING = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 };
const ROTATION_SPRING = { damping: 60, stiffness: 300, mass: 1, restDelta: 0.001 };

// Anything the visitor can act on — the arrow swaps to a hand over these.
const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, label, [role="button"], [data-cursor-pointer]';

/**
 * Custom cursor — a small solid arrowhead in the accent red that swings
 * to face the direction of travel, and swaps to a hand over anything
 * clickable so it reads as an affordance rather than decoration.
 * Desktop pointers only.
 */
export function Cursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPointerRef = useRef(false);

  const cursorX = useSpring(0, POSITION_SPRING);
  const cursorY = useSpring(0, POSITION_SPRING);
  const rotation = useSpring(0, ROTATION_SPRING);

  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const lastAngle = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch and reduced-motion users keep the system cursor.
    if (!fine || reduced) return;

    document.documentElement.classList.add("has-custom-cursor");
    lastTime.current = Date.now();

    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setVisible(true);

        const now = Date.now();
        const dt = now - lastTime.current || 1;
        const vx = (e.clientX - lastPos.current.x) / dt;
        const vy = (e.clientY - lastPos.current.y) / dt;
        lastPos.current = { x: e.clientX, y: e.clientY };
        lastTime.current = now;

        cursorX.set(e.clientX);
        cursorY.set(e.clientY);

        // Hold the hand steady rather than spinning it toward clicks.
        if (isPointerRef.current) return;

        const speed = Math.hypot(vx, vy);
        if (speed > 0.1) {
          const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
          let diff = angle - lastAngle.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          accumulated.current += diff;
          rotation.set(accumulated.current);
          lastAngle.current = angle;
        }
      });
    };

    const onOver = (e: MouseEvent) => {
      const pointer = !!(e.target as Element)?.closest?.(CLICKABLE_SELECTOR);
      isPointerRef.current = pointer;
      setIsPointer(pointer);
      if (pointer) {
        accumulated.current = 0;
        lastAngle.current = 0;
        rotation.set(0);
      }
    };

    const onLeave = () => setVisible(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [cursorX, cursorY, rotation]);

  return (
    <motion.div
      aria-hidden
      style={{ left: cursorX, top: cursorY, rotate: rotation }}
      className={`pointer-events-none fixed z-[5000] text-brand transition-opacity duration-300 will-change-transform max-[767px]:hidden motion-reduce:hidden [@media(pointer:coarse)]:hidden ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {isPointer ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="8" y="2" width="3" height="11" rx="1.5" fill="currentColor" />
          <rect x="11.2" y="3" width="3" height="10" rx="1.5" fill="currentColor" />
          <rect x="14.4" y="5" width="2.8" height="8" rx="1.4" fill="currentColor" />
          <rect x="17.2" y="7" width="2.4" height="6" rx="1.2" fill="currentColor" />
          <rect x="6" y="11" width="14" height="9" rx="4" fill="currentColor" />
          <rect
            x="2"
            y="13"
            width="6"
            height="3.5"
            rx="1.75"
            fill="currentColor"
            transform="rotate(-20 5 14.75)"
          />
        </svg>
      ) : (
        <svg width="20" height="22" viewBox="0 0 50 54" fill="none">
          <path
            d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
            fill="currentColor"
          />
        </svg>
      )}
    </motion.div>
  );
}
