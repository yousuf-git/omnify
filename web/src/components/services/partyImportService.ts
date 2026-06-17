// services/partyImportService.ts
import { createResource } from '../../api/api';
import { ReferenceResolutionService } from './referenceResolutionService';

export interface PartyImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    error: string;
  }>;
}

export interface ResolvedPartyData {
  partyName: string;
  address: string;
  gstn: string;
  shippingAddress: string;
  cityId: string;
  stateId: string;
  resellerId?: string;
  isActive: boolean;
}

export class PartyImportService {
  static async importParties(validatedData: any[]): Promise<PartyImportResult> {
    const result: PartyImportResult = {
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

    // Import resolved parties
    for (let i = 0; i < resolutionResult.resolvedData.length; i++) {
      try {
        await createResource('/parties', resolutionResult.resolvedData[i]);
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
      ? `Successfully imported ${result.importedCount} parties`
      : `Imported ${result.importedCount} parties, ${result.failedCount} failed`;

    return result;
  }

  private static async resolveReferences(data: any[]): Promise<{
    success: boolean;
    resolvedData: ResolvedPartyData[];
    failures: Array<{ row: number; error: string }>;
  }> {
    const resolvedData: ResolvedPartyData[] = [];
    const failures: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      const errors: string[] = [];

      try {
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

        // Then in the method:
            let resellerId: string | undefined; // Initialize as undefined

            if (row.resellerName && row.resellerName.trim()) {
            const resolvedResellerId = ReferenceResolutionService.resolveReseller(row.resellerName);
            if (!resolvedResellerId) {
                errors.push(`Reseller not found: "${row.resellerName}"`);
            } else {
                resellerId = resolvedResellerId;
            }
            }

        if (errors.length > 0) {
          failures.push({
            row: rowNumber,
            error: errors.join('; ')
          });
          continue;
        }

        // Create resolved party data
        const resolvedParty: ResolvedPartyData = {
          partyName: row.partyName,
          address: row.address,
          gstn: row.gstn,
          shippingAddress: row.shippingAddress || row.address, // Fallback to address if not provided
          cityId: cityId!,
          stateId: stateId!,
          resellerId: resellerId ,
          isActive: row.isActive
        };

        resolvedData.push(resolvedParty);
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

export const importParties = PartyImportService.importParties.bind(PartyImportService);