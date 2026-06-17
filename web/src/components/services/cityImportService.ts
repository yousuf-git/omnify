// services/cityImportService.ts
import { createResource } from '../../api/api';
import { ReferenceResolutionService } from './referenceResolutionService';

export interface CityImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    error: string;
  }>;
}

export interface ResolvedCityData {
  cityName: string;
  stateId: string;
  isActive: boolean;
}

export class CityImportService {
  static async importCities(validatedData: any[]): Promise<CityImportResult> {
    const result: CityImportResult = {
      success: true,
      message: '',
      importedCount: 0,
      failedCount: 0,
      failures: [],
    };

    // Initialize reference resolution
    await ReferenceResolutionService.initialize();

    // Resolve all references first
    const resolutionResult = await this.resolveReferences(validatedData);
    
    if (!resolutionResult.success) {
      return {
        success: false,
        message: 'Reference resolution failed',
        importedCount: 0,
        failedCount: validatedData.length,
        failures: resolutionResult.failures
      };
    }

    // Import resolved cities
    for (let i = 0; i < resolutionResult.resolvedData.length; i++) {
      try {
        await createResource('/cities', resolutionResult.resolvedData[i]);
        result.importedCount++;
      } catch (error) {
        result.failedCount++;
        result.failures.push({
          row: i + 2,
          error: error instanceof Error ? error.message : 'Unknown error during import',
        });
      }
    }

    result.success = result.failedCount === 0;
    result.message = result.failedCount === 0 
      ? `Successfully imported ${result.importedCount} cities`
      : `Imported ${result.importedCount} cities, ${result.failedCount} failed`;

    return result;
  }

  private static async resolveReferences(data: any[]): Promise<{
    success: boolean;
    resolvedData: ResolvedCityData[];
    failures: Array<{ row: number; error: string }>;
  }> {
    const resolvedData: ResolvedCityData[] = [];
    const failures: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      const errors: string[] = [];

      try {
        // Resolve state
        const stateId = ReferenceResolutionService.resolveState(row.stateName);
        if (!stateId) {
          errors.push(`State not found: "${row.stateName}"`);
        }

        if (errors.length > 0) {
          failures.push({
            row: rowNumber,
            error: errors.join('; ')
          });
          continue;
        }

        // Create resolved city data
        const resolvedCity: ResolvedCityData = {
          cityName: row.cityName,
          stateId: stateId!,
          isActive: row.isActive
        };

        resolvedData.push(resolvedCity);
      } catch (error) {
        failures.push({
          row: rowNumber,
          error: `Reference resolution error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return {
      success: failures.length === 0,
      resolvedData,
      failures
    };
  }
}

export const importCities = CityImportService.importCities.bind(CityImportService);