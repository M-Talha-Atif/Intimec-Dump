import { OrgNodeData, OrgExportFormat, OrgImportResult } from '@/types/organization';

// Flatten org tree for CSV export
export function flattenOrgTree(node: OrgNodeData, parentPath = ''): any[] {
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
  const flattened: any[] = [];
  
  flattened.push({
    id: node.id,
    name: node.name,
    type: node.type,
    parent: parentPath || 'ROOT',
    path: currentPath,
    head: node.head || '',
    userCount: node.userCount,
    roleCount: node.roleCount,
    adminCount: node.adminCount,
    riskLevel: node.riskLevel || '',
    costCenter: node.costCenter || '',
    region: node.region || '',
    country: node.country || '',
    location: node.location || '',
    complianceStatus: node.complianceStatus || '',
    riskScore: node.riskScore || 0,
    healthScore: node.healthScore || 0,
    budget: node.budget || 0,
    actualSpend: node.actualSpend || 0,
  });
  
  if (node.children) {
    node.children.forEach(child => {
      flattened.push(...flattenOrgTree(child, currentPath));
    });
  }
  
  return flattened;
}

// Convert to CSV
export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

// Convert to XML
export function convertToXML(node: OrgNodeData, level = 0): string {
  const indent = '  '.repeat(level);
  let xml = `${indent}<unit>\n`;
  
  xml += `${indent}  <id>${node.id}</id>\n`;
  xml += `${indent}  <name><![CDATA[${node.name}]]></name>\n`;
  xml += `${indent}  <type>${node.type}</type>\n`;
  
  if (node.head) xml += `${indent}  <head><![CDATA[${node.head}]]></head>\n`;
  if (node.costCenter) xml += `${indent}  <costCenter>${node.costCenter}</costCenter>\n`;
  if (node.region) xml += `${indent}  <region>${node.region}</region>\n`;
  
  xml += `${indent}  <metrics>\n`;
  xml += `${indent}    <userCount>${node.userCount}</userCount>\n`;
  xml += `${indent}    <roleCount>${node.roleCount}</roleCount>\n`;
  xml += `${indent}    <adminCount>${node.adminCount}</adminCount>\n`;
  xml += `${indent}  </metrics>\n`;
  
  if (node.children && node.children.length > 0) {
    xml += `${indent}  <children>\n`;
    node.children.forEach(child => {
      xml += convertToXML(child, level + 2);
    });
    xml += `${indent}  </children>\n`;
  }
  
  xml += `${indent}</unit>\n`;
  return xml;
}

// Export organization data
export async function exportOrgData(
  data: OrgNodeData,
  format: OrgExportFormat,
  options: {
    includeHistory?: boolean;
    includeUsers?: boolean;
    selectedOnly?: boolean;
    selectedNodeId?: string;
  } = {}
): Promise<void> {
  let content: string;
  let filename: string;
  let mimeType: string;
  
  // Get the node to export (selected branch or full tree)
  const nodeToExport = options.selectedNodeId 
    ? findNodeById(data, options.selectedNodeId) || data
    : data;
  
  switch (format) {
    case 'csv': {
      const flatData = flattenOrgTree(nodeToExport);
      content = convertToCSV(flatData);
      filename = `organization-${Date.now()}.csv`;
      mimeType = 'text/csv';
      break;
    }
    
    case 'json': {
      content = JSON.stringify(nodeToExport, null, 2);
      filename = `organization-${Date.now()}.json`;
      mimeType = 'application/json';
      break;
    }
    
    case 'xml': {
      content = '<?xml version="1.0" encoding="UTF-8"?>\n';
      content += '<organization>\n';
      content += convertToXML(nodeToExport, 1);
      content += '</organization>';
      filename = `organization-${Date.now()}.xml`;
      mimeType = 'application/xml';
      break;
    }
    
    case 'excel': {
      // For now, export as CSV (would need xlsx library for true Excel)
      const flatData = flattenOrgTree(nodeToExport);
      content = convertToCSV(flatData);
      filename = `organization-${Date.now()}.csv`;
      mimeType = 'text/csv';
      break;
    }
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  // Download file
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Find node by ID
function findNodeById(node: OrgNodeData, id: string): OrgNodeData | null {
  if (node.id === id) return node;
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}

// Import from CSV
export async function importFromCSV(csvContent: string): Promise<OrgImportResult> {
  const result: OrgImportResult = {
    success: false,
    created: 0,
    updated: 0,
    errors: [],
    warnings: [],
  };
  
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      result.errors.push({ line: 0, message: 'CSV file is empty or has no data rows' });
      return result;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Validate required fields
      if (!row.id || !row.name || !row.type) {
        result.errors.push({ 
          line: i + 1, 
          message: 'Missing required fields: id, name, or type' 
        });
        continue;
      }
      
      result.created++;
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push({ 
      line: 0, 
      message: error instanceof Error ? error.message : 'Unknown error during import' 
    });
    return result;
  }
}

// Import from JSON
export async function importFromJSON(jsonContent: string): Promise<OrgImportResult> {
  const result: OrgImportResult = {
    success: false,
    created: 0,
    updated: 0,
    errors: [],
    warnings: [],
  };
  
  try {
    const data = JSON.parse(jsonContent);
    
    // Count nodes recursively
    const countNodes = (node: any): number => {
      let count = 1;
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          count += countNodes(child);
        });
      }
      return count;
    };
    
    result.created = countNodes(data);
    result.success = true;
    return result;
    
  } catch (error) {
    result.errors.push({ 
      line: 0, 
      message: error instanceof Error ? error.message : 'Invalid JSON format' 
    });
    return result;
  }
}
