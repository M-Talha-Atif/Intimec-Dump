import { GridState } from "./GridState";
import { GridRenderer } from "./GridRenderer";
import { GridHandler } from "./GridHandler";

export class GridManager {
  private gridState: GridState;
  private gridRenderer: GridRenderer;
  private gridHandler: GridHandler;

  constructor(
    canvas: HTMLCanvasElement,
    rowLabels: string[],
    colLabels: string[],
    numRows: number,
    numCols: number,
    links: { col: number; row: number }[],
    setVerticalScrollData: React.Dispatch<
      React.SetStateAction<{
        scrollRatio: number;
        currentScrollPosition: number;
      }>
    >,
    setHorizontalScrollData: React.Dispatch<
      React.SetStateAction<{
        scrollRatio: number;
        currentScrollPosition: number;
      }>
    >,
    onCellClickCallback: (row: number, col: number) => void = () => {}
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    this.gridState = new GridState(
      canvas,
      numRows,
      numCols,
      setVerticalScrollData,
      setHorizontalScrollData
    );
    this.gridRenderer = new GridRenderer(
      ctx,
      links,
      rowLabels,
      colLabels,
      this.gridState
    );
    this.gridHandler = new GridHandler(this.gridState, onCellClickCallback);
  }

  handleMouseHover(mousePos: { x: number; y: number }) {
    this.gridHandler.handleMouseHover(mousePos);
    this.gridRenderer.draw();
  }
  handleMouseExit() {
    this.gridHandler.handleMouseExit();
    this.gridRenderer.draw();
  }
  handleMouseScroll(
    direction: "vertical" | "horizontal",
    delta: number,
    mousePos?: { x: number; y: number }
  ) {
    this.gridHandler.handleMouseScroll(direction, delta);
    if (mousePos) this.gridHandler.handleMouseHover(mousePos);
    this.gridRenderer.draw();
  }
  handleScrollPosition(
    scrollTop: number,
    direction: "vertical" | "horizontal"
  ) {
    this.gridHandler.handleScrollPosition(scrollTop, direction);
    this.gridRenderer.draw();
  }
  draw() {
    this.gridState.updateState();
    this.gridRenderer.draw();
  }
  handleZoom(zoomAmount: number, mousePos?: { x: number; y: number }) {
    this.gridHandler.handleZoom(zoomAmount, mousePos);
    this.gridRenderer.draw();
  }
  resetZoom() {
    this.gridState.resetZoom();
    this.gridRenderer.draw(); // Redraw the grid
  }
  getVerticalScrollData() {
    return this.gridState.getVerticalScrollData;
  }
  getHorizontalScrollData() {
    return this.gridState.getHorizontalScrollData;
  }

  updateData(
    rowLabels: string[],
    colLabels: string[],
    numRows: number,
    numCols: number,
    links: { col: number; row: number }[]
  ) {
    this.gridState.updateData(numRows, numCols);
    this.gridRenderer.updateData(rowLabels, colLabels, numRows, numCols, links);
  }
  handleMouseDown(mousePos: { x: number; y: number }, button: number) {
    this.gridHandler.handleMouseDown(mousePos, button);
  }
  handleMouseUp(mousePos: { x: number; y: number }, button: number) {
    this.gridHandler.handleMouseUp(mousePos, button);
  }
}
