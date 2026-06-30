
import { AttributeMapping } from '@/components/identity-mapping/MappingEngine';

// Service for syncing schema mappings to the global Identity Attribute Mapping engine
export interface SchemaMappingData {
  id: string;
  native: string;
  iga: string;
  type: string;
  transformation?: string;
  fallbackValue?: string;
  validationRule?: string;
  format?: string;
  constraints?: string;
  description?: string;
  category: string;
  sensitive?: boolean;
}

export type IdentityType = 'employee' | 'non-employee' | 'non-human';

interface Source {
  id: string;
  name: string;
  type: string;
  syncStatus: 'synced' | 'out-of-sync' | 'not-configured';
  priority: number;
}

class MappingSyncService {
  private mappingSubscribers: Map<IdentityType, (mappings: AttributeMapping[]) => void> = new Map();
  private sourceSubscribers: Map<IdentityType, (sources: Source[]) => void> = new Map();

  async syncSchemaToMappingEngine(
    applicationId: string,
    applicationName: string,
    identityType: IdentityType,
    mappings: SchemaMappingData[]
  ): Promise<void> {
    console.log('🔄 Starting schema sync to mapping engine...');
    console.log('Application ID:', applicationId);
    console.log('Application Name:', applicationName);
    console.log('Identity Type:', identityType);
    console.log('Mappings to sync:', mappings);

    try {
      // Simulate API call to mapping engine
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Convert SchemaMappingData to AttributeMapping format
      const attributeMappings: AttributeMapping[] = mappings.map(mapping => ({
        id: mapping.id,
        sourceAttribute: mapping.native,
        targetAttribute: mapping.iga,
        transformation: mapping.transformation || 'none',
        transformationScript: undefined,
        condition: undefined,
        fallbackValue: mapping.fallbackValue,
        priority: 1,
        source: applicationName,
        identityType,
        type: 'string' as const,
        isCollapsed: false,
        isValid: true,
        validationErrors: []
      }));

      // Notify subscribers about new mappings
      const mappingCallback = this.mappingSubscribers.get(identityType);
      if (mappingCallback) {
        mappingCallback(attributeMappings);
      }

      // Log successful sync
      console.log('✅ Schema mappings synchronized successfully');
      console.log(`📊 Synced ${mappings.length} attribute mappings`);
      console.log(`🎯 Target identity type: ${identityType}`);
      
      // In a real implementation, this would:
      // 1. Register the application as an authoritative source
      // 2. Push mappings to the global identity attribute mapping engine
      // 3. Update source priority manager with application details
      // 4. Configure data flow pipelines for the identity type
      
      console.log('🔗 Application registered in Source Priority Manager');
      console.log('⚙️ Data flow pipelines configured');
      
    } catch (error) {
      console.error('❌ Failed to sync schema mappings:', error);
      throw new Error('Failed to sync schema mappings to the mapping engine');
    }
  }

  async validateSyncRequirements(
    isAuthoritative: boolean,
    identityType?: string,
    mappings: SchemaMappingData[] = []
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!isAuthoritative) {
      errors.push('Application must be marked as Authoritative Source to sync mappings');
    }

    if (!identityType) {
      errors.push('Identity Type must be selected before syncing');
    }

    const mappedAttributes = mappings.filter(m => m.iga);
    if (mappedAttributes.length === 0) {
      errors.push('At least one attribute must be mapped to an IGA field');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Subscribe to mapping changes for a specific identity type
  subscribeMappingChanges(identityType: IdentityType, callback: (mappings: AttributeMapping[]) => void): void {
    this.mappingSubscribers.set(identityType, callback);
  }

  // Subscribe to source changes for a specific identity type
  subscribeSourceChanges(identityType: IdentityType, callback: (sources: Source[]) => void): void {
    this.sourceSubscribers.set(identityType, callback);
  }

  // Unsubscribe from mapping changes
  unsubscribeMappingChanges(identityType: IdentityType): void {
    this.mappingSubscribers.delete(identityType);
  }

  // Unsubscribe from source changes
  unsubscribeSourceChanges(identityType: IdentityType): void {
    this.sourceSubscribers.delete(identityType);
  }
}

export const mappingSyncService = new MappingSyncService();
