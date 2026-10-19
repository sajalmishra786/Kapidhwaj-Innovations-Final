import { useEffect, useRef, useState } from 'react';

/**
 * Walks to `target` one step at a time, so no step is skipped.
 *
 * The scroll can land several steps away in one flick, and showing only the step it
 * landed on drops the numbers between: the wheel turns straight past them. This
 * shows each in turn, leaving `dwellMs` between one step and the next — long enough
 * for the outgoing copy to leave and the incoming copy to arrive. The first move
 * after a rest is immediate; only the ones that follow it wait.
 *
 * With `animate` off (the scroll is outside the pinned section, so nobody is
 * watching the steps) it goes straight to `target`.
 */
export function useSequentialStep(target: number, animate: boolean, dwellMs: number): number {
  const [shown, setShown] = useState(target);
  const lastMoveAt = useRef(0);

  useEffect(() => {
    if (shown === target) return;

    if (!animate) {
      lastMoveAt.current = performance.now();
      setShown(target);
      return;
    }

    const wait = Math.max(0, lastMoveAt.current + dwellMs - performance.now());
    const timer = window.setTimeout(() => {
      lastMoveAt.current = performance.now();
      setShown((current) => current + Math.sign(target - current));
    }, wait);
    return () => window.clearTimeout(timer);
  }, [shown, target, animate, dwellMs]);

  return shown;
}
