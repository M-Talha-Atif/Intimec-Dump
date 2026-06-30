
export interface BulkActionData {
  reassignTo: string;
  bulkNote: string;
  bulkTag: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getActionData = (action: string, data: BulkActionData): any => {
  switch (action) {
    case 'reassign':
      return { newAssignee: data.reassignTo, note: data.bulkNote };
    case 'addNote':
      return { note: data.bulkNote };
    case 'addTag':
      return { tag: data.bulkTag };
    default:
      return undefined;
  }
};

export const canExecuteAction = (action: string, data: BulkActionData): boolean => {
  switch (action) {
    case 'reassign':
      return data.reassignTo.trim().length > 0;
    case 'addNote':
      return data.bulkNote.trim().length > 0;
    case 'addTag':
      return data.bulkTag.length > 0;
    default:
      return true;
  }
};
