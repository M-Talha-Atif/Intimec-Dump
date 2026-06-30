import { constrain } from "../../../app/(internal)/applications/[appid]/(details)/access-matrix/util";

const TEXT_SIZE_ROW = 12;
const TEXT_SIZE_COL = 15;

export class GridState {
  private showGridAndLabelsThreshold = 8;
  private highlightedCell: { row: number; col: number } | null = null;
  private offset: { x: number; y: number } = { x: 0, y: 0 }; // Offset for scrolling
  private cellSize: number = 10; // Default cell size
  private dragEnd: { col: number; row: number } | null = null; // For drag operations
  private dragStart: { col: number; row: number } | null = null; // For drag operations
  private mouseData: {
    pos: { x: number; y: number };
    button: number; // 0: left, 1: middle, 2: right
  } | null = null; // For middle mouse scroll
  private middleClickScrollSpeed: { x: number; y: number } = { x: 0, y: 0 }; // Speed of middle mouse scroll
  constructor(
    private canvas: HTMLCanvasElement, // Canvas element for rendering
    private numRows: number = 0, // Number of rows in the grid
    private numCols: number = 0, // Number of columns in the grid
    private setVerticalScrollData: React.Dispatch<
      React.SetStateAction<{
        scrollRatio: number;
        currentScrollPosition: number;
      }>
    >,
    private setHorizontalScrollData: React.Dispatch<
      React.SetStateAction<{
        scrollRatio: number;
        currentScrollPosition: number;
      }>
    >
  ) {
    const gridHeight = this.numRows * this.getCellSize;
    const gridWidth = this.numCols * this.getCellSize;
    this.setVerticalScrollData({
      scrollRatio: this.canvasHeight / gridHeight,
      currentScrollPosition: 0,
    });
    this.setHorizontalScrollData({
      scrollRatio: this.canvasWidth / gridWidth,
      currentScrollPosition: 0,
    });
  }

  // getters for drawing data

  get getOffset() {
    return this.offset;
  }

  get getCellSize() {
    return this.cellSize;
  }

  get showGridAndLabels() {
    return this.getCellSize >= this.showGridAndLabelsThreshold;
  }

  get textSizeRowOffset() {
    return this.showGridAndLabels ? this.getCellSize * TEXT_SIZE_ROW : 0;
  }

  get textSizeColOffset() {
    return this.showGridAndLabels ? this.getCellSize * TEXT_SIZE_COL : 0;
  }

  get canvasWidth() {
    return this.canvas.width;
  }

  get canvasHeight() {
    return this.canvas.height;
  }

  get highlightedCellData() {
    return this.highlightedCell;
  }

  get rowRange() {
    const startRow = Math.max(0, Math.floor(-this.offset.y / this.getCellSize));
    const endRow = Math.min(
      this.numRows,
      Math.ceil(
        (-this.offset.y +
          this.canvasHeight -
          (this.showGridAndLabels ? this.textSizeColOffset : 0)) /
          this.getCellSize
      )
    );
    return { startRow, endRow };
  }

  get colRange() {
    const startCol = Math.max(0, Math.floor(-this.offset.x / this.getCellSize));
    const endCol = Math.min(
      this.numCols,
      Math.ceil(
        (-this.offset.x +
          this.canvasWidth -
          (this.showGridAndLabels ? this.textSizeRowOffset : 0)) /
          this.getCellSize
      )
    );
    return { startCol, endCol };
  }

  // Scrolling methods
  setScrollPosition(direction: "horizontal" | "vertical", position: number) {
    if (direction === "vertical") {
      const gridHeight = this.numRows * this.getCellSize;
      const newY = Math.floor(
        -position *
          (gridHeight -
            this.canvasHeight +
            (this.showGridAndLabels ? this.textSizeColOffset : 0))
      );
      this.setOffset({ x: this.offset.x, y: newY });
    } else if (direction === "horizontal") {
      const gridWidth = this.numCols * this.getCellSize;
      const newX = Math.floor(
        -position *
          (gridWidth -
            this.canvasWidth +
            (this.showGridAndLabels ? this.textSizeRowOffset : 0))
      );
      this.setOffset({ x: newX, y: this.offset.y });
    }
  }
  scrollDown(delta: number) {
    this.setOffset({
      x: this.offset.x,
      y: this.offset.y - delta,
    });
  }
  scrollRight(delta: number) {
    this.setOffset({
      x: this.offset.x - delta,
      y: this.offset.y,
    });
  }

  get getVerticalScrollData() {
    const gridHeight = this.numRows * this.getCellSize;
    const currentScrollPosition =
      -this.offset.y /
      (gridHeight - this.canvasHeight + this.textSizeColOffset + 2);
    return {
      scrollRatio: this.canvasHeight / gridHeight,
      currentScrollPosition,
    };
  }

