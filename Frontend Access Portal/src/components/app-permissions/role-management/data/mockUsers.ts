export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  manager: string;
  lastLogin: string;
  status: "active" | "inactive";
  location: string;
}

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "IT",
    title: "Senior Developer",
    manager: "Sarah Wilson",
    lastLogin: "2024-03-15T09:30:00Z",
    status: "active",
    location: "New York",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Security",
    title: "Security Analyst",
    manager: "Mike Jones",
    lastLogin: "2024-03-14T14:15:00Z",
    status: "active",
    location: "London",
  },
  {
    id: "user-3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Finance",
    title: "Financial Controller",
    manager: "Lisa Brown",
    lastLogin: "2024-03-13T11:20:00Z",
    status: "active",
    location: "Toronto",
  },
  {
    id: "user-4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "IT",
    title: "Engineering Manager",
    manager: "David Chen",
    lastLogin: "2024-03-15T08:45:00Z",
    status: "active",
    location: "New York",
  },
  {
    id: "user-5",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    department: "Marketing",
    title: "Marketing Specialist",
    manager: "Emma Davis",
    lastLogin: "2024-03-12T16:30:00Z",
    status: "inactive",
    location: "San Francisco",
  },
  {
    id: "user-6",
    name: "Emma Davis",
    email: "emma.davis@company.com",
    department: "Marketing",
    title: "Marketing Director",
    manager: "David Chen",
    lastLogin: "2024-03-15T10:15:00Z",
    status: "active",
    location: "San Francisco",
  },
];
