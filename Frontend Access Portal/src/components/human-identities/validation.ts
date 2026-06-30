
import { EmployeeIdentityFormData, EmployeeIdentityValidationErrors } from './types';

export const validateEmployeeIdentityStep = (step: number, formData: EmployeeIdentityFormData): EmployeeIdentityValidationErrors => {
  const errors: EmployeeIdentityValidationErrors = {};
  
  if (step === 0) {
    // Basic Information validation
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.employeeId) errors.employeeId = 'Employee ID is required';
    
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Invalid email format';
    }
  }
  
  if (step === 1) {
    // Employment Details validation
    if (!formData.employmentType) errors.employmentType = 'Employment type is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.manager) errors.manager = 'Manager is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.jobTitle) errors.jobTitle = 'Job title is required';
    if (!formData.jobLevel) errors.jobLevel = 'Job level is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.workLocation) errors.workLocation = 'Work location is required';
    
    // Probation validation for certain employment types
    if (formData.employmentType === 'full-time' && !formData.probationEnd) {
      errors.probationEnd = 'Probation end date is required for full-time employees';
    }
  }
  
  return errors;
};

export const calculateEmployeeRiskScore = (employee: any): number => {
  let score = 0;
  
  // Base risk factors
  if (employee.isPrivileged) score += 30;
  if (employee.isOrphan) score += 40;
  if (employee.status === 'Suspended') score += 50;
  if (employee.lastLogin && new Date(employee.lastLogin) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) score += 25;
  
  // Access-based risk
  if (employee.accessCount > 50) score += 20;
  if (employee.riskFactors?.length > 3) score += 15;
  
  // Manager-related risk
  if (employee.manager === 'N/A' || employee.manager === 'Former Employee') score += 35;
  
  return Math.min(score, 100);
};

export const calculateTeamRiskScore = (teamMembers: any[]): number => {
  if (teamMembers.length === 0) return 0;
  
  const totalRisk = teamMembers.reduce((sum, member) => sum + calculateEmployeeRiskScore(member), 0);
  return Math.round(totalRisk / teamMembers.length);
};
