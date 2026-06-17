// services/agencyCsvTemplateService.ts
export const generateAgencyCSVTemplate = (): string => {
  const headers = [
    'agencyName',
    'agencyNumber', 
    'cityName',
    'stateName',
    'isActive'
  ];

  const instructions = [
    '# Agency CSV Import Template',
    '# Required fields: agencyName, agencyNumber, cityName, stateName, isActive',
    '# cityName, stateName must match existing records exactly',
    '# agencyNumber must be less than 20 characters',
    '# isActive must be "true" or "false"',
    '#',
    '# Example:'
  ].join('\n');

  const exampleRow = [
    'ABC Travel Agency',
    '+91-9876543210',
    'Mumbai',    // Must match existing city name  
    'Maharashtra', // Must match existing state name
    'true'
  ];

  return [instructions, headers.join(','), exampleRow.join(',')].join('\n');
};

export const convertAgenciesToCSV = (agencies: any[]): string => {
  const headers = [
    'agencyName',
    'agencyNumber',
    'cityName',
    'stateName',
    'isActive'
  ];

  const rows = agencies.map(agency => [
    agency.agencyName || '',
    agency.agencyNumber || '',
    typeof agency.cityId === 'object' ? (agency.cityId as any).cityName : '',
    typeof agency.stateId === 'object' ? (agency.stateId as any).stateName : '',
    agency.isActive ? 'true' : 'false'
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};