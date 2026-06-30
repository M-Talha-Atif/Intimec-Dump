export interface Identity {
  id: string;
  name: string;
  email: string;
  type: 'employee' | 'non-employee' | 'non-human';
  department?: string;
  riskScore: number;
  status?: 'active' | 'inactive';
  title?: string;
}

export interface SearchIdentitiesParams {
  query?: string;
  type?: 'employee' | 'non-employee' | 'non-human';
  page?: number;
  pageSize?: number;
}

export interface SearchIdentitiesResponse {
  identities: Identity[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchIdentities(params: SearchIdentitiesParams = {}): Promise<SearchIdentitiesResponse> {
  // Simulated API call - replace with actual backend
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockIdentities: Identity[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      type: 'employee',
      department: 'Engineering',
      riskScore: 45,
      status: 'active',
      title: 'Senior Engineer'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      type: 'employee',
      department: 'Engineering',
      riskScore: 32,
      status: 'active',
      title: 'Lead Engineer'
    },
    {
      id: '3',
      name: 'Carol White',
      email: 'carol@company.com',
      type: 'employee',
      department: 'Finance',
      riskScore: 28,
      status: 'active',
      title: 'Finance Manager'
    },
    {
      id: '4',
      name: 'Dave Brown (Contractor)',
      email: 'dave@contractor.com',
      type: 'non-employee',
      department: 'Marketing',
      riskScore: 55,
      status: 'active'
    },
    {
      id: '5',
      name: 'API_Service_Account_1',
      email: 'api-service@company.com',
      type: 'non-human',
      department: 'IT',
      riskScore: 70,
      status: 'active'
    }
  ];

  let filtered = [...mockIdentities];
  
  if (params.query) {
    const term = params.query.toLowerCase();
    filtered = filtered.filter(i => 
      i.name.toLowerCase().includes(term) || 
      i.email.toLowerCase().includes(term) ||
      i.department?.toLowerCase().includes(term)
    );
  }
  
  if (params.type) {
    filtered = filtered.filter(i => i.type === params.type);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    identities: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize
  };
}
