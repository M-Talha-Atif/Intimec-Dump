import clsx from "clsx";
import { useRef, useEffect, useState } from "react";

interface CustomScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollRatio?: number;
  currentScrollPosition?: number;
  direction?: "vertical" | "horizontal";
  onThumbMove: (scrollTop: number) => void;
  className?: string;
}

export default function CustomScrollbar({
  scrollRatio = 0.2,
  currentScrollPosition = 0,
  onThumbMove,
  direction = "vertical",
  className = "",
  ...props
}: CustomScrollbarProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [mouseOffset, setMouseOffset] = useState(0);

  useEffect(() => {
    if (direction === "horizontal") {
      const trackWidth = scrollTrackRef.current?.clientWidth || 0;
      const thumbWidth = trackWidth * scrollRatio;
      if (scrollThumbRef.current) {
        scrollThumbRef.current.style.width = `${thumbWidth}px`;
      }
    } else {
      const trackHeight = scrollTrackRef.current?.clientHeight || 0;
      const thumbHeight = trackHeight * scrollRatio;
      if (scrollThumbRef.current) {
        scrollThumbRef.current.style.height = `${thumbHeight}px`;
      }
    }
  }, [scrollRatio, direction]);

  // Update thumb position when currentScrollTop prop changes
  useEffect(() => {
    if (!scrollTrackRef.current || !scrollThumbRef.current) return;
    if (direction === "horizontal") {
      const trackWidth = scrollTrackRef.current.clientWidth;
      const thumbWidth = scrollThumbRef.current.clientWidth;
      const maxThumbLeft = trackWidth - thumbWidth;
      const clampedLeft = Math.max(
        0,
        Math.min(currentScrollPosition * maxThumbLeft, maxThumbLeft)
      );
      scrollThumbRef.current.style.left = `${clampedLeft}px`;
    } else {
      const trackHeight = scrollTrackRef.current.clientHeight;
      const thumbHeight = scrollThumbRef.current.clientHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      const clampedTop = Math.max(
        0,
        Math.min(currentScrollPosition * maxThumbTop, maxThumbTop)
      );
      scrollThumbRef.current.style.top = `${clampedTop}px`;
    }
  }, [currentScrollPosition, direction]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      event.stopPropagation();
      if (!dragging || !scrollTrackRef.current || !scrollThumbRef.current)
        return;
      const trackRect = scrollTrackRef.current.getBoundingClientRect();
      if (direction === "horizontal") {
        let newLeft = event.clientX - trackRect.left - mouseOffset;
        const thumbWidth = scrollThumbRef.current.clientWidth;
        const trackWidth = trackRect.width;
        // Ensure the thumb stays within the track bounds
        newLeft = Math.min(Math.max(newLeft, 0), trackWidth - thumbWidth);
        scrollThumbRef.current.style.left = `${newLeft}px`;
        onThumbMove(newLeft / (trackWidth - thumbWidth));
      } else {
        let newTop = event.clientY - trackRect.top - mouseOffset;
        const thumbHeight = scrollThumbRef.current.clientHeight;
        const trackHeight = trackRect.height;
        // Ensure the thumb stays within the track bounds
        newTop = Math.min(Math.max(newTop, 0), trackHeight - thumbHeight);
        scrollThumbRef.current.style.top = `${newTop}px`;
        onThumbMove(newTop / (trackHeight - thumbHeight));
      }
    }

    function handleMouseUp() {
      setDragging(false);
    }

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, mouseOffset, onThumbMove, direction]);

  return (
    <div
      ref={scrollTrackRef}
      className={clsx(
        "bg-muted relative",
        className,
        direction === "horizontal" ? "h-3 w-full" : "w-3 h-full"
      )}
      {...props}
      onMouseDown={(event) => {
        event.stopPropagation();
        setDragging(true);
        if (scrollThumbRef.current) {
          const trackRect = scrollTrackRef.current!.getBoundingClientRect();
          if (direction === "horizontal") {
            const trackWidth = trackRect.width;
            const thumbWidth = scrollThumbRef.current.clientWidth;
            const offset = event.clientX - trackRect.left;
            scrollThumbRef.current.style.left = `${Math.min(
              Math.max(offset, 0),
              trackWidth - thumbWidth
            )}px`;
          } else {
            const trackHeight = trackRect.height;
            const thumbHeight = scrollThumbRef.current.clientHeight;
            const offset = event.clientY - trackRect.top;
            scrollThumbRef.current.style.top = `${Math.min(
              Math.max(offset, 0),
              trackHeight - thumbHeight
            )}px`;
          }
        }
      }}
    >
      {scrollRatio < 1 && scrollRatio > 0 && (
        <div
          ref={scrollThumbRef}
          className={clsx(
            "p-0.5 absolute",
            direction === "horizontal" ? "h-full" : "w-full"
          )}
          style={{
            cursor: dragging ? "grabbing" : "grab",
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
            setDragging(true);
            if (scrollThumbRef.current) {
              const thumbRect = scrollThumbRef.current.getBoundingClientRect();
              if (direction === "horizontal") {
                const offset = event.clientX - thumbRect.left;
                setMouseOffset(offset);
              } else {
                const offset = event.clientY - thumbRect.top;
                setMouseOffset(offset);
              }
            }
          }}
        >
          <div className="w-full h-full bg-muted-foreground rounded-full"></div>
        </div>
      )}
    </div>
  );
}
