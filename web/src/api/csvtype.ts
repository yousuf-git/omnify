// types/csv.ts
export interface StoreCSVRow {
  storeId: string;
  storeName: string;
  partyName: string; // Reference by name instead of ID for user-friendliness
  cityName: string; // Reference by name
  stateName: string; // Reference by name
  storeAddress: string;
  storePinCode: string;
  smName: string;
  smContactNo: string;
  isActive: string; // 'true' or 'false'
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData: any[];
  totalRows: number;
  validRows: number;
}

export interface ImportConfig {
  requiredFields: string[];
  fieldValidations: {
    [key: string]: (value: string) => string | null;
  };
}