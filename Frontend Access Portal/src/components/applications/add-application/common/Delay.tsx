import { useState, useEffect } from "react";

export default function ShowAfterDelay({
  children,
  waitBeforeShow = 200,
  fallback = null,
}: {
  children: React.ReactNode;
  waitBeforeShow?: number;
  fallback?: React.ReactNode;
}) {
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : fallback;
}

export function RenderNextFrame({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return show ? children : fallback;
}
