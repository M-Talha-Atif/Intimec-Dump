// Artifacts API utility for managing configuration-related files and resources
// This uses internal API routes to handle server-side auth and file operations

export type ArtifactType = 'certificate' | 'keystore' | 'privatekey' | 'metadata' | 'logo' | 'document';

export interface Artifact {
  id: string;
  configurationId: string;
  artifactType: ArtifactType;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  isEncrypted: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactCreateRequest {
  configurationId: string;
  artifactType: ArtifactType;
  fileName?: string;
  mimeType?: string;
  isEncrypted?: boolean;
  metadata?: Record<string, any>;
  file?: File | Blob;
}

export interface ArtifactUpdateRequest {
  fileName?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
  file?: File | Blob;
}

export async function listArtifacts(configurationId?: string) {
  const url = configurationId 
    ? `/api/v1/artifacts?configurationId=${configurationId}`
    : '/api/v1/artifacts';
    
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to list artifacts');
  }

  return res.json();
}

export async function getArtifact(artifactId: string) {
  const res = await fetch(`/api/v1/artifacts/${artifactId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to get artifact');
  }

  return res.json();
}

export async function createArtifact(request: ArtifactCreateRequest) {
  const formData = new FormData();
  
  // Add artifact metadata
  formData.append('configurationId', request.configurationId);
  formData.append('artifactType', request.artifactType);
  
  if (request.fileName) {
    formData.append('fileName', request.fileName);
  }
  
  if (request.mimeType) {
    formData.append('mimeType', request.mimeType);
  }
  
  if (request.isEncrypted !== undefined) {
    formData.append('isEncrypted', request.isEncrypted.toString());
  }
  
  if (request.metadata) {
    formData.append('metadata', JSON.stringify(request.metadata));
  }
  
  // Add file if provided
  if (request.file) {
    formData.append('file', request.file, request.fileName);
  }

  const res = await fetch('/api/v1/artifacts', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create artifact');
  }

  return res.json();
}

export async function updateArtifact(artifactId: string, request: ArtifactUpdateRequest) {
  const formData = new FormData();
  
  if (request.fileName) {
    formData.append('fileName', request.fileName);
  }
  
  if (request.isActive !== undefined) {
    formData.append('isActive', request.isActive.toString());
  }
  
  if (request.metadata) {
    formData.append('metadata', JSON.stringify(request.metadata));
  }
  
  // Add file if provided
  if (request.file) {
    formData.append('file', request.file, request.fileName);
  }

  const res = await fetch(`/api/v1/artifacts/${artifactId}`, {
    method: 'PATCH',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update artifact');
  }

  return res.json();
}

export async function deleteArtifact(artifactId: string) {
  const res = await fetch(`/api/v1/artifacts/${artifactId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete artifact');
  }

  // Handle 204 No Content response - no body to parse
  if (res.status === 204) {
    return { success: true };
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  return { success: true };
}

export async function downloadArtifact(artifactId: string) {
  const res = await fetch(`/api/v1/artifacts/${artifactId}/download`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to download artifact');
  }

  return res.blob();
}

export async function toggleArtifactActive(artifactId: string, isActive: boolean) {
  const res = await fetch(`/api/v1/artifacts/${artifactId}/toggle`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to toggle artifact status');
  }

  return res.json();
}

export async function getArtifactsByType(artifactType: ArtifactType, configurationId?: string) {
  const params = new URLSearchParams();
  params.append('artifactType', artifactType);
  
  if (configurationId) {
    params.append('configurationId', configurationId);
  }

  const res = await fetch(`/api/v1/artifacts/by-type?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to get artifacts by type');
  }

  return res.json();
}

// Utility functions for common artifact operations

export function isImageArtifact(artifact: Artifact): boolean {
  return artifact.mimeType?.startsWith('image/') || false;
}

export function isCertificateArtifact(artifact: Artifact): boolean {
  return artifact.artifactType === 'certificate' || 
         artifact.mimeType?.includes('certificate') ||
         artifact.fileName?.endsWith('.pem') ||
         artifact.fileName?.endsWith('.crt') ||
         artifact.fileName?.endsWith('.cer') || false;
}

export function isKeystoreArtifact(artifact: Artifact): boolean {
  return artifact.artifactType === 'keystore' ||
         artifact.fileName?.endsWith('.jks') ||
         artifact.fileName?.endsWith('.p12') ||
         artifact.fileName?.endsWith('.pfx') || false;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function getArtifactDisplayName(artifact: Artifact): string {
  return artifact.fileName || `${artifact.artifactType}-${artifact.id.slice(0, 8)}`;
}
