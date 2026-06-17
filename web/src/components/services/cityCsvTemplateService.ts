// services/cityCsvTemplateService.ts
export const generateCityCSVTemplate = (): string => {
  const headers = [
    'cityName',
    'stateName',
    'isActive'
  ];

  const instructions = [
    '# City CSV Import Template',
    '# Required fields: cityName, stateName, isActive',
    '# stateName must match existing records exactly',
    '# isActive must be "true" or "false"',
    '#',
    '# Example:'
  ].join('\n');

  const exampleRow = [
    'Mumbai',
    'Maharashtra', // Must match existing state name
    'true'
  ];

  return [instructions, headers.join(','), exampleRow.join(',')].join('\n');
};

export const convertCitiesToCSV = (cities: any[]): string => {
  const headers = [
    'cityName',
    'stateName',
    'isActive'
  ];

  const rows = cities.map(city => [
    city.cityName || '',
    typeof city.stateId === 'object' ? (city.stateId as any).stateName : '',
    city.isActive ? 'true' : 'false'
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};