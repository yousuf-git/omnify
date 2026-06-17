// types/csv.ts - Add SupportPerson types
export interface SupportPersonCSVRow {
  supportPersonName: string;
  supportPersonNumber: string;
  agencyName: string; // Reference by name
  cityName: string; // Reference by name
  stateName: string; // Reference by name
  rating: string; // Number as string
  isActive: string; // 'true' or 'false'
}

export interface SupportPersonImportConfig {
  requiredFields: string[];
  fieldValidations: {
    [key: string]: (value: string) => string | null;
  };
}