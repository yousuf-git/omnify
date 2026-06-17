// services/stateCsvTemplateService.ts
export const generateStateCSVTemplate = (): string => {
  const headers = [
    'stateName',
    'isActive'
  ];

  const instructions = [
    '# State CSV Import Template',
    '# Required fields: stateName, isActive',
    '# stateName must be unique',
    '# isActive must be "true" or "false"',
    '#',
    '# Example:'
  ].join('\n');

  const exampleRow = [
    'Maharashtra',
    'true'
  ];

  return [instructions, headers.join(','), exampleRow.join(',')].join('\n');
};

export const convertStatesToCSV = (states: any[]): string => {
  const headers = [
    'stateName',
    'isActive'
  ];

  const rows = states.map(state => [
    state.stateName || '',
    state.isActive ? 'true' : 'false'
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};