import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface UseWorkflowHistoryResult {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => { nodes: Node[]; edges: Edge[] } | null;
  redo: () => { nodes: Node[]; edges: Edge[] } | null;
  pushState: (nodes: Node[], edges: Edge[]) => void;
  clear: () => void;
  reset: (nodes: Node[], edges: Edge[]) => void;
}

const MAX_HISTORY_SIZE = 50;

export const useWorkflowHistory = (
  initialNodes: Node[] = [],
  initialEdges: Edge[] = []
): UseWorkflowHistoryResult => {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushState = useCallback((nodes: Node[], edges: Edge[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        timestamp: Date.now()
      });

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
        return newHistory;
      }

      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (!canUndo) return null;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return {
      nodes: JSON.parse(JSON.stringify(history[newIndex].nodes)),
      edges: JSON.parse(JSON.stringify(history[newIndex].edges))
    };
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return null;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return {
      nodes: JSON.parse(JSON.stringify(history[newIndex].nodes)),
      edges: JSON.parse(JSON.stringify(history[newIndex].edges))
    };
  }, [canRedo, currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([{ nodes: [], edges: [], timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, []);

  const reset = useCallback((nodes: Node[], edges: Edge[]) => {
    setHistory([{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clear,
    reset
  };
};
