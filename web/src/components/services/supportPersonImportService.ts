// services/supportPersonImportService.ts

import { createResource } from '../../api/api';
import { ReferenceResolutionService } from './referenceResolutionService';

export interface SupportPersonImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    error: string;
  }>;
}

export interface ResolvedSupportPersonData {
  supportPersonName: string;
  supportPersonNumber: string;
  agencyId: string;
  cityId: string;
  stateId: string;
  isActive: boolean;
}

export class SupportPersonImportService {
  static async importSupportPersons(validatedData: any[]): Promise<SupportPersonImportResult> {
    const result: SupportPersonImportResult = {
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

    // Import resolved support persons
    for (let i = 0; i < resolutionResult.resolvedData.length; i++) {
      try {
        await createResource('/support-person', resolutionResult.resolvedData[i]);
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
      ? `Successfully imported ${result.importedCount} support persons`
      : `Imported ${result.importedCount} support persons, ${result.failedCount} failed`;

    return result;
  }

  private static async resolveReferences(data: any[]): Promise<{
    success: boolean;
    resolvedData: ResolvedSupportPersonData[];
    failures: Array<{ row: number; error: string }>;
  }> {
    const resolvedData: ResolvedSupportPersonData[] = [];
    const failures: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      const errors: string[] = [];

      try {
        // Resolve agency
        const agencyId = ReferenceResolutionService.resolveAgency(row.agencyName);
        if (!agencyId) {
          errors.push(`Agency not found: "${row.agencyName}"`);
        }

        // Resolve city
        const cityId = ReferenceResolutionService.resolveCity(row.cityName);
        if (!cityId) {
          errors.push(`City not found: "${row.cityName}"`);
        }

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

        // Create resolved support person data
        const resolvedSupportPerson: ResolvedSupportPersonData = {
          supportPersonName: row.supportPersonName,
          supportPersonNumber: row.supportPersonNumber,
          agencyId: agencyId!,
          cityId: cityId!,
          stateId: stateId!,
          isActive: row.isActive
        };

        resolvedData.push(resolvedSupportPerson);
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

export const importSupportPersons = SupportPersonImportService.importSupportPersons.bind(SupportPersonImportService);