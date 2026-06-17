// services/supportPersonCsvTemplateService.ts
export const generateSupportPersonCSVTemplate = (): string => {
  const headers = [
    'supportPersonName',
    'supportPersonNumber', 
    'agencyName',
    'cityName',
    'stateName',
    'isActive'
  ];

  const instructions = [
    '# Support Person CSV Import Template',
    '# Required fields: supportPersonName, supportPersonNumber, agencyName, cityName, stateName, isActive',
    '# agencyName, cityName, stateName must match existing records exactly',
    '# supportPersonNumber must be less than 20 characters',
    '# isActive must be "true" or "false"',
    '#',
    '# Example:'
  ].join('\n');

  const exampleRow = [
    'John Doe',
    '+91-9876543210',
    'ABC Travel Agency', // Must match existing agency name
    'Mumbai',    // Must match existing city name  
    'Maharashtra', // Must match existing state name
    '4.5',
    'true'
  ];

  return [instructions, headers.join(','), exampleRow.join(',')].join('\n');
};

export const convertSupportPersonsToCSV = (supportPersons: any[]): string => {
  const headers = [
    'supportPersonName',
    'supportPersonNumber',
    'agencyName',
    'cityName',
    'stateName',
    'isActive'
  ];

  const rows = supportPersons.map(supportPerson => [
    supportPerson.supportPersonName || '',
    supportPerson.supportPersonNumber || '',
    typeof supportPerson.agencyId === 'object' ? (supportPerson.agencyId as any).agencyName : '',
    typeof supportPerson.cityId === 'object' ? (supportPerson.cityId as any).cityName : '',
    typeof supportPerson.stateId === 'object' ? (supportPerson.stateId as any).stateName : '',
    // supportPerson.rating?.toString() || '',
    supportPerson.isActive ? 'true' : 'false'
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};