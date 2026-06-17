import axios from 'axios';
import { isSandbox, getSandboxToken, SANDBOX_BASE_URL } from '../sandbox/sandboxMode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies
});

// Sandbox axios instance — hits /sandbox/* at the server root with the session token.
const sbApi = axios.create({ baseURL: SANDBOX_BASE_URL });
const sbCfg = () => ({ headers: { "x-sandbox-token": getSandboxToken() || "" } });
async function sbRun<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    return (await p).data;
  } catch (error: any) {
    const m = error.response?.data?.message || error.message || "Sandbox request failed";
    throw new Error(typeof m === "string" ? m : JSON.stringify(m));
  }
}

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if this is a public endpoint that shouldn't trigger login redirect
    const isPublicEndpoint = originalRequest.url?.includes('/ticket/check') ||
                            originalRequest.url?.includes('/checkTicketStatus') ||
                            originalRequest.url?.includes('/public') ||
                            originalRequest.url?.includes('/verify');
    
    // Prevent infinite loops - don't retry if already retried or if it's a refresh request
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/refresh') &&
        !originalRequest.url.includes('/login') &&
        !isPublicEndpoint) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await authAPI.refresh();
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        // Clear any stored auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authState');
        }
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // For public endpoints, don't redirect on 401, just return the error
    if (error.response?.status === 401 && isPublicEndpoint) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Add logout method to authAPI
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/login", { email, password }),
  refresh: () => api.post("/refresh"),
  verify: () => api.get("/verify"),
  logout: () => api.post("/logout"),
  getUsers: () => api.get("/users"),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Current tenant's profile + settings (tenant admin).
export const tenantAPI = {
  getCurrent: () => getResources("/tenant"),
  updateSettings: (settings: any) => updateResource("/tenant", "settings", settings),
};

