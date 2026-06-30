import { GridState } from "./GridState";

export class GridHandler {
  private zoomAccumulator: number = 0; // Accumulator for zoom level changes
  constructor(
    private gridState: GridState,
    private onCellClickCallback: (row: number, col: number) => void
  ) {}

  handleMouseExit() {
    this.gridState.clearHighlightedCell();
    this.gridState.clearSelectedCells();
  }

  handleMouseScroll(direction: "vertical" | "horizontal", delta: number) {
    if (direction === "vertical") {
      this.gridState.scrollDown(delta);
    } else {
      this.gridState.scrollRight(delta);
    }
  }

  handleScrollPosition(
    scrollTop: number,
    direction: "vertical" | "horizontal"
  ) {
    this.gridState.setScrollPosition(direction, scrollTop);
  }

  handleZoom(zoomAmount: number, mousePos?: { x: number; y: number }) {
    this.zoomAccumulator += zoomAmount;
    let steps = 0;
    while (this.zoomAccumulator >= 1) {
      steps++;
      this.zoomAccumulator -= 1;
    }
    while (this.zoomAccumulator <= -1) {
      steps--;
      this.zoomAccumulator += 1;
    }
    if (steps === 0) return; // No zoom change needed

    const oldCellSize = this.gridState.getCellSize;
    const hadLabelsShown = this.gridState.showGridAndLabels;
    this.gridState.setCellSize(oldCellSize + steps);
    const newCellSize = this.gridState.getCellSize;
    const hasLabelsShown = this.gridState.showGridAndLabels;
    if (mousePos) {
      const worldX = (mousePos.x - this.gridState.getOffset.x) / oldCellSize;
      const worldY = (mousePos.y - this.gridState.getOffset.y) / oldCellSize;
      if (hasLabelsShown != hadLabelsShown) {
        this.gridState.setOffset({
          x:
            mousePos.x -
            worldX * newCellSize -
            this.gridState.textSizeRowOffset,
          y:
            mousePos.y -
            worldY * newCellSize -
            this.gridState.textSizeColOffset,
        });
      } else {
        const newOffset = {
          x: mousePos.x - worldX * newCellSize,
          y: mousePos.y - worldY * newCellSize,
        };
        this.gridState.setOffset(newOffset);
      }
    }
  }

  handleMouseDown(mousePos: { x: number; y: number }, button: number) {
    this.gridState.setInitialMouseData({
      pos: mousePos,
      button: button,
    });
    if (button == 0) this.gridState.clearSelectedCells();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMouseUp(mousePos: { x: number; y: number }, button: number) {
    const initialMouseData = this.gridState.getInitialMouseData();
    if (initialMouseData) {
      if (initialMouseData.button === 0 && !this.gridState.dragEndPosition) {
        const cell = this.gridState.getCellAt(mousePos);
        if (cell) {
          this.onCellClickCallback(cell.row, cell.col);
        }
      }
      if (initialMouseData.button === 1) {
        this.gridState.endMiddleMouseScroll();
      }
    }
    this.gridState.setInitialMouseData(null);
  }

  handleMouseHover({ x, y }: { x: number; y: number }) {
    this.gridState.setHighlightedCell({ x, y });
    const initialMouseData = this.gridState.getInitialMouseData();
    if (!initialMouseData) return; // No initial mouse position set
    const deltaX = x - initialMouseData.pos.x;
    const deltaY = y - initialMouseData.pos.y;
    const cellSize = this.gridState.getCellSize;
    if (initialMouseData.button === 1) {
      // Middle mouse button is pressed, scroll the grid
      this.gridState.setMiddleClickScrollSpeed({
        x: -deltaX / 10,
        y: -deltaY / 10,
      });
    }

    if (
      initialMouseData.button === 0 &&
      (Math.abs(deltaX) > cellSize || Math.abs(deltaY) > cellSize)
    ) {
      this.gridState.setDragEnd({ x, y });
    }
  }
}
