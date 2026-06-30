
import { FormData, ValidationErrors } from './types';

export const validateStep = (step: number, formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (step === 0) {
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.type) errors.type = 'Identity type is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    
    // Policy validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff > 180) {
        errors.endDate = 'Contract duration cannot exceed 180 days';
      }
    }
    
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Invalid email format';
    }
  }
  
  if (step === 1) {
    if (!formData.sponsor) errors.sponsor = 'Primary sponsor is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.justification) errors.justification = 'Business justification is required';
  }
  
  return errors;
};
