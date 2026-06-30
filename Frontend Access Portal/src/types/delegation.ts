
export interface TaskDelegation {
  id: string;
  userId: string;
  delegateUserId: string;
  delegateName: string;
  startDate: string;
  endDate?: string;
  scopes: ('accessReview' | 'approvalTask' | 'lifecycleRequest' | 'policyViolation')[];
  reason?: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
}

export interface DelegationConfig {
  delegateUserId: string;
  delegateName: string;
  startDate: string;
  endDate?: string;
  scopes: string[];
  reason?: string;
}

export const mockDelegations: TaskDelegation[] = [
  {
    id: 'del_1',
    userId: 'usr_1',
    delegateUserId: 'usr_2',
    delegateName: 'Jane Smith',
    startDate: '2025-01-30',
    endDate: '2025-02-15',
    scopes: ['accessReview', 'approvalTask'],
    reason: 'Vacation',
    createdBy: 'usr_1',
    createdAt: '2025-01-28T10:30:00Z',
    status: 'active'
  }
];

export const isActiveDelegation = (delegation: TaskDelegation): boolean => {
  const now = new Date();
  const start = new Date(delegation.startDate);
  const end = delegation.endDate ? new Date(delegation.endDate) : null;
  
  return delegation.status === 'active' && 
         now >= start && 
         (!end || now <= end);
};

export const getActiveDelegation = (userId: string): TaskDelegation | null => {
  return mockDelegations.find(d => d.userId === userId && isActiveDelegation(d)) || null;
};
