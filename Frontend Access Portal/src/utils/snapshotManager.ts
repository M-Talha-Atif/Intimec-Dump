import { OrgNodeData } from '@/types/organization';
import { HistoricalSnapshot } from '@/data/mock-historical-snapshots';

const STORAGE_KEY = 'org_snapshots';

export function saveSnapshot(
  data: OrgNodeData,
  label: string,
  description: string
): HistoricalSnapshot {
  const snapshot: HistoricalSnapshot = {
    id: `snapshot-${Date.now()}`,
    date: new Date().toISOString(),
    label,
    description,
    data: JSON.parse(JSON.stringify(data)), // Deep clone
  };

  const snapshots = loadSnapshots();
  snapshots.push(snapshot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));

  return snapshot;
}

export function loadSnapshots(): HistoricalSnapshot[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading snapshots:', error);
    return [];
  }
}

export function deleteSnapshot(id: string): void {
  const snapshots = loadSnapshots();
  const filtered = snapshots.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getSnapshot(id: string): HistoricalSnapshot | undefined {
  const snapshots = loadSnapshots();
  return snapshots.find(s => s.id === id);
}
