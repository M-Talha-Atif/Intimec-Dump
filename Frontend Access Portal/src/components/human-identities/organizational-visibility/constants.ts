
export const teamTreeData = [
  {
    id: 'mgr_1',
    name: 'David Kim',
    role: 'Engineering Director',
    location: 'New York',
    joinDate: '2022-01-15',
    riskLevel: 'Low',
    accessItems: 35,
    employmentType: 'Full-Time',
    status: 'Active',
    accessDrift: false,
    directReports: [
      {
        id: 'eng_1',
        name: 'Sarah Johnson',
        role: 'Senior Software Engineer',
        location: 'New York',
        joinDate: '2023-03-10',
        riskLevel: 'Medium',
        accessLevel: 'Standard',
        accessItems: 24,
        employmentType: 'Full-Time',
        status: 'Active',
        accessDrift: true
      },
      {
        id: 'eng_2',
        name: 'Mike Chen',
        role: 'Software Engineer',
        location: 'Remote',
        joinDate: '2023-08-20',
        riskLevel: 'Low',
        accessLevel: 'Standard',
        accessItems: 18,
        employmentType: 'Contract',
        status: 'Active',
        accessDrift: false
      }
    ],
    crossDepartmental: [
      {
        id: 'cross_1',
        name: 'Lisa Wang',
        role: 'DevOps Engineer',
        department: 'Infrastructure',
        location: 'San Francisco',
        riskLevel: 'High',
        accessLevel: 'Privileged',
        accessItems: 42,
        employmentType: 'Full-Time',
        status: 'Active',
        accessDrift: true
      }
    ]
  }
];

export const smartInsights = [
  {
    id: 'insight_1',
    type: 'warning',
    message: '3 Reports have no active access certifications',
    count: 3,
    action: 'Review Access'
  },
  {
    id: 'insight_2',
    type: 'error',
    message: '1 Report lacks a manager assignment',
    count: 1,
    action: 'Assign Manager'
  },
  {
    id: 'insight_3',
    type: 'info',
    message: '2 Delegations expire within 7 days',
    count: 2,
    action: 'Extend Delegation'
  }
];
