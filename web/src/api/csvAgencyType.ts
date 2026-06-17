// types/csv.ts - Add Agency types
export interface AgencyCSVRow {
  agencyName: string;
  agencyNumber: string;
  cityName: string; // Reference by name
  stateName: string; // Reference by name
  isActive: string; // 'true' or 'false'
}

export interface AgencyImportConfig {
  requiredFields: string[];
  fieldValidations: {
    [key: string]: (value: string) => string | null;
  };
}