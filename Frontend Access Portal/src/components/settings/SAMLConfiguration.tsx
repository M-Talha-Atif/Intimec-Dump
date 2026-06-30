
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SAMLConfiguration = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    idpEntityId: 'https://idp.company.com/saml',
    singleSignOnUrl: 'https://idp.company.com/saml/sso',
    singleLogoutUrl: 'https://idp.company.com/saml/slo',
    nameIdFormat: 'Persistent',
    certificate: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'
  });

  const steps = [
    { number: 1, title: 'Provider Selection' },
    { number: 2, title: 'Identity Provider Settings', active: true },
    { number: 3, title: 'Attribute Mapping' },
    { number: 4, title: 'Review & Test' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configure SAML 2.0</h2>
        <p className="text-slate-600">Enter your SAML configuration details</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.number <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step.number < currentStep ? 'bg-blue-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
        <span className="ml-4 text-sm text-slate-500">Step {currentStep} of 4</span>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Provider Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idpEntityId">IdP Entity ID *</Label>
            <Input
              id="idpEntityId"
              value={formData.idpEntityId}
              onChange={(e) => setFormData({...formData, idpEntityId: e.target.value})}
              placeholder="https://idp.company.com/saml"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="singleSignOnUrl">Single Sign-On URL *</Label>
            <Input
              id="singleSignOnUrl"
              value={formData.singleSignOnUrl}
              onChange={(e) => setFormData({...formData, singleSignOnUrl: e.target.value})}
              placeholder="https://idp.company.com/saml/sso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="singleLogoutUrl">Single Logout URL</Label>
            <Input
              id="singleLogoutUrl"
              value={formData.singleLogoutUrl}
              onChange={(e) => setFormData({...formData, singleLogoutUrl: e.target.value})}
              placeholder="https://idp.company.com/saml/slo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameIdFormat">NameID Format</Label>
            <Select value={formData.nameIdFormat} onValueChange={(value) => setFormData({...formData, nameIdFormat: value})}>
              <SelectTrigger id="nameIdFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Persistent">Persistent</SelectItem>
                <SelectItem value="Transient">Transient</SelectItem>
                <SelectItem value="EmailAddress">Email Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate">X.509 Certificate</Label>
            <Textarea
              id="certificate"
              rows={8}
              value={formData.certificate}
              onChange={(e) => setFormData({...formData, certificate: e.target.value})}
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            />
            <p className="text-xs text-slate-500">IdP's public certificate for signature verification</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline">Previous</Button>
        <Button>Next</Button>
      </div>
    </div>
  );
};
