import { UserProfile, PeerData } from '@/types/access-portal';

export const mockCurrentUser: UserProfile = {
  id: 'user-current',
  name: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  department: 'Engineering',
  role: 'Senior Software Engineer',
  manager: 'David Kim',
  joinDate: '2022-03-15',
};

export const mockPeerData: PeerData[] = [
  {
    userId: 'peer-1',
    userName: 'Mike Johnson',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    accessItems: ['app-1', 'app-2', 'role-2', 'group-1'],
    recentRequests: ['Jira Admin', 'GitHub Enterprise'],
  },
  {
    userId: 'peer-2',
    userName: 'Emily Davis',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    accessItems: ['app-1', 'app-2', 'ent-1'],
    recentRequests: ['Confluence Wiki', 'AWS Console'],
  },
  {
    userId: 'peer-3',
    userName: 'Alex Rodriguez',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    accessItems: ['app-1', 'role-2', 'group-1'],
    recentRequests: ['Salesforce CRM', 'Tableau'],
  },
];