// Platform super-admin: manage companies (tenants).
export const adminTenantsAPI = {
  list: () => getResources("/admin/tenants"),
  overview: () => getResources("/admin/tenants/overview/stats"),
  getById: (id: string) => getResource("/admin/tenants", id),
  create: (data: any) => createResource("/admin/tenants", data),
  update: (id: string, data: any) => updateResource("/admin/tenants", id, data),
  toggle: (id: string) => updateResource("/admin/tenants", `${id}/toggle`, {}),
};
// Generic CRUD operations
export const createResource = async (endpoint: string, data: any) => {
  if (isSandbox()) return sbRun(sbApi.post(endpoint, data, sbCfg()));
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from server response
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

export const getResources = async (
  endpoint: string,
  params?: Record<string, any>
) => {
  if (isSandbox()) return sbRun(sbApi.get(endpoint, { ...sbCfg(), params }));
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

export const getSpecificResources = async (
  endpoint: string,
  params?: Record<string, any>
) => {
  if (isSandbox()) return sbRun(sbApi.get(endpoint, { ...sbCfg(), params }));
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
}

export const getResource = async (endpoint: string, id: string) => {
  if (isSandbox()) return sbRun(sbApi.get(`${endpoint}/${id}`, sbCfg()));
  try {
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

export const updateResource = async (
  endpoint: string,
  id: string,
  data: any
) => {
  if (isSandbox()) return sbRun(sbApi.put(`${endpoint}/${id}`, data, sbCfg()));
  try {
    const response = await api.put(`${endpoint}/${id}`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

export const deleteResource = async (endpoint: string, id: string) => {
  if (isSandbox()) return sbRun(sbApi.delete(`${endpoint}/${id}`, sbCfg()));
  try {
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message 
      || 'An unexpected error occurred';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

export const cityAPI = {
  getAll: () => getResources("/cities"),
  getById: (id: string) => getResource("/cities", id),
  create: (data: any) => createResource("/cities", data),
  update: (id: string, data: any) => updateResource("/cities", id, data),
  delete: (id: string) => deleteResource("/cities", id),
};


export const stateAPI = {
  getAll: () => getResources("/states"),
  getById: (id: string) => getResource("/states", id),
  create: (data: any) => createResource("/states", data),
  update: (id: string, data: any) => updateResource("/states", id, data),
  delete: (id: string) => deleteResource("/states", id),
}


// Specific API endpoints
export const itemsAPI = {
  getAll: () => getResources("/items"),
  getById: (id: string) => getResource("/items", id),
  create: (data: any) => createResource("/items", data),
  update: (id: string, data: any) => updateResource("/items", id, data),
  delete: (id: string) => deleteResource("/items", id),
};

export const agencyAPI = {
  getAll: () => getResources("/agency"),
  getById: (id: string) => getResource("/agency", id),
  create: (data: any) => createResource("/agency", data),
  update: (id: string, data: any) => updateResource("/agency", id, data),
  delete: (id: string) => deleteResource("/agency", id),
};


// /issue-type
export const issueTypeAPI = {
  getAll: () => getResources("/issue-type"),
  getById: (id: string) => getResource("/issue-type", id),
  create: (data: any) => createResource("/issue-type", data),
  update: (id: string, data: any) => updateResource("/issue-type", id, data),
  delete: (id: string) => deleteResource("/issue-type", id),
};


// /resolution-status

export const resolutionStatusAPI = {
  getAll: () => getResources("/resolution-status"),
  getById: (id: string) => getResource("/resolution-status", id),
  create: (data: any) => createResource("/resolution-status", data),
  update: (id: string, data: any) =>
    updateResource("/resolution-status", id, data),
  delete: (id: string) => deleteResource("/resolution-status", id),
};


// /support-person

export const supportPersonAPI = {
  getAll: () => getResources("/support-person"),
  getById: (id: string) => getResource("/support-person", id),
  create: (data: any) => createResource("/support-person", data),
  update: (id: string, data: any) => updateResource("/support-person", id, data),
  delete: (id: string) => deleteResource("/support-person", id),
};

export const ticketsAPI = {
  getAll: () => getResources("/ticket"),
  getById: (id: string) => getResource("/ticket", id),
  getByType: (type: string) => getResources(`/ticket/type/${type}`),
  create: (data: any) => createResource("/ticket", data),
  update: (id: string, data: any) => updateResource("/ticket", id, data),
  updateResolution: (id: string, data: any) =>
    updateResource("/ticket", id, data),
  delete: (id: string) => deleteResource("/ticket", id),
};


export const ticketStatusAPI = {
  getAll: () => getResources("/ticket-status"),
  getById: (id: string) => getResource("/ticket-status", id),
  create: (data: any) => createResource("/ticket-status", data),
  update: (id: string, data: any) => updateResource("/ticket-status", id, data),
  delete: (id: string) => deleteResource("/ticket-status", id),
};



export const deliveryStatusAPI = {
  getAll: () => getResources("/delivery-status"),
  getById: (id: string) => getResource("/delivery-status", id),
  create: (data: any) => createResource("/delivery-status", data),
  update: (id: string, data: any) =>
    updateResource("/delivery-status", id, data),
  delete: (id: string) => deleteResource("/delivery-status", id),
};

export const installationStatusAPI = {
  getAll: () => getResources("/installation-status"),
  getById: (id: string) => getResource("/installation-status", id),
  create: (data: any) => createResource("/installation-status", data),
  update: (id: string, data: any) =>
    updateResource("/installation-status", id, data),
  delete: (id: string) => deleteResource("/installation-status", id),
};

export const itemGroupsAPI = {
  getAll: () => getResources("/item-groups"),
  getById: (id: string) => getResource("/item-groups", id),
  create: (data: any) => createResource("/item-groups", data),
  update: (id: string, data: any) => updateResource("/item-groups", id, data),
  delete: (id: string) => deleteResource("/item-groups", id),
};

export const logisticsProviderCategoriesAPI = {
  getAll: () => getResources("/logistics-provider-categories"),
  getById: (id: string) => getResource("/logistics-provider-categories", id),
  create: (data: any) => createResource("/logistics-provider-categories", data),
  update: (id: string, data: any) =>
    updateResource("/logistics-provider-categories", id, data),
  delete: (id: string) => deleteResource("/logistics-provider-categories", id),
};

// export const partiesAPI = {
//   getAll: () => getResources("/parties"),
//   getById: (id: string) => getResource("/parties", id),
//   create: (data: any) => createResource("/parties", data),
//   update: (id: string, data: any) => updateResource("/parties", id, data),
//   delete: (id: string) => deleteResource("/parties", id),
// };

export const partiesAPI = {
  getAll: () => getResources("/parties"),
  getById: (id: string) => getResource("/parties", id),
  create: (data: any) => createResource("/parties", data),
  update: (id: string, data: any) => updateResource("/parties", id, data),
  
  // Delete operations
  softDelete: (id: string, p0: { isActive: boolean; }) => updateResource("/parties", `${id}/soft-delete`, {}),
  hardDelete: (id: string) => deleteResource("/parties", `${id}/hard-delete`),
  restore: (id: string) => updateResource("/parties", `${id}/restore`, {}),
  getDeleted: () => getResources("/parties/trash/deleted"),
};

export const resellersAPI = {
  getAll: () => getResources("/resellers"),
  getById: (id: string) => getResource("/resellers", id),
  create: (data: any) => createResource("/resellers", data),
  update: (id: string, data: any) => updateResource("/resellers", id, data),
  delete: (id: string) => deleteResource("/resellers", id),
};

export const stockInsAPI = {
  getAll: () => getResources("/stock-ins"),
  getById: (id: string) => getResource("/stock-ins", id),
  create: (data: any) => createResource("/stock-ins", data),
  update: (id: string, data: any) => updateResource("/stock-ins", id, data),
  delete: (id: string) => deleteResource("/stock-ins", id),
};

export const stockInCategoriesAPI = {
  getAll: () => getResources("/stock-in-categories"),
  getById: (id: string) => getResource("/stock-in-categories", id),
  create: (data: any) => createResource("/stock-in-categories", data),
  update: (id: string, data: any) =>
    updateResource("/stock-in-categories", id, data),
  delete: (id: string) => deleteResource("/stock-in-categories", id),
};

export const stockOutCategoriesAPI = {
  getAll: () => getResources("/stock-out-categories"),
  getById: (id: string) => getResource("/stock-out-categories", id),
  create: (data: any) => createResource("/stock-out-categories", data),
  update: (id: string, data: any) =>
    updateResource("/stock-out-categories", id, data),
  delete: (id: string) => deleteResource("/stock-out-categories", id),
};

// export const checkStockOutStatus = async (req, res) => {
//   try {
//     const { serialNo } = req.params; // from URL

//     if (!serialNo) {
//       return res.status(400).json({ message: "serialNo is required" });
//     }

//     const stockItem = await StockItem.findOne({ serialNo }).select("serialNo stockOutId");

//     if (!stockItem) {
//       return res.status(404).json({ message: "Stock Item not found" });
//     }

//     // Check if stockOutId exists
//     const isStockedOut = !!stockItem.stockOutId;

//     res.status(200).json({
//       serialNo: stockItem.serialNo,
//       stockOutId: stockItem.stockOutId || null,
//       status: isStockedOut ? "Stocked Out" : "Available",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message + " - Error checking stock-out status" });
//   }
// };
// router.get("/stock-items/check/:serialNo", checkStockOutStatus);

// router.get("/api/stock-items/check-by-id", checkStockItemStatusStockItem);

export const stockItemsAPI = {
  getAll: (params?: {
    itemId?: string;
    $sort?: Record<string, 1 | -1>;
    $limit?: number;
    $select?: string[];
  }) => getResources("/stock-items", params),
  getSpecific: (itemId: string) =>
    getSpecificResources(`/available-stock-items/?itemId=${itemId}`),
  getStockItemCheckById: (id: string) => 
  getResources(`/stock-items/check-by-id/${id}`),
  getBySerialNo: (serialNo: string) =>
    getSpecificResources('/stock-items/check',{serialNo}),
  getById: (id: string) => getResource("/stock-items", id),
  create: (data: any) => createResource("/stock-items", data),
  update: (id: string, data: any) => updateResource("/stock-items", id, data),
  delete: (id: string) => deleteResource("/stock-items", id),
};

export const stockOutsAPI = {
  getAll: () => getResources("/stock-outs"),
  getById: (id: string) => getResource("/stock-outs", id),
  create: (data: any) => createResource("/stock-outs", data),
  update: (id: string, data: any) => updateResource("/stock-outs", id, data),
  delete: (id: string) => deleteResource("/stock-outs", id),
};

export const storesAPI = {
  getAll: () => getResources("/stores"),
 getStoreByPartyId: (partyId: string) => getResources(`/storeByPartyId/${partyId}`),
  getById: (id: string) => getResource("/stores", id),
  create: (data: any) => createResource("/stores", data),
  update: (id: string, data: any) => updateResource("/stores", id, data),
  delete: (id: string) => deleteResource("/stores", id),
};

export const warehousesAPI = {
  getAll: () => getResources("/warehouses"),
  getById: (id: string) => getResource("/warehouses", id),
  create: (data: any) => createResource("/warehouses", data),
  update: (id: string, data: any) => updateResource("/warehouses", id, data),
  delete: (id: string) => deleteResource("/warehouses", id),
};

export const itemStockRecordsAPI = {
  getAll: (params?: {
    itemId?: string;
    $sort?: Record<string, 1 | -1>;
    $limit?: number;
    $select?: string[];
  }) => getResources("/item-stock-records", params),
  getById: (id: string) => getResource("/item-stock-records", id),
  create: (data: any) => createResource("/item-stock-records", data),
  update: (id: string, data: any) =>
    updateResource("/item-stock-records", id, data),
  delete: (id: string) => deleteResource("/item-stock-records", id),
};

// Image management API functions
export const imageAPI = {
  // Single upload URL
  getSingleUploadUrl: async (fileName: string, contentType: string) => {
    const response = await api.post("/images/upload-url", {
      fileName,
      contentType,
    });
    return response.data;
  },

  // Batch upload URLs
  getBatchUploadUrls: async (files: Array<{ fileName: string; contentType: string }>) => {
    const response = await api.post("/images/batch-upload-urls", {
      files,
    });
    return response.data;
  },

  // Single download URL
  getSingleDownloadUrl: async (key: string) => {
    const response = await api.get(`/images/download-url?key=${encodeURIComponent(key)}`);
    return response.data;
  },

  // Multiple download URLs
  getMultipleDownloadUrls: async (keys: string[]) => {
    const response = await api.post("/images/download-urls", {
      keys,
    });
    return response.data;
  },

  // Delete single image
  deleteSingle: async (key: string) => {
    const response = await api.delete(`/images/delete?key=${encodeURIComponent(key)}`);
    return response.data;
  },

  // Bulk delete images
  bulkDelete: async (keys: string[]) => {
    const response = await api.delete("/images", {
      data: { keys },
    });
    return response.data;
  },

  // Upload file directly to S3
  uploadToS3: async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    return response;
  },
};

export default api;