  get getHorizontalScrollData() {
    const gridWidth = this.numCols * this.getCellSize;
    const currentScrollPosition =
      -this.offset.x /
      (gridWidth - this.canvasWidth + this.textSizeRowOffset + 2);
    return {
      scrollRatio: this.canvasWidth / gridWidth,
      currentScrollPosition,
    };
  }

  // setter for offset with constraints
  setOffset(newOffset: { x: number; y: number }) {
    const gridHeight = this.numRows * this.getCellSize;
    const gridWidth = this.numCols * this.getCellSize;
    const newX = -constrain(
      -newOffset.x,
      0,
      gridWidth - this.canvas.width + this.textSizeRowOffset + 2
    );
    const newY = -constrain(
      -newOffset.y,
      0,
      gridHeight - this.canvas.height + this.textSizeColOffset + 2
    );
    this.offset = { x: newX, y: newY };
    this.setVerticalScrollData(this.getVerticalScrollData);
    this.setHorizontalScrollData(this.getHorizontalScrollData);
  }

  // setter for cell size with constraints
  setCellSize(newCellSize: number) {
    this.cellSize = constrain(newCellSize, 1, 100); // Constrain cell size between 1 and 100
    this.setOffset({
      x: this.offset.x,
      y: this.offset.y,
    });
  }

  getCellAt(mousePos: { x: number; y: number } | null) {
    if (!mousePos) return null; // Return null if mousePos is null
    const cellSize = this.getCellSize;
    const offset = this.getOffset;

    const left =
      mousePos.x - (this.showGridAndLabels ? this.textSizeRowOffset : 0);
    const top =
      mousePos.y - (this.showGridAndLabels ? this.textSizeColOffset : 0);
    const row = Math.floor((top - offset.y) / cellSize);
    const col = Math.floor((left - offset.x) / cellSize);
    if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
      return { row, col };
    }
    return null;
  }

  // ------------------ highlighted cell methods ------------------
  setHighlightedCell(mousePos: { x: number; y: number }) {
    const cell = this.getCellAt(mousePos);
    this.highlightedCell = cell;
  }

  clearHighlightedCell() {
    this.highlightedCell = null;
  }

  resetZoom() {
    this.setCellSize(10); // Reset to default cell size
    this.setOffset({ x: 0, y: 0 }); // Reset offset to top-left corner
    this.clearHighlightedCell(); // Clear highlighted cell
  }

  updateData(numRows: number, numCols: number) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.setVerticalScrollData(this.getVerticalScrollData);
    this.setHorizontalScrollData(this.getHorizontalScrollData);
  }

  // ------------------ drag methods ------------------
  setDragEnd(mousePos: { x: number; y: number }) {
    const cellSize = this.getCellSize;
    const offset = this.getOffset;

    const left =
      mousePos.x - (this.showGridAndLabels ? this.textSizeRowOffset : 0);
    const top =
      mousePos.y - (this.showGridAndLabels ? this.textSizeColOffset : 0);
    let row = Math.floor((top - offset.y) / cellSize);
    let col = Math.floor((left - offset.x) / cellSize);
    col = constrain(col, 0, this.numCols - 1);
    row = constrain(row, 0, this.numRows - 1);
    const cell = { row, col };
    this.dragEnd = cell;
  }
  clearSelectedCells() {
    this.dragEnd = null;
    this.dragStart = null; // Clear drag start position
  }

  get dragStartPosition() {
    if (this.dragEnd === null) {
      return null; // Return null if dragEnd is not set
    } else {
      if (this.dragStart === null) {
        // If dragStart is not set, use the initial mouse position
        this.dragStart = this.getCellAt(
          this.mouseData ? this.mouseData.pos : null
        );
      }
      return this.dragStart; // Return the drag start position
    }
  }
  get dragEndPosition() {
    return this.dragEnd;
  }
  get isDraggingState() {
    return this.dragEnd !== null;
  }

  // ------------------ middle mouse scroll methods ------------------
  endMiddleMouseScroll() {
    this.middleClickScrollSpeed = { x: 0, y: 0 }; // Reset scroll speed
  }
  getInitialMouseData() {
    return this.mouseData;
  }

  // ------------------ middle mouse scroll methods ------------------
  setInitialMouseData(
    mouseData: { pos: { x: number; y: number }; button: number } | null
  ) {
    this.mouseData = mouseData;
  }

  getIsMiddleMouseScrolling() {
    return this.mouseData?.button === 1; // Middle mouse button is button 1
  }

  setMiddleClickScrollSpeed(speed: { x: number; y: number }) {
    this.middleClickScrollSpeed = speed;
  }

  updateState() {
    this.setOffset({
      x: this.offset.x + this.middleClickScrollSpeed.x,
      y: this.offset.y + this.middleClickScrollSpeed.y,
    });
  }
}
