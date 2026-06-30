"use client"


import React from 'react';
import { SoDPoliciesContent } from '@/components/sod-policies/SoDPoliciesContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const SoDPoliciesPage = () => {
  useDocumentTitle('SoD Policies');
  return <SoDPoliciesContent />;
};

export default SoDPoliciesPage;

