import { GridState } from "./GridState";

const GRID_COLOR = "#d1d5dc";
const TEXT_COLOR = "#000";
const BACKGROUND_COLOR = "#fff";
const HIGHLIGHT_CELL_COLOR = "rgba(0, 0, 0, 0.4)"; // Highlight color
function isDarkMode(element: HTMLElement): boolean {
  return element.closest(".dark") !== null;
}

function withOpacity(color: string, alpha: number): string {
  // If the color already has an alpha ("/ ..."), strip it
  const base = color.replace(/\/\s*[\d.]+\s*\)?$/, ")").trim();

  // If it already ends with ")", insert before it
  if (base.endsWith(")")) {
    return base.replace(/\)$/, ` / ${alpha})`);
  }

  return `${base} / ${alpha}`;
}
export class GridRenderer {
  private gridColor: string =
    withOpacity(getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")
      .trim() || GRID_COLOR,0.3);

  private textColor: string =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-black")
      .trim() || TEXT_COLOR;

  private backgroundColor: string =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--muted")
      .trim() || BACKGROUND_COLOR;

  private highlightColor: string = HIGHLIGHT_CELL_COLOR;
  private textPadding: number = 10; // Padding for text labels
  constructor(
    private ctx: CanvasRenderingContext2D,
    private links: { col: number; row: number }[],
    private rowLabels: string[],
    private colLabels: string[],
    private gridState: GridState
  ) {
    this.textColor = isDarkMode(document.body) ? "#fff" : "#000";
    this.highlightColor = isDarkMode(document.body)
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";
  }

