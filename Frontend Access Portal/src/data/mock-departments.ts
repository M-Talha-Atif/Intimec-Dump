export interface Department {
  id: string;
  name: string;
  businessUnit: string;
  manager: string;
  status: 'Active' | 'Inactive';
}

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Finance', businessUnit: 'Finance', manager: 'Alice Johnson', status: 'Active' },
  { id: 'dept-2', name: 'Human Resources', businessUnit: 'HR', manager: 'Bob Williams', status: 'Active' },
  { id: 'dept-3', name: 'IT', businessUnit: 'Engineering', manager: 'Grace Hopper', status: 'Active' },
  { id: 'dept-4', name: 'Marketing', businessUnit: 'Marketing', manager: 'Charlie Brown', status: 'Active' },
  { id: 'dept-5', name: 'Sales', businessUnit: 'Sales', manager: 'Diana Prince', status: 'Active' },
  { id: 'dept-6', name: 'Legal', businessUnit: 'Legal', manager: 'Eve Davis', status: 'Active' },
  { id: 'dept-7', name: 'Operations', businessUnit: 'Operations', manager: 'David Chen', status: 'Active' },
  { id: 'dept-8', name: 'Customer Support', businessUnit: 'Support', manager: 'Frank Moore', status: 'Active' },
  { id: 'dept-9', name: 'Research & Development', businessUnit: 'R&D', manager: 'Hannah Lee', status: 'Active' },
  { id: 'dept-10', name: 'Procurement', businessUnit: 'Operations', manager: 'Ian King', status: 'Active' },
];
