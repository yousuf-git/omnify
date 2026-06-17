import type { Theme } from "@emotion/react";
import type { SxProps } from "@mui/material";
import type { Transaction } from "../pages/ItemStockRecord";
import { it } from "date-fns/locale";
export interface Item {
  _id: string;
  itemId: string;
  itemName: string;
  modelNoSKU: string;
  requiresInstallation: "yes" | "no";
  requiresSerialNumberManagement: "yes" | "no";
  itemGroupId: string;
  itemGroupName?: string;
  unit: string;
  description: string;
  createdAt?: string;
  isActive: boolean;
  updatedAt?: string;
  openingStock?: number;
  remainingStock?: number;
  closingStock?: number;
  barcodes: string[];
}

export interface ItemGroup {
  _id?: string;
  itemGroupId?: string;
  itemGroupName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Warehouse {
  _id?: string;
  warehouseId?: string;
  warehouseName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface City {
  _id?: string;
  cityId?: string;
  cityName: string;
  stateId: string | State;
  stateName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FilterCity {
  search: string;
  cityName: string;
  stateId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface State {
  _id?: string;
  stateId?: string;
  stateName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FilterStates {
  search: string;
  stateName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstallationStatus {
  _id?: string;
  installationStatusId?: string;
  installationStatusName: string;
  isActive: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterInstallationStatus {
  search: string;
  installationStatusName: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface DeliveryStatus {
  _id?: string;
  deliveryStatusId?: string;
  deliveryStatusName: string;
  isActive: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterDeliveryStatus {
  search: string;
  deliveryStatusName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketStatus {
  _id?: string;
  ticketStatusId?: string;
  name: string;
  isActive: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterTicketStatus {
  search: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Agency {
  _id?: string;
  id?: string;
  agencyId?: string;
  agencyName: string;
  agencyNumber: string;
  cityId: string | City;
  cityName?: string;
  stateId: string | State;
  stateName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface FilterAgency {
  search: string;
  agencyName: string;
  agencyNumber: string;
  cityId: string;
  stateId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueType {
  _id?: string;
  issueTypeId?: string;
  issueTypeName: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterIssueType {
  search: string;
  issueTypeName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResolutionStatus {
  _id?: string;
  resolutionStatusId?: string;
  resolutionStatusName: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterResolutionStatus {
  search: string;
  resolutionStatusName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reseller {
  _id?: string;
  resellerId?: string;
  resellerName: string;
  address: string;
  gstn: string;
  isActive: boolean;
  cityId: string | City;
  stateId: string | State;
  shippingAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Party {
  _id?: string;
  partyId?: string;
  partyName: string;
  address: string;
  cityId: string | City;
  stateId: string | State;
  gstn: string;
  isActive: boolean;
  shippingAddress: string;
  resellerId: string | Reseller;
  resellerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterParty {
  search: string;
  partyId: string;
  partyName: string;
  cityId: string;
  stateId: string;
  address: string;
  gstn: string;
  shippingAddress: string;
  resellerId?: string;
  resellerName?: string;
  createdAt?: string;
}

export interface SupportPerson {
  _id?: string;
  supportPersonId?: string;
  supportPersonName: string;
  supportPersonNumber: string;
  cityId: string | City;
  stateId: string | State;
  isActive: boolean;
  agencyId: string;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterSupportPerson {
  search: string;
  supportPersonName: string;
  supportPersonNumber: string;
  cityId: string;
  stateId: string;
  agencyId?: string;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
  
}

export interface StockInCategory {
  _id?: string;
  stockInCategoryId?: string;
  stockInCategoryName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StockOutCategory {
  _id?: string;
  stockOutCategoryId?: string;
  stockOutCategoryName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface FilterState {
  search: string;
  requiresInstallation: string;
  requiresSerialNumberManagement: string;
  itemGroupId?: string;
  itemGroupName?: string;
}

export interface FilterItemGroup {
  search: string;
  createdAt?: string;
  itemGroupName?: string;
}

export interface FilterWarehouse {
  search: string;
  createdAt?: string;
  warehouseName?: string;
}

export interface FilterStockInCategory {
  search: string;
  createdAt?: string;
  stockInCategoryName?: string;
}

export interface FilterStockOutCategory {
  search: string;
  createdAt?: string;
  stockOutCategoryName?: string;
}

export interface FilterReseller {
  search: string;
  createdAt?: string;
  resellerName?: string;
  cityId?: string;
  stateId?: string;
}

export interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface StockOutItem {
  itemId: string;
  quantity: number;
  barcodes: string[];
  serialNo?: string[];
  deliveryStatusId: string;
  installationStatusId: string;

  // ...other item-specific fields
  item?: {
    _id: string;
    itemName: string;
    requiresInstallation: "yes" | "no";
    requiresSerialNumberManagement: "yes" | "no";
    unit: string;
    modelNoSKU: string;
  };
}

export interface StockOutFormItem extends StockOutItem {
  _id?: string;
  stockItemId?: string;
  itemName?: string;
  modelNoSKU?: string;
  unit?: string;
  installationStatusName?: string;
  deliveryStatusName?: string;
  remainingStock?: number;
  requiresInstallation?: boolean; // Add this
  requiresSerialNumberManagement?: boolean; // Add this
}

export interface StockOutFormData {
  _id?: string;
 stockOutDate: string;
  logisticsProviderCategoryId?: string | null | undefined;
  logisticsProviderCategoryName?: string;
  stockOutCategoryId: string;
  stockOutCategoryName?: string;
  partyId: string;
  partyName?: string;
  storeId?: string;
  storeName?: string;
  warehouseId: string;
  warehouseName?: string;
  trackingNo?: string;
  date: string;
  invoiceNo?: string;
  notes?: string;
  items: StockOutFormItem[];
}
export interface StockOut {
  _id?: string;
  stockOutId: number;
  stockOutDate: string;
  logisticsProviderCategoryId: string;
  logisticsProviderCategoryName?: string;
  partyId: string;
  storeId: string;
  stockOutCategoryId: string;
  warehouseId: string;
  trackingNo?: string;
  date: string;
  invoiceNo?: string;
  notes?: string;
  items: StockOutItem[];
  deliveryStatusId?: string[];
  installationStatusId?: string[];
  serialNo?: string[];
  isActive: boolean;
  quantity?: number[];
  itemId?: string[];
  createdAt?: string;
  updatedAt?: string;
  // These can be populated when querying if needed
  logisticsProviderCategory?: {
    _id: string;
    logisticsProviderCategoryName: string;
  };
  party?: {
    _id: string;
    partyName: string;
  };
  store?: {
    _id: string;
    storeName: string;
  };
  warehouse?: {
    _id: string;
    warehouseName: string;
  };
}

export interface FilterStockOut {
  search: string;
  createdAt?: string;
  updatedAt?: string;
  stockOutCategoryId?: string;
  stockOutCategoryName?: string;
  itemGroupId?: string;
  itemGroupName?: string;
  logisticsProviderCategoryId?: string;
  logisticsProviderCategoryName?: string;
  deliveryStatusId?: string;
  deliveryStatusName?: string;
  installationStatusId?: string;
  installationStatusName?: string;
  itemId?: string;
  itemName?: string;
  partyId?: string;
  partyName?: string;
  warehouseId?: string;
  warehouseName?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockIn {
  _id?: string;
  stockInId: number;
  stockInDate: string;
  itemId: string[];
  partyId: string;
  stockInCategoryId: string;
  warehouseId: string;
  opening: number;
  closing: number;
  stockAdded: number;
  stockRemaining: number;
  invoiceNo?: string;
  notes?: string;
  remainingStock?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  date: string;
  barcodes: string[];
  // These can be populated when querying if needed
  item?: {
    _id: string;
    itemName: string;
  };
  party?: {
    _id: string;
    partyName: string;
  };
  category?: {
    _id: string;
    categoryName: string;
  };
  warehouse?: {
    _id: string;
    warehouseName: string;
  };
}

export interface StockInFilterState {
  search: string;
  warehouseId: string;
  date?: string;
  partId?: string;
  itemId?: string;
}

// types.ts
export interface FilterConfig<T extends string> {
  field: T;
  label: string;
  type: "text" | "select" | "multiselect" | "date" | "number";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
}

export interface DialogTextConfig {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
}

export interface ImportExportConfig<T> {
  supportedFormats: Array<{
    label: string;
    extension: string;
    mimeType: string;
  }>;
  headers: Array<{
    field: keyof T;
    label: string;
    required?: boolean;
    transform?: (value: any) => string;
    parse?: (value: string) => any;
  }>;
  validation?: (data: Partial<T>) => string | null;
}

export interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface EmptyState {
  title?: string;
  message?: string;
  component?: React.ReactNode;
}

// Define Column type
export interface TableColumn<T> {
  id: keyof T | string | number;
  label: string;
  minWidth?: number;
  align?: "left" | "center" | "right";
  format?: (value: any, row: T) => React.ReactNode;
  renderCell?: (row: T) => React.ReactNode;
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
  sortable?: boolean;
  sticky?: boolean;
}

// Define Action type
export interface TableAction<T> {
  icon: React.ReactNode;
  tooltip: string;
  color: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  onClick: (row: T) => void;
}

export interface TableProps<T extends object> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  pagination?: {
    page: number;
    rowsPerPage: number;
    totalRows: number;
    serverSide: boolean;
    rowsPerPageOptions?: number[];
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
  };
  emptyState?: EmptyState;
  sx?: SxProps<Theme>;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  disableInternalSort?: boolean;
  /** Prepend an auto-numbered "Sr." column (respects pagination). */
  serialColumn?: boolean;
}

export interface StockItem {
  _id?: string;
  stockItemId: string;
  itemId: string;
  itemName?: string;
  serialNo: string;
  stockInId: string;
  stockOutId: string;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
  hasTicket?: boolean;
}

export interface FilterStockItem {
  search: string;
  stockItemId: string;
  itemId: string;
  serialNo: string;
  stockInId: string;
  stockOutId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id?: string;
  storeId?: number;
  storeName: string;
  cityId: string | City;
  stateId: string | State;
  storeState: string;
  storeAddress: string;
  storePinCode: string;
  partyId?: string | Party;
  partyName?: string;
  smName: string;
  smContactNo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterStore {
  search: string;
  storeId: number;
  storeName: string;
  cityId: string;
  stateId: string;
  storeState: string;
  storeAddress: string;
  storePinCode: string;
  smName: string;
  smContactNo: string;
}

// api/types.ts
export interface FilterBase {
  search?: string;
  [key: string]: any; // Allows additional filter properties
}

export interface LogisticsProviderCategory {
  _id?: string;
  logisticsProviderCategoryId?: number;
  logisticsProviderCategoryName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterLogisticsProviderCategory {
  search: string;
  logisticsProviderCategoryId: number;
  logisticsProviderCategoryName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterStockIn {
  search?: string;
  itemId?: string | string[];
  itemName?: string;
  partyId?: string;
  partyName?: string;
  categoryId?: string;
  categoryName?: string;
  warehouseId?: string;
  warehouseName?: string;
  warehouseStatus?: "all" | "active" | "inactive";
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any; // Allows additional filter properties
}

// itemStockRecordId: Number,
//   itemId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Item',
//       required: true
//   },
//   openingStock: {
//       type: Number,
//       required: true
//   },
//   closingStock: {
//       type: Number,
//       required: true
//   },
//   remainingStock: {
//       type: Number,
//       required: true
//   }

export interface ItemStockRecord {
  _id?: string;
  itemStockRecordId: number;
  itemId: string;
  stockInId?: string;
  stockOutId?: string;
  year?: string;
  openingStock: number;
  closingStock: number;
  remainingStock: number;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterItemStockRecord {
  search: string;
  itemStockRecordId: number;
  itemId: string;
  openingStock: number;
  closingStock: number;
  remainingStock: number;
  createdAt: string;
  updatedAt: string;
  year: string;
}

// types.ts

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "password"
  | "email"
  | "switch";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    customValidator?: (value: any) => string | null;
  };
}

export interface FormConfig<T = any> {
  title: string;
  description: string;
  fields: FormField[];
  createEndpoint?: string;
  updateEndpoint?: string;
  defaultValues?: Partial<T>;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  transformData?: (data: T) => any;
  navLinkOnCancel?: string;
}

export interface GenericFormProps<T extends Record<string, any>> {
  title: string;
  description: string;
  fields: FormField[];
  createEndpoint?: string;
  updateEndpoint?: string;
  defaultValues?: Partial<T>;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  transformData?: (data: Partial<T>) => any;
  navLinkOnCancel?: string;
}

export interface FilterTicket {
  search?: string;
  ticketType?: "INSTALLATION" | "SUPPORT" | undefined;
  ticketStatusId?: string;
  resolutionStatusId?: string;
  issueTypeId?: string;
  storeId?: string;
  stateId?: string;
  rating: number | string; 
  ratingSort: string;
  supportPersonId?: string;
  dateFrom?: string;
  dateTo?: string;
  storeStatus?: "all" | "active" | "inactive";
}

export interface Ticket {
  _id?: string;
  ticketId: string;
  ticketType: "INSTALLATION" | "SUPPORT";
  ticketStatusId: string | TicketStatus; // Can be string ID or populated object
  resolutionStatusId?: string | ResolutionStatus; // Can be string ID or populated object
  supportPersonId?: string | SupportPerson; // Can be string ID or populated object
  issueTypeId: string | IssueType; // Can be string ID or populated object
  stockItemId: string | StockItem; // Can be string ID or populated object
  storeId: string | Store; // Can be string ID or populated object
  assignedToId?: string | AssignedTo; // Can be string ID or populated object (optional)
  openingDate: string;
  resolutionDate?: string;
  callId: string;
  rating: number;
  callIdDate: string;
  pictures?: string[];
  notes?: string; // Optional notes field
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdAtFormatted?: string;
  updatedAtFormatted?: string;
}

export interface FilterUser {
  search: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AssignedTo {
  _id?: string;
  assignedToId?: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterAssignedTo {
  search: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
