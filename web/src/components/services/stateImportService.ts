// services/stateImportService.ts
import { createResource } from '../../api/api';

export interface StateImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    error: string;
  }>;
}

export class StateImportService {
  static async importStates(validatedData: any[]): Promise<StateImportResult> {
    const result: StateImportResult = {
      success: true,
      message: '',
      importedCount: 0,
      failedCount: 0,
      failures: [],
    };

    // Import states
    for (let i = 0; i < validatedData.length; i++) {
      try {
        await createResource('/states', validatedData[i]);
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
      ? `Successfully imported ${result.importedCount} states`
      : `Imported ${result.importedCount} states, ${result.failedCount} failed`;

    return result;
  }
}

export const importStates = StateImportService.importStates.bind(StateImportService);