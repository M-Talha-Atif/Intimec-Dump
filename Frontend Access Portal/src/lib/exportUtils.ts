
import { type User } from '@/data/mock-users';

const jsonToXml = (obj: any, rootName = 'root'): string => {
  let xml = '';

  const arrayElementNames: { [key: string]: string } = {
    accounts: 'account',
    access: 'accessItem',
    activity: 'activityEvent',
    policyViolations: 'policyViolation',
    riskContributors: 'riskContributor',
    details: 'detail',
    classifications: 'classification',
  };

  const processNode = (node: any, name: string): string => {
    let result = '';
    if (node === null || node === undefined) {
      result += `<${name}/>`;
      return result;
    }
    
    if (Array.isArray(node)) {
      node.forEach(item => {
        const singularName = arrayElementNames[name] || (name.endsWith('s') ? name.slice(0, -1) : 'item');
        result += processNode(item, singularName);
      });
    } else if (typeof node === 'object') {
      result += `<${name}>`;
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          result += processNode(node[key], key);
        }
      }
      result += `</${name}>`;
    } else {
      const value = String(node)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      result += `<${name}>${value}</${name}>`;
    }
    return result;
  };

  xml = `<?xml version="1.0" encoding="UTF-8"?>\n${processNode(obj, rootName)}`;
  return xml;
};

export const exportData = (data: User, format: 'json' | 'xml') => {
  const filename = `${data.name.replace(/\s+/g, '_').toLowerCase()}_identity.${format}`;
  let content = '';
  let mimeType = '';

  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
  } else {
    content = jsonToXml(data, 'user');
    mimeType = 'application/xml';
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8,` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
