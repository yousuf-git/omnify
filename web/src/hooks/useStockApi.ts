import { useState } from 'react';
import { createResource, getResources, updateResource } from '../api/api';
import { Navigate } from 'react-router-dom';


export interface StockApiHookReturn {
  isLoading: boolean;
  error: string | null;
  createStockIn: (payload: any) => Promise<any>;
  updateStockIn: (id: string, payload: any) => Promise<any>;
  createStockOut: (payload: any) => Promise<any>;
  updateStockOut: (id: string, payload: any) => Promise<any>;
//   checkDuplicateInvoice: (invoiceNo: string, type: 'stock-in' | 'stock-out', excludeId?: string) => Promise<boolean>;
  updateStockRecords: (updates: any[]) => Promise<void>;
}

export const useStockApi = (): StockApiHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await apiCall();
    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    
    // Enhanced error logging
    if (err instanceof Error && 'response' in err) {
      const axiosError = err as any;
      console.error('🔴 BACKEND ERROR RESPONSE:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: axiosError.config
      });
      
      // Extract specific backend error message
      const backendMessage = axiosError.response?.data?.message || 
                            axiosError.response?.data?.errors || 
                            'No detailed error message from backend';
      console.error('🔴 Backend says:', backendMessage);
    }
    
    setError(errorMessage);
    throw err;
  } finally {
    setIsLoading(false);
  }
};

const createStockIn = async (payload: any) => {
  return handleApiCall(async () => {
    //  console.log("🔵 Sending raw payload to backend:", payload);
    
    // Temporary: Send exactly what we receive for debugging
    return await createResource('/stock-ins', {
      ...payload,
      isActive: true
    });
  });
};
const updateStockIn = async (id: string, payload: any) => {
     return handleApiCall(async () => {
    return await updateResource('/stock-ins', id, {...payload,action:"add",isActive:true});
  });

  };

const createStockOut = async (payload: any) => {
    return handleApiCall(async () => {
      const formattedPayload = {
        stockOutDate: payload.stockOutDate,
        logisticsProviderCategoryId: payload.logisticsProviderCategoryId,
        logisticsProviderCategoryName: payload.logisticsProviderCategoryName || '',
        stockOutCategoryId: payload.stockOutCategoryId,
        storeId: payload.storeId,
        partyId: payload.partyId,
        warehouseId: payload.warehouseId,
        itemId: payload.itemId,
        deliveryStatusId: payload.deliveryStatusId,
        installationStatusId: payload.installationStatusId,
        quantity: payload.quantity,
        serialNo: payload.serialNo || [],
        trackingNo: payload.trackingNo,
        date: payload.date,
        invoiceNo: payload.invoiceNo || '',
        isActive: true
      };

      return await createResource('/stock-outs', formattedPayload);
    });
  };

// Ensure the updateStockOut function sends the correct payload
const updateStockOut = async (id: string, payload: any) => {
  return handleApiCall(async () => {
    const formattedPayload = {
      ...payload,
      isActive: true
    };

    return await updateResource('/stock-outs', id, formattedPayload);
  });
};

//   const checkDuplicateInvoice = async (
//     invoiceNo: string, 
//     type: 'stock-in' | 'stock-out', 
//     excludeId?: string
//   ): Promise<boolean> => {
//     if (!invoiceNo.trim()) return false;

//     return handleApiCall(async () => {
//       const endpoint = type === 'stock-in' ? '/stock-ins' : '/stock-outs';
//       const query = `checkInvoice=true&invoiceNo=${encodeURIComponent(invoiceNo)}${
//         excludeId ? `&excludeId=${excludeId}` : ''
//       }`;
      
//       const data = await getResources(`${endpoint}?${query}`);
//       return data?.exists || false;
//     });
//   };

  const updateStockRecords = async (updates: any[]) => {
    return handleApiCall(async () => {
      await Promise.all(
        updates.map(update => 
          updateResource('/item-stock-records', update.id, update.data)
        )
      );
    });
  };

  return {
    isLoading,
    error,
    createStockIn,
    updateStockIn,
    createStockOut,
    updateStockOut,
    // checkDuplicateInvoice,
    updateStockRecords
  };
};