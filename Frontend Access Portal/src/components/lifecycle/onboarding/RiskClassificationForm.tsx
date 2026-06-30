
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react';

interface RiskClassificationFormProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
  data: any;
  onChange: (data: any) => void;
}

export function RiskClassificationForm({ identityType, data, onChange }: RiskClassificationFormProps) {
  const [formData, setFormData] = useState({
    riskLevel: '',
    dataClassification: '',
    accessScope: '',
    complianceRequirements: [],
    securityClearance: '',
    notes: '',
    riskFactors: [],
    mitigationMeasures: [],
    ...data
  });

  const [calculatedRisk, setCalculatedRisk] = useState('medium');
  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  useEffect(() => {
    // Calculate risk based on various factors
    const factors = [];
    let riskScore = 0;

    if (identityType === 'non-employee') {
      factors.push('External Identity');
      riskScore += 2;
    }

    if (identityType === 'non-human') {
      factors.push('Automated Access');
      riskScore += 1;
    }

    if (formData.dataClassification === 'highly-confidential') {
      factors.push('Highly Confidential Data Access');
      riskScore += 3;
    }

    if (formData.accessScope === 'privileged') {
      factors.push('Privileged Access Required');
      riskScore += 3;
    }

    if (formData.complianceRequirements?.includes('sox')) {
      factors.push('SOX Compliance Required');
      riskScore += 2;
    }

    if (formData.complianceRequirements?.includes('pci')) {
      factors.push('PCI Compliance Required');
      riskScore += 2;
    }

    // Determine risk level
    let calculatedLevel = 'low';
    if (riskScore >= 6) {
      calculatedLevel = 'high';
    } else if (riskScore >= 3) {
      calculatedLevel = 'medium';
    }

    setCalculatedRisk(calculatedLevel);
    setRiskFactors(factors);
  }, [formData, identityType]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComplianceChange = (requirement: string, checked: boolean) => {
    const current = formData.complianceRequirements || [];
    const updated = checked
      ? [...current, requirement]
      : current.filter(req => req !== requirement);
    
    handleInputChange('complianceRequirements', updated);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return Info;
      case 'high': return AlertTriangle;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Classification</span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Assess and classify the risk profile for this identity
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataClassification">Data Classification Level</Label>
              <Select onValueChange={(value) => handleInputChange('dataClassification', value)}>
                <SelectTrigger id="dataClassification">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="highly-confidential">Highly Confidential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessScope">Access Scope</Label>
              <Select onValueChange={(value) => handleInputChange('accessScope', value)}>
                <SelectTrigger id="accessScope">
                  <SelectValue placeholder="Select access scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard User</SelectItem>
                  <SelectItem value="elevated">Elevated Access</SelectItem>
                  <SelectItem value="privileged">Privileged Access</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Security Clearance (for applicable identity types) */}
          {identityType !== 'non-human' && (
            <div className="space-y-2">
              <Label htmlFor="securityClearance">Security Clearance</Label>
              <Select onValueChange={(value) => handleInputChange('securityClearance', value)}>
                <SelectTrigger id="securityClearance">
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None Required</SelectItem>
                  <SelectItem value="basic">Basic Background Check</SelectItem>
                  <SelectItem value="enhanced">Enhanced Screening</SelectItem>
                  <SelectItem value="security">Security Clearance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compliance Requirements */}
          <div className="space-y-3">
            <Label>Compliance Requirements</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'sox', label: 'SOX' },
                { id: 'pci', label: 'PCI-DSS' },
                { id: 'hipaa', label: 'HIPAA' },
                { id: 'gdpr', label: 'GDPR' },
                { id: 'iso27001', label: 'ISO 27001' },
                { id: 'fips', label: 'FIPS' }
              ].map((req) => (
                <label key={req.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.complianceRequirements?.includes(req.id) || false}
                    onChange={(e) => handleComplianceChange(req.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{req.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Automated Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calculated Risk Level */}
            <div className={`p-4 rounded-lg border ${getRiskLevelColor(calculatedRisk)}`}>
              <div className="flex items-center space-x-2">
                {React.createElement(getRiskIcon(calculatedRisk), { className: "h-5 w-5" })}
                <div>
                  <div className="font-medium">
                    Calculated Risk Level: <span className="capitalize">{calculatedRisk}</span>
                  </div>
                  <div className="text-sm opacity-80 mt-1">
                    Based on identity type, data classification, and access requirements
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Identified Risk Factors:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {riskFactors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Risk Override */}
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Manual Risk Override (Optional)</Label>
              <Select onValueChange={(value) => handleInputChange('riskLevel', value)}>
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Override calculated risk if needed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Notes & Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Risk Assessment Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional risk considerations, special requirements, or notes for reviewers..."
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* High Risk Warning */}
      {(calculatedRisk === 'high' || formData.riskLevel === 'high' || formData.riskLevel === 'critical') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>High Risk Identity Detected:</strong> This identity requires additional approval workflows and enhanced monitoring. 
            Security team review will be mandatory before provisioning.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
