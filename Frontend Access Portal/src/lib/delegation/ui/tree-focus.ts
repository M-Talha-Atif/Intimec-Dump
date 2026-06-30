
type TreeFocusListener = (nodeId: string) => void;

class TreeFocusManager {
  private listeners: TreeFocusListener[] = [];
  private currentFocusNodeId: string | null = null;

  subscribe(listener: TreeFocusListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  focusNode(nodeId: string): void {
    this.currentFocusNodeId = nodeId;
    this.listeners.forEach(listener => listener(nodeId));
  }

  getCurrentFocusNodeId(): string | null {
    return this.currentFocusNodeId;
  }

  clearFocus(): void {
    this.currentFocusNodeId = null;
  }
}

export const treeFocusManager = new TreeFocusManager();
