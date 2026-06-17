// services/cityCsvValidationService.ts
import { CSVValidationResult } from '../../api/csvtype';
import { ReferenceResolutionService } from './referenceResolutionService';

export class CityCSVValidationService {
  private static config = {
    requiredFields: ['cityName', 'stateName'],
    
    fieldValidations: {
      cityName: (value: string) => {
        if (!value.trim()) return 'City name is required';
        if (value.length > 100) return 'City name must be less than 100 characters';
        return null;
      },
      
      stateName: (value: string) => {
        if (!value.trim()) return 'State name is required';
        return null;
      },
      
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
    
    // Initialize references for validation
    await ReferenceResolutionService.initialize();
    
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

  private static async validateRows(rows: any[]): Promise<CSVValidationResult> {
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
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      const rowErrors: string[] = [];

      // Basic field validation
      this.config.requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          rowErrors.push(`${field} is required`);
        }
      });

      // Field format validation
      Object.entries(this.config.fieldValidations).forEach(([field, validator]) => {
        if (row[field] !== undefined) {
          const error = validator(row[field].toString());
          if (error) {
            rowErrors.push(error);
          }
        }
      });

      // Reference validation (only if basic validations pass)
      if (rowErrors.length === 0) {
        const referenceErrors = await this.validateReferences(row, rowNumber);
        rowErrors.push(...referenceErrors);
      }

      if (rowErrors.length === 0) {
        validatedData.push({
          ...row,
          isActive: row.isActive?.toLowerCase() === 'true',
        });
      } else {
        errors.push(`Row ${rowNumber}: ${rowErrors.join('; ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedData,
      totalRows: rows.length,
      validRows: validatedData.length,
    };
  }

  private static async validateReferences(row: any, rowNumber: number): Promise<string[]> {
    const errors: string[] = [];

    // Validate state exists
    if (row.stateName && !ReferenceResolutionService.resolveState(row.stateName)) {
      errors.push(`State not found: "${row.stateName}"`);
    }

    return errors;
  }
}

export const validateCityCSVFile = CityCSVValidationService.validateCSVFile.bind(CityCSVValidationService);