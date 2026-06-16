import { useState, useCallback, useRef } from "react";

const CLOSE_DURATION_MS = 350;

export function useMobileDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const openDrawer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDrawerClosing(false);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    if (!drawerOpen && !drawerClosing) return;

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    setDrawerOpen(false);
    setDrawerClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setDrawerClosing(false);
      closeTimerRef.current = null;
    }, CLOSE_DURATION_MS);
  }, [drawerOpen, drawerClosing]);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  }, [drawerOpen, closeDrawer, openDrawer]);

  return {
    drawerOpen,
    drawerClosing,
    drawerExpanded: drawerOpen,
    drawerVisible: drawerOpen || drawerClosing,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
}
