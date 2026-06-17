import { CSVValidationResult, ImportConfig } from "../../api/csvtype";


export class CSVValidationService {
  private static config: ImportConfig = {
    requiredFields: ['storeId', 'storeName', 'partyName', 'isActive'],

    fieldValidations: {
      storeId: (value: string) => {
        if (!value.trim()) return 'Store ID is required';
        if (!/^-?\d+$/.test(value)) return 'Store ID must be a number';
        return null;
      },

      storeName: (value: string) => {
        if (!value.trim()) return 'Store name is required';
        if (value.length > 100) return 'Store name must be less than 100 characters';
        return null;
      },

      partyName: (value: string) => {
        if (!value.trim()) return 'Party name is required';
        return null;
      },

      // Remove all validations for optional fields - they can be empty
      cityName: () => null, // No validation - optional field
      stateName: () => null, // No validation - optional field
      storeAddress: () => null, // No validation - optional field
      storePinCode: () => null, // No validation - optional field
      smName: () => null, // No validation - optional field
      smContactNo: () => null, // No validation - optional field

      isActive: (value: string) => {
        if (!value.trim()) return 'isActive is required';
        if (!['true', 'false'].includes(value.toLowerCase())) {
          return 'isActive must be "true" or "false"';
        }
        return null;
      },
    },
  };

  static async validateCSVFile(file: File): Promise<CSVValidationResult> {
    const content = await this.readFile(file);
    const rows = this.parseCSV(content);

    return this.validateRows(rows);
  }

  private static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private static validateRows(rows: any[]): CSVValidationResult {
    const errors: string[] = [];
    const validatedData: any[] = [];

    // Check required headers
    const missingHeaders = this.config.requiredFields.filter(
      field => !rows[0] || !(field in rows[0])
    );

    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
      return {
        isValid: false,
        errors,
        validatedData: [],
        totalRows: rows.length,
        validRows: 0,
      };
    }

    // Validate each row
    rows.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowNumber = index + 2; // +2 for header row and 1-based indexing

      // Check required fields
      this.config.requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          rowErrors.push(`Row ${rowNumber}: ${field} is required`);
        }
      });

      // Validate field formats
      Object.entries(this.config.fieldValidations).forEach(([field, validator]) => {
        if (row[field] !== undefined) {
          const error = validator(row[field].toString());
          if (error) {
            rowErrors.push(`Row ${rowNumber}: ${error}`);
          }
        }
      });

      if (rowErrors.length === 0) {
        validatedData.push({
          ...row,
          isActive: row.isActive?.toLowerCase() === 'true',
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validatedData,
      totalRows: rows.length,
      validRows: validatedData.length,
    };
  }
}

// Export the validation function
export const validateCSVFile = CSVValidationService.validateCSVFile.bind(CSVValidationService);
