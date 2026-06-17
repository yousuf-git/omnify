import { createResource } from "../../api/api";
import { ReferenceResolutionService } from "./referenceResolutionService";


export interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    error: string;
  }>;
}

export interface ResolvedStoreData {
  storeId: number;
  storeName: string;
  partyId: string;
  cityId?: string | null;
  stateId?: string | null;
  storeAddress: string;
  storePinCode: string;
  smName: string;
  smContactNo: string;
  isActive: boolean;
}

export class ImportService {
  static async importStores(validatedData: any[]): Promise<ImportResult> {
    const result: ImportResult = {
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

    // Import resolved stores
    for (let i = 0; i < resolutionResult.resolvedData.length; i++) {
      try {
        await createResource('/stores', resolutionResult.resolvedData[i]);
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
      ? `Successfully imported ${result.importedCount} stores`
      : `Imported ${result.importedCount} stores, ${result.failedCount} failed`;

    return result;
  }

  private static async resolveReferences(data: any[]): Promise<{
    success: boolean;
    resolvedData: ResolvedStoreData[];
    failures: Array<{ row: number; error: string }>;
  }> {
    const resolvedData: ResolvedStoreData[] = [];
    const failures: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      const errors: string[] = [];

      try {
        // Resolve party
        const partyId = ReferenceResolutionService.resolveParty(row.partyName);
        if (!partyId) {
          errors.push(`Party not found: "${row.partyName}"`);
        }

        // Resolve city (optional)
        let cityId: string | null = null;
        if (row.cityName && row.cityName.toString().trim() !== '') {
          cityId = ReferenceResolutionService.resolveCity(row.cityName);
          if (!cityId) {
            errors.push(`City not found: "${row.cityName}"`);
          }
        }

        // Resolve state (optional)
        let stateId: string | null = null;
        if (row.stateName && row.stateName.toString().trim() !== '') {
          stateId = ReferenceResolutionService.resolveState(row.stateName);
          if (!stateId) {
            errors.push(`State not found: "${row.stateName}"`);
          }
        }

        if (errors.length > 0) {
          failures.push({
            row: rowNumber,
            error: errors.join('; ')
          });
          continue;
        }

        // Create resolved store data
        const resolvedStore: ResolvedStoreData = {
          storeId: parseInt(row.storeId),
          storeName: row.storeName,
          partyId: partyId!,
          cityId: cityId ?? null,
          stateId: stateId ?? null,
          storeAddress: row.storeAddress,
          storePinCode: row.storePinCode,
          smName: row.smName,
          smContactNo: row.smContactNo,
          isActive: row.isActive
        };

        resolvedData.push(resolvedStore);
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

export const importStores = ImportService.importStores.bind(ImportService);