  private drawCells() {
    this.ctx.save();
    const { startRow, endRow } = this.gridState.rowRange;
    const { startCol, endCol } = this.gridState.colRange;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const cellSize = this.gridState.getCellSize;
    const brandColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "#428C95";

    this.ctx.fillStyle = brandColor;
    this.ctx.translate(offset.x, offset.y);
    if (this.gridState.showGridAndLabels)
      this.ctx.translate(
        this.gridState.textSizeRowOffset,
        this.gridState.textSizeColOffset
      );
    this.ctx.beginPath();
    this.links.forEach(({ row, col }) => {
      if (row < startRow || row >= endRow || col < startCol || col >= endCol)
        return;
      this.ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
    });
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  private drawGridLines() {
    const { startRow, endRow } = this.gridState.rowRange;
    const { startCol, endCol } = this.gridState.colRange;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const cellSize = this.gridState.getCellSize;
    const canvasWidth = this.gridState.canvasWidth;
    const canvasHeight = this.gridState.canvasHeight;
    this.ctx.save();
    this.ctx.strokeStyle = this.gridColor; // Light gray for grid lines
    this.ctx.lineWidth = 1;
    this.ctx.translate(0.5, 0.5); // For crisp lines
    this.ctx.translate(
      this.gridState.textSizeRowOffset,
      this.gridState.textSizeColOffset
    );
    this.ctx.beginPath();
    for (let i = startRow + 1; i <= endRow; i++) {
      this.ctx.moveTo(0, i * cellSize + offset.y);
      this.ctx.lineTo(canvasWidth, i * cellSize + offset.y);
    }
    for (let j = startCol + 1; j <= endCol; j++) {
      this.ctx.moveTo(j * cellSize + offset.x, 0);
      this.ctx.lineTo(j * cellSize + offset.x, canvasHeight);
    }
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }

  private drawHighlightedTextBackground() {
    const highlightedCell = this.gridState.highlightedCellData;
    if (!highlightedCell) return;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const cellSize = this.gridState.getCellSize;

    this.ctx.save();
    this.ctx.fillStyle = this.highlightColor; // Highlight color
    this.ctx.beginPath();
    // column background
    this.ctx.rect(
      highlightedCell.col * cellSize +
        offset.x +
        this.gridState.textSizeRowOffset +
        1,
      0,
      cellSize - 1,
      this.gridState.textSizeColOffset
    );
    // row background
    this.ctx.rect(
      0,
      highlightedCell.row * cellSize +
        offset.y +
        this.gridState.textSizeColOffset +
        1,
      this.gridState.textSizeRowOffset,
      cellSize - 1
    );
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  private drawTextLabels() {
    const { startRow, endRow } = this.gridState.rowRange;
    const { startCol, endCol } = this.gridState.colRange;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const cellSize = this.gridState.getCellSize;
    const { textSizeRowOffset, textSizeColOffset } = this.gridState;
    this.ctx.save();
    this.ctx.font = `${Math.ceil(cellSize * 0.8)}px Inter`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = this.textColor; // Black color for text
    for (let i = startRow; i < endRow; i++) {
      this.ctx.fillText(
        `${this.rowLabels[i]} ${i + 1}`,
        this.textPadding,
        i * cellSize + cellSize / 2 + offset.y + textSizeColOffset
      );
    }

    this.ctx.save();
    this.ctx.rotate(-Math.PI / 2); // Rotate text for column labels
    for (let i = startCol; i < endCol; i++) {
      this.ctx.fillText(
        `${this.colLabels[i]} ${i + 1}`,
        -textSizeColOffset + this.textPadding,
        i * cellSize + cellSize / 2 + offset.x + textSizeRowOffset
      );
    }
    this.ctx.restore();
    this.ctx.restore();
  }

  private drawTopLeftBox() {
    const { textSizeRowOffset, textSizeColOffset } = this.gridState;
    this.ctx.save();
    this.ctx.strokeStyle = this.gridColor; // Light gray for grid lines
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = this.backgroundColor; // Black color for text
    this.ctx.beginPath();
    this.ctx.rect(-1, -1, textSizeRowOffset + 1.5, textSizeColOffset + 1.5);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }

  private drawTextBackground() {
    const cellSize = this.gridState.getCellSize;
    const { startRow, endRow } = this.gridState.rowRange;
    const { startCol, endCol } = this.gridState.colRange;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const { textSizeRowOffset, textSizeColOffset } = this.gridState;
    this.ctx.save();
    this.ctx.strokeStyle = this.gridColor; // Light gray for grid lines
    this.ctx.lineWidth = 1;
    this.ctx.translate(-0.5, -0.5); // For crisp lines
    this.ctx.beginPath();
    for (let col = startCol; col <= endCol; col++) {
      this.ctx.rect(
        col * cellSize + offset.x + textSizeRowOffset + 1,
        0,
        cellSize,
        textSizeColOffset + 1
      );
    }
    for (let row = startRow; row <= endRow; row++) {
      this.ctx.rect(
        0,
        row * cellSize + offset.y + textSizeColOffset + 1,
        textSizeRowOffset + 1,
        cellSize
      );
    }
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fill();
    this.ctx.fillStyle = this.textColor;
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }

  private drawHighlightedCells() {
    const highlightedCell = this.gridState.highlightedCellData;
    const offset = {
      x: Math.floor(this.gridState.getOffset.x),
      y: Math.floor(this.gridState.getOffset.y),
    };
    const cellSize = this.gridState.getCellSize;
    const showGridAndLabels = this.gridState.showGridAndLabels;
    const { textSizeRowOffset, textSizeColOffset } = this.gridState;

    const { dragStartPosition, dragEndPosition } = this.gridState;

    const { startRow, endRow } = this.gridState.rowRange;
    const { startCol, endCol } = this.gridState.colRange;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = this.highlightColor; // Highlight color
    this.ctx.translate(offset.x, offset.y);
    const gridOffset = showGridAndLabels ? 1 : 0;
    if (showGridAndLabels)
      this.ctx.translate(textSizeRowOffset, textSizeColOffset);
    if (highlightedCell) {
      this.ctx.rect(
        highlightedCell.col * cellSize + gridOffset,
        highlightedCell.row * cellSize + gridOffset,
        cellSize - gridOffset,
        cellSize - gridOffset
      );
      this.ctx.fill();
    }
    if (dragStartPosition && dragEndPosition) {
      const minDragX = Math.max(
        Math.min(dragStartPosition.col, dragEndPosition.col),
        startCol
      );

      const minDragY = Math.max(
        Math.min(dragStartPosition.row, dragEndPosition.row),
        startRow
      );
      const maxDragX = Math.min(
        Math.max(dragStartPosition.col, dragEndPosition.col),
        endCol
      );
      const maxDragY = Math.min(
        Math.max(dragStartPosition.row, dragEndPosition.row),
        endRow
      );
      this.ctx.rect(
        minDragX * cellSize + gridOffset,
        minDragY * cellSize + gridOffset,
        (maxDragX - minDragX + 1) * cellSize - gridOffset,
        (maxDragY - minDragY + 1) * cellSize - gridOffset
      );
    }
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  draw() {
    const { canvasWidth, canvasHeight } = this.gridState;
    const showGridAndLabels = this.gridState.showGridAndLabels;
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.resetTransform(); // Reset any transformations

    this.drawCells();
    if (showGridAndLabels) {
      this.drawGridLines();
    }
    this.drawHighlightedCells();
    if (showGridAndLabels) {
      this.drawTextBackground();
      this.drawHighlightedTextBackground();
      this.drawTextLabels();
      this.drawTopLeftBox();
    }
  }

  updateData(
    rowLabels: string[],
    colLabels: string[],
    numRows: number,
    numCols: number,
    links: { col: number; row: number }[]
  ) {
    this.rowLabels = rowLabels;
    this.colLabels = colLabels;
    this.links = links;
    // Redraw the grid with the new data
    this.draw();
  }
}
