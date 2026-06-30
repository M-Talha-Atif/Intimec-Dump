import { Button } from "@/components/ui/button";
import { RefreshCcw, ZoomIn, ZoomOut } from "lucide-react";
import React, { useRef, useEffect, useCallback, useState } from "react";
import CustomScrollbar from "./ScrollBar";
import { GridManager } from "./GridManager";

const MatrixCanvas = ({
  rowLabels,
  colLabels,
  links,
  numRows,
  numCols,
  onCellClick = () => {},
}: {
  rowLabels: string[];
  colLabels: string[];
  links: { col: number; row: number }[];
  numCols: number;
  numRows: number;
  onCellClick?: (row: number, col: number) => void; // Callback for cell click events
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divContainerRef = useRef<HTMLDivElement>(null);
  const gridManagerRef = useRef<GridManager>(null);
  const frameRef = useRef<number>(0);
  const [verticalScrollData, setVerticalScrollData] = useState({
    scrollRatio: 1,
    currentScrollPosition: 0,
  });
  const [horizontalScrollData, setHorizontalScrollData] = useState({
    scrollRatio: 1,
    currentScrollPosition: 0,
  });
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // initialize the grid manager
  useEffect(() => {
    if (canvasRef.current) {
      gridManagerRef.current = new GridManager(
        canvasRef.current,
        [],
        [],
        0,
        0,
        [], // empty links initially
        setVerticalScrollData,
        setHorizontalScrollData,
        onCellClick
      );
    }
  }, [canvasRef, onCellClick]);

  // handle resizing the canvas to match the container size
  const resizeCanvas = useCallback(() => {
    const container = divContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Resize the drawing buffer
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // // Match the CSS size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    // Update scroll data based on new canvas size
    setVerticalScrollData(
      gridManagerRef.current?.getVerticalScrollData() || {
        scrollRatio: 1,
        currentScrollPosition: 0,
      }
    );
    setHorizontalScrollData(
      gridManagerRef.current?.getHorizontalScrollData() || {
        scrollRatio: 1,
        currentScrollPosition: 0,
      }
    );
  }, []);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (divContainerRef.current) {
      resizeObserver.observe(divContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [resizeCanvas]);

  // draw loop
  useEffect(() => {
    function render() {
      gridManagerRef.current?.draw();
      frameRef.current = requestAnimationFrame(render);
    }
    render();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (gridManagerRef.current) {
      // Update the grid manager with new data
      gridManagerRef.current.updateData(
        rowLabels,
        colLabels,
        numRows,
        numCols,
        links
      );
      resizeCanvas();
    }
  }, [
    links,
    rowLabels,
    colLabels,
    numRows,
    numCols,
    resizeCanvas,
    onCellClick,
  ]);

  function handleScroll(this: HTMLCanvasElement, e: WheelEvent) {
    e.preventDefault();
    let delta = e.deltaY;
    const rect = this.getBoundingClientRect();
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    const deltaX = e.deltaX;
    gridManagerRef.current?.handleMouseScroll("horizontal", deltaX, {
      x: left,
      y: top,
    });

    if (e.ctrlKey) {
      delta /= 10; // Adjust for laptop scroll sensitivity
      if (Math.abs(delta) >= 8) delta /= 10; // Further adjust for very high sensitivity as a mouse

      gridManagerRef.current?.handleZoom(-delta, {
        x: left,
        y: top,
      });
    } else if (e.shiftKey && deltaX === 0) {
      gridManagerRef.current?.handleMouseScroll("horizontal", delta, {
        x: left,
        y: top,
      });
    } else {
      gridManagerRef.current?.handleMouseScroll("vertical", delta, {
        x: left,
        y: top,
      });
    }
  }

  useEffect(() => {
    const element = canvasRef.current;
    if (element) {
      element.addEventListener("wheel", handleScroll, { passive: false }); // Use { passive: false } to allow preventDefault

      return () => {
        element.removeEventListener("wheel", handleScroll);
      };
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="h-full w-full relative pb-8 pr-5 flex flex-col">
      <div className="flex flex-row gap-2 mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (!canvasRef.current) return;
            gridManagerRef.current?.handleZoom(2, {
              x: canvasRef.current?.clientWidth / 2 || 0,
              y: canvasRef.current?.clientHeight / 2 || 0,
            }); // Zoom in by increasing cell size
          }}
        >
          <ZoomIn />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (!canvasRef.current) return;
            gridManagerRef.current?.handleZoom(-2, {
              x: canvasRef.current?.clientWidth / 2 || 0,
              y: canvasRef.current?.clientHeight / 2 || 0,
            }); // Zoom out by decreasing cell size
          }}
        >
          <ZoomOut />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            gridManagerRef.current?.resetZoom(); // Reset zoom to default cell size
          }}
        >
          <RefreshCcw />
        </Button>
      </div>
      <div className="h-full w-full relative flex flex-row overflow-hidden">
        <div
          ref={divContainerRef}
          className="h-full w-full relative overflow-clip  border-1 border-gray-300 box-border"
        >
          <canvas
            ref={canvasRef}
            draggable={false}
            className="absolute top-0 left-0"
            style={{
              imageRendering: "pixelated",
            }}
            onMouseMove={(e) => {
              e.preventDefault(); // Prevent default behavior
              const rect = e.currentTarget.getBoundingClientRect();
              const left = e.clientX - rect.left;
              const top = e.clientY - rect.top;
              gridManagerRef.current?.handleMouseHover({ x: left, y: top });
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent default behavior
              const rect = e.currentTarget.getBoundingClientRect();
              const left = e.clientX - rect.left;
              const top = e.clientY - rect.top;
              gridManagerRef.current?.handleMouseDown(
                { x: left, y: top },
                e.button
              );
            }}
            onMouseUp={(e) => {
              e.preventDefault(); // Prevent default behavior
              const rect = e.currentTarget.getBoundingClientRect();
              const left = e.clientX - rect.left;
              const top = e.clientY - rect.top;
              gridManagerRef.current?.handleMouseUp(
                {
                  x: left,
                  y: top,
                },
                e.button
              );
            }}
            onContextMenu={(e) => {
              e.preventDefault(); // Prevent default context menu
              const rect = e.currentTarget.getBoundingClientRect();
              const left = e.clientX - rect.left;
              const top = e.clientY - rect.top;
              setContextMenuPosition({ x: left, y: top });
            }}
          />
          <dialog
            className="left-0 top-0 absolute w-full h-full bg-transparent"
            id="context-menu"
            open={contextMenuPosition !== null}
            onClose={() => {
              setContextMenuPosition(null); // Close context menu on close
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from propagating to the document
              setContextMenuPosition(null); // Close context menu on click
            }}
            onContextMenu={(e) => {
              e.preventDefault(); // Prevent default context menu
              setContextMenuPosition(null); // Close context menu on right click
            }}
          >
            {contextMenuPosition && (
              <div
                className="absolute flex flex-col items-center justify-between gap-1 
                w-50 bg-background border-gray-300 z-40 p-1 select-none rounded-lg shadow-md"
                style={{
                  top: contextMenuPosition.y,
                  left: contextMenuPosition.x,
                }}
              >
                <Button
                  onClick={() => {
                    gridManagerRef.current?.handleZoom(2, {
                      x: contextMenuPosition.x,
                      y: contextMenuPosition.y,
                    }); // Zoom out on context menu click
                  }}
                  variant="ghost"
                  className="p-2 text-left w-full"
                >
                  <p className="w-full text-left">Zoom in</p>
                  <ZoomIn className="text-gray-500" />
                </Button>
                <Button
                  onClick={() => {
                    gridManagerRef.current?.handleZoom(-2, {
                      x: contextMenuPosition?.x,
                      y: contextMenuPosition?.y,
                    }); // Zoom in on context menu click
                  }}
                  variant="ghost"
                  className="p-2 text-left w-full"
                >
                  <p className="w-full text-left">Zoom out</p>
                  <ZoomOut className="text-gray-500" />
                </Button>
                <Button variant="ghost" className="p-2 text-left w-full">
                  <p className="w-full text-left">Create role</p>
                </Button>
                <div className="w-full px-2">
                  <p className="border-b w-full text-gray-500" />
                </div>
                <Button variant="ghost" className="p-2 text-left w-full">
                  <p className="w-full text-left">View more details</p>
                </Button>
              </div>
            )}
          </dialog>
        </div>
        <CustomScrollbar
          direction="vertical"
          scrollRatio={verticalScrollData.scrollRatio}
          currentScrollPosition={verticalScrollData.currentScrollPosition}
          onThumbMove={(position) => {
            gridManagerRef.current?.handleScrollPosition(position, "vertical");
          }}
        />
      </div>
      <div className="flex flex-row items-center justify-between w-full">
        <CustomScrollbar
          direction="horizontal"
          scrollRatio={horizontalScrollData.scrollRatio}
          currentScrollPosition={horizontalScrollData.currentScrollPosition}
          onThumbMove={(position) => {
            gridManagerRef.current?.handleScrollPosition(
              position,
              "horizontal"
            );
          }}
          className="relative"
        />
        <div className="size-3"></div>
      </div>
    </div>
  );
};

export default MatrixCanvas;
