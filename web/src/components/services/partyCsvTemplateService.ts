// services/partyCsvTemplateService.ts
export const generatePartyCSVTemplate = (): string => {
  const headers = [
    'partyName',
    'address', 
    'gstn',
    'shippingAddress',
    'cityName',
    'stateName',
    'resellerName',
    'isActive'
  ];

  const instructions = [
    '# Party CSV Import Template',
    '# Required fields: partyName, address, gstn, cityName, stateName, isActive',
    '# cityName, stateName must match existing records exactly',
    '# resellerName must match existing reseller records (optional)',
    '# isActive must be "true" or "false"',
    '#',
    '# Example:'
  ].join('\n');

  const exampleRow = [
    'ABC Suppliers',
    '123 Main Street, Business Area',
    '07AABCU9603R1ZM',
    '123 Main Street, Business Area',
    'Mumbai',
    'Maharashtra', 
    'Premium Resellers',
    'true'
  ];

  // Agency ki tarah proper CSV format with quotes
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  const csvExampleRow = exampleRow.map(field => `"${field}"`).join(',');
  
  return [instructions, csvHeaders, csvExampleRow].join('\n');
};

export const convertPartiesToCSV = (parties: any[]): string => {
  if (!parties || parties.length === 0) {
    return generatePartyCSVTemplate();
  }

  const headers = [
    'partyName',
    'address',
    'gstn', 
    'shippingAddress',
    'cityName',
    'stateName',
    'resellerName',
    'isActive'
  ];

  const rows = parties.map(party => {
    try {
      // Safely extract city name
      let cityName = '';
      if (party.cityId) {
        if (typeof party.cityId === 'object' && party.cityId !== null) {
          cityName = party.cityId.cityName || '';
        }
      }

      // Safely extract state name  
      let stateName = '';
      if (party.stateId) {
        if (typeof party.stateId === 'object' && party.stateId !== null) {
          stateName = party.stateId.stateName || '';
        }
      }

      // Safely extract reseller name
      let resellerName = '';
      if (party.resellerId) {
        if (typeof party.resellerId === 'object' && party.resellerId !== null) {
          resellerName = party.resellerId.resellerName || '';
        }
      }

      return [
        party.partyName || '',
        party.address || '',
        party.gstn || '',
        party.shippingAddress || '',
        cityName,
        stateName,
        resellerName,
        party.isActive ? 'true' : 'false'
      ];
    } catch (error) {
      console.error('Error processing party for CSV:', error, party);
      return headers.map(() => 'ERROR');
    }
  });

  // Agency CSV ki tarah proper formatting with quotes
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  const csvRows = rows.map(row => 
    row.map(field => {
      // Always wrap fields in quotes and escape existing quotes
      const escapedField = field.toString().replace(/"/g, '""');
      return `"${escapedField}"`;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};