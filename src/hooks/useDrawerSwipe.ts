import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 40;

export function useDrawerSwipe(
  isOpen: boolean,
  open: () => void,
  close: () => void
) {
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (deltaY > 10) didSwipe.current = true;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
        if (deltaY < 0) open();
        else close();
        didSwipe.current = true;
      }
      touchStartY.current = null;
    },
    [open, close]
  );

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (didSwipe.current) {
        didSwipe.current = false;
        e.preventDefault();
        return;
      }
      if (isOpen) close();
      else open();
    },
    [isOpen, open, close]
  );

  return { onTouchStart, onTouchMove, onTouchEnd, onClick };
}
