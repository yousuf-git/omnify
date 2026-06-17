import { Add, ArrowBack, Delete } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { enGB } from 'date-fns/locale/en-GB'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getResources,
  getSpecificResources,
  updateResource
} from '../../api/api'
import type {
  DeliveryStatus,
  InstallationStatus,
  ItemStockRecord,
  LogisticsProviderCategory,
  StockItem,
  StockOut,
  StockOutCategory,
  StockOutFormData,
  StockOutFormItem,
  Store,
  Warehouse
} from '../../api/types'
import { useStockApi } from '../../hooks/useStockApi'
import { useStockFormValidation } from '../../hooks/useStockFormValidation'
import { toDate } from '../../utils/safeDate'
import { BarcodeManager } from '../shared/BarcodeManager'
import { ItemSelector } from '../shared/ItemSelector'

interface Party {
  _id: string
  partyName: string
  gstn?: string
}

interface Item {
  _id: string
  itemName: string
  modelNoSKU: string
  unit?: string
  requiresInstallation?: boolean
  requiresSerialNumberManagement?: boolean
  currentStock?: number
}

interface StockOutFormProps {
  stockOutData?: StockOut | null
  onSuccess?: () => void
  onCancel?: () => void
  isEditMode?: boolean
}

export default function StockOutForm ({
  stockOutData,
  onSuccess,
  onCancel,
  isEditMode = false
}: StockOutFormProps) {
  const navigate = useNavigate()
  const OTHER_OPTION_VALUE = 'OTHER'

  // Form state
  const [formData, setFormData] = useState<StockOutFormData>({
    stockOutDate: new Date().toISOString(),
    logisticsProviderCategoryId: null,
    logisticsProviderCategoryName: '',
    stockOutCategoryId: '',
    stockOutCategoryName: '',
    storeId: '',
    partyId: '',
    warehouseId: '',
    trackingNo: '',
    date: new Date().toISOString(),
    invoiceNo: '',
    notes: '',
    items: [
      {
        itemId: '',
        deliveryStatusId: '',
        installationStatusId: '',
        quantity: 0,
        barcodes: [],
        remainingStock: 0
      }
    ]
  })

  const [currentBarcodeItemIndex, setCurrentBarcodeItemIndex] = useState<
    number | string | null
  >(null)

  // Data state
  const [items, setItems] = useState<Item[]>([])
  const [parties, setParties] = useState<Party[]>([])
  // Add filteredParties state
  const [filteredParties, setFilteredParties] = useState<Party[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [stockOutCategories, setStockOutCategories] = useState<
    StockOutCategory[]
  >([])
  const [installationStatuses, setInstallationStatuses] = useState<
    InstallationStatus[]
  >([])
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([])
  const [logisticsProviderCategories, setLogisticsProviderCategories] =
    useState<LogisticsProviderCategory[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [itemStockRecords, setItemStockRecords] = useState<ItemStockRecord[]>(
    []
  )

  const [isloading, setIsLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  })
  const [barcodeIdMaps, setBarcodeIdMaps] = useState<
    Record<string, Record<string, string>>
  >({})
  // Custom hooks
  const { errors, validateStockOutForm, clearErrors } = useStockFormValidation({
    requireInvoice: false,
    requireBarcodes: false,
    allowNegativeStock: false
  })

  const {
    isLoading,
    error: apiError,
    createStockOut,
    updateStockOut
  } = useStockApi()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const [
          itemsRes,
          partiesRes,
          storesRes,
          warehousesRes,
          installationStatusesRes,
          deliveryStatusesRes,
          stockOutCategoriesRes,
          logisticsProviderCategoriesRes,
          itemStockRecordsRes,
          stockItemRes
        ] = await Promise.all([
          getResources('/items').catch(() => []),
          getResources('/parties').catch(() => []),
          getResources('/stores').catch(() => []),
          getResources('/warehouses').catch(() => []),
          getResources('/installation-status').catch(() => []),
          getResources('/delivery-status').catch(() => []),
          getResources('/stock-out-categories').catch(() => []),
          getResources('/logistics-provider-categories').catch(() => []),
          getResources('/item-stock-records').catch(() => []),
          getResources('/stock-items').catch(() => [])
        ])

        setItems(Array.isArray(itemsRes) ? itemsRes : [])
        setParties(Array.isArray(partiesRes) ? partiesRes : [])
        setStores(Array.isArray(storesRes) ? storesRes : [])
        setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : [])
        setInstallationStatuses(
          Array.isArray(installationStatusesRes) ? installationStatusesRes : []
        )
        setStockOutCategories(
          Array.isArray(stockOutCategoriesRes) ? stockOutCategoriesRes : []
        )
        setDeliveryStatuses(
          Array.isArray(deliveryStatusesRes) ? deliveryStatusesRes : []
        )
        setLogisticsProviderCategories(
          Array.isArray(logisticsProviderCategoriesRes)
            ? logisticsProviderCategoriesRes
            : []
        )
        setItemStockRecords(
          Array.isArray(itemStockRecordsRes) ? itemStockRecordsRes : []
        )

        if (isEditMode && stockOutData) {
          await populateFormForEdit(
            stockOutData,
            Array.isArray(partiesRes) ? partiesRes : [],
            Array.isArray(storesRes) ? storesRes : [],
            Array.isArray(warehousesRes) ? warehousesRes : [],
            Array.isArray(deliveryStatusesRes) ? deliveryStatusesRes : [],
            Array.isArray(stockOutCategoriesRes) ? stockOutCategoriesRes : [],
            Array.isArray(installationStatusesRes)
              ? installationStatusesRes
              : [],
            Array.isArray(logisticsProviderCategoriesRes)
              ? logisticsProviderCategoriesRes
              : [],
            Array.isArray(itemsRes) ? itemsRes : [],
            Array.isArray(itemStockRecordsRes) ? itemStockRecordsRes : [],
            Array.isArray(stockItemRes) ? stockItemRes : []
          )
        }
      } catch (error: any) {
        console.error('Error loading data:', error)
        showSnackbar(`Error: ${error.message}`, 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [stockOutData, isEditMode])

  const populateFormForEdit = async (
    stockOutData: StockOut,
    partiesRes: Party[],
    storesRes: Store[],
    warehousesRes: Warehouse[],
    deliveryStatusesRes: DeliveryStatus[],
    stockOutCategoriesRes: StockOutCategory[],
    installationStatusesRes: InstallationStatus[],
    logisticsProviderCategoriesRes: LogisticsProviderCategory[],
    itemsRes: Item[],
    itemStockRecordsRes: ItemStockRecord[],
    stockItemRes: StockItem[]
  ) => {
    try {
      // console.log("Populating form for edit with data:", stockOutData);
      // console.log("Stock Items received:", stockItemRes);
      // console.log("Looking for stockOutId:", stockOutData._id);
      
      // Create barcodeIdMaps for tracking database IDs of barcodes
      const barcodeIdMaps: Record<string, Record<string, string>> = {}

      // Filter stock items by stockOutId and create barcode mappings
      const stockItemsForThisStockOut = stockItemRes.filter(
        (stockItem: StockItem) => stockItem.stockOutId === stockOutData._id
      )
      // console.log("Filtered stock items for this stock out:", stockItemsForThisStockOut);
      
      stockItemsForThisStockOut.forEach((stockItem: StockItem) => {
        if (stockItem.serialNo && stockItem.itemId) {
          if (!barcodeIdMaps[stockItem.itemId]) {
            barcodeIdMaps[stockItem.itemId] = {}
          }
          barcodeIdMaps[stockItem.itemId][stockItem.serialNo] = stockItem._id!
        }
      })

      setBarcodeIdMaps(barcodeIdMaps)
      // --- Helpers ---
      const extractId = (val: any): string => {
        if (!val) return ''
        if (typeof val === 'string') return val
        if (Array.isArray(val) && val[0]) return extractId(val[0])
        if (typeof val === 'object') return val._id || val.id || ''
        return ''
      }

      const extractName = (val: any, field: string): string => {
        if (!val) return ''
        if (typeof val === 'string') return val
        if (Array.isArray(val) && val[0]) return extractName(val[0], field)
        if (typeof val === 'object' && val[field]) return val[field]
        return ''
      }

      // --- Related entities ---
      const selectedParty = partiesRes.find(
        p => p._id === extractId(stockOutData.partyId)
      )
      const selectedStore = storesRes.find(
        s => s._id === extractId(stockOutData.storeId)
      )
      const selectStockOutCategory = stockOutCategoriesRes.find(
        c => c._id === extractId(stockOutData.stockOutCategoryId)
      )
      const selectedWarehouse = warehousesRes.find(
        w => w._id === extractId(stockOutData.warehouseId)
      )
      const selectedCategory = logisticsProviderCategoriesRes.find(
        c => c._id === extractId(stockOutData.logisticsProviderCategoryId)
      )
      const isOtherOption = stockOutData.logisticsProviderCategoryId === null
      // --- Items processing ---
      // Get item IDs from either the items array or the itemId array
      const itemIds =
        stockOutData.items && stockOutData.items.length > 0
          ? stockOutData.items.map(item => extractId(item.itemId))
          : (stockOutData.itemId || []).map(id => extractId(id))

      const initialItems = await Promise.all(
        itemIds.map(async (itemId, index) => {
          try {
            if (!itemId) {
              console.warn(`Missing itemId at index ${index}`, stockOutData)
              return null
            }

            const selectedItem = itemsRes.find(i => i._id === itemId)
            if (!selectedItem) {
              console.warn(`Item not found: ${itemId}`)
              return null
            }

            // Get delivery status ID - check both items array and deliveryStatusId array
            let deliveryStatusId = ''
            if (stockOutData.items && stockOutData.items[index]) {
              deliveryStatusId = extractId(
                stockOutData.items[index].deliveryStatusId
              )
            } else if (
              stockOutData.deliveryStatusId &&
              stockOutData.deliveryStatusId[index]
            ) {
              deliveryStatusId = extractId(stockOutData.deliveryStatusId[index])
            }

            // Get installation status ID - check both items array and installationStatusId array
            let installationStatusId = ''
            if (stockOutData.items && stockOutData.items[index]) {
              installationStatusId = extractId(
                stockOutData.items[index].installationStatusId
              )
            } else if (
              stockOutData.installationStatusId &&
              stockOutData.installationStatusId[index]
            ) {
              installationStatusId = extractId(
                stockOutData.installationStatusId[index]
              )
            }

            // Get quantity - check both items array and quantity array
            let quantity = 0
            if (stockOutData.items && stockOutData.items[index]) {
              quantity = Number(stockOutData.items[index].quantity || 0)
            } else if (stockOutData.quantity && stockOutData.quantity[index]) {
              quantity = Number(stockOutData.quantity[index] || 0)
            }
            const itemBarcodes = stockItemRes
              .filter(
                (s: StockItem) => s.itemId === itemId && s.stockOutId === stockOutData._id && s.serialNo
              )
              .map((s: StockItem) => s.serialNo)
              .filter((serialNo: string) => serialNo && serialNo.trim() !== '')

            let barcodes: string[] = []
            if (stockOutData.items && stockOutData.items[index]) {
              const itemData = stockOutData.items[index]
              if (itemData.barcodes) {
                barcodes = Array.isArray(itemData.barcodes)
                  ? itemData.barcodes
                  : [itemData.barcodes]
              } else if (itemData.serialNo) {
                barcodes = Array.isArray(itemData.serialNo)
                  ? itemData.serialNo
                  : [itemData.serialNo]
              }
            } else if (stockOutData.serialNo && stockOutData.serialNo[index]) {
              // Fallback to top-level serialNo array if items array doesn't have barcodes
              barcodes = Array.isArray(stockOutData.serialNo[index])
                ? stockOutData.serialNo[index]
                : [stockOutData.serialNo[index]]
            }

            // Find delivery and installation status objects
            const selectedDelivery = deliveryStatusesRes.find(
              d => d._id === deliveryStatusId
            )
            const selectedInstallation = installationStatusesRes.find(
              i => i._id === installationStatusId
            )

            // Remaining stock lookup
            let remainingStock = 0
            const currentYear = new Date().getFullYear().toString()
            const stockRecord = itemStockRecordsRes.find(
              r => r.itemId === itemId && (!r.year || r.year === currentYear)
            )
            remainingStock = stockRecord?.remainingStock || 0
            const convertToBoolean = (value: any): boolean => {
              if (typeof value === 'boolean') return value
              if (typeof value === 'string')
                return value.toLowerCase() === 'yes'
              return false
            }

            return {
              itemId,
              itemName: selectedItem.itemName,
              modelNoSKU: selectedItem.modelNoSKU,
              unit: selectedItem.unit,
              barcodes: itemBarcodes || [],
              barcodeIdMap: barcodeIdMaps[itemId] || {},
              // requiresInstallation: selectedItem.requiresInstallation === "yes" || selectedItem.requiresInstallation === true,
              // requiresSerialNumberManagement: selectedItem.requiresSerialNumberManagement === "yes" || selectedItem.requiresSerialNumberManagement === true,
              // Then use it:
              requiresInstallation: convertToBoolean(
                selectedItem.requiresInstallation
              ),
              requiresSerialNumberManagement: convertToBoolean(
                selectedItem.requiresSerialNumberManagement
              ),
              deliveryStatusId,
              deliveryStatusName: selectedDelivery?.deliveryStatusName || '',
              installationStatusId,
              installationStatusName:
                selectedInstallation?.installationStatusName || '',
              quantity,
              // barcodes,
              remainingStock
            }
          } catch (error: any) {
            console.error(`Error processing item at index ${index}`, error)
            showSnackbar(`Error: ${error.message}`, 'error')
            return null
          }
        })
      )

      // Filter out any null items
      const validItems = initialItems.filter(Boolean) as StockOutFormItem[]

      // --- Final form state ---
      const formDataToSet: StockOutFormData = {
        _id: stockOutData._id,
        stockOutDate: stockOutData.stockOutDate || stockOutData.date || '',
        logisticsProviderCategoryId: isOtherOption
          ? null
          : selectedCategory?._id?.toString() ||
            extractId(stockOutData.logisticsProviderCategoryId) ||
            '',
        logisticsProviderCategoryName:
          stockOutData.logisticsProviderCategoryName || '',
        storeId: extractId(stockOutData.storeId),
        storeName:
          selectedStore?.storeName ||
          extractName(stockOutData.storeId, 'storeName'),
        partyId: extractId(stockOutData.partyId),
        partyName:
          selectedParty?.partyName ||
          extractName(stockOutData.partyId, 'partyName'),
        stockOutCategoryId: extractId(stockOutData.stockOutCategoryId),
        stockOutCategoryName:
          selectStockOutCategory?.stockOutCategoryName ||
          extractName(stockOutData.stockOutCategoryId, 'stockOutCategoryName'),
        warehouseId: extractId(stockOutData.warehouseId),
        warehouseName:
          selectedWarehouse?.warehouseName ||
          extractName(stockOutData.warehouseId, 'warehouseName'),
        trackingNo: stockOutData.trackingNo || '',
        date: stockOutData.date || new Date().toISOString(),
        invoiceNo: stockOutData.invoiceNo || '',
        notes: stockOutData.notes || '',
        items:
          validItems.length > 0
            ? validItems
            : [
                {
                  itemId: '',
                  deliveryStatusId: '',
                  installationStatusId: '',
                  quantity: 0,
                  barcodes: [],
                  remainingStock: 0
                }
              ]
      }

      // console.log("Final form data to set:", formDataToSet);
      setFormData(formDataToSet)
      // NOTE: stock record adjustments are handled by backend on update; no client-side original-quantity tracking needed
    } catch (error: any) {
      console.error('Error populating form for edit:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
    }
  }

  // Resolve a store's party reference (populated object or plain id) to an id.
  const storePartyIdOf = (store: any): string => {
    const p = store.partyId
    if (p && typeof p === 'object') return p._id || p.id || ''
    return p || ''
  }

  useEffect(() => {
    const localFilter = () =>
      stores.filter(store => storePartyIdOf(store) === formData.partyId)

    const filterStoresByParty = async () => {
      if (!formData.partyId) {
        setFilteredStores(stores)
        return
      }
      let list: Store[] = []
      try {
        setIsLoading(true)
        const storesByParty = await getResources(`/storeByPartyId/${formData.partyId}`)
        list = Array.isArray(storesByParty) ? storesByParty : []
      } catch (error: any) {
        console.error('Error fetching stores by party:', error)
      } finally {
        setIsLoading(false)
      }

      // The dedicated endpoint is unavailable in sandbox / some backends and returns
      // nothing — fall back to filtering the already-loaded store list locally.
      if (list.length === 0) list = localFilter()
      setFilteredStores(list)

      if (list.length === 1 && !formData.storeId && !isEditMode) {
        setFormData(prev => ({
          ...prev,
          storeId: list[0]._id,
          storeName: list[0].storeName || ''
        }))
      }
    }

    filterStoresByParty()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.partyId, stores])
  // Find the selected store
  const selectedStore = filteredStores.find(
    store => store._id === formData.storeId
  )
  const showSnackbar = (
    message: string,
    severity: 'success' | 'warning' | 'error'
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    clearErrors()
  }

  // Update the validateBarcode function to use MongoDB ID
  const validateBarcode = async (stockItemId: string) => {
    try {
      const validationResult = await getResources(
        `/stock-items/check-by-id/${stockItemId}`
      )

      if (!validationResult.isValid) {
        return {
          valid: false,
          message: validationResult.message || 'Invalid stock item'
        }
      }

      if (validationResult.isStockedOut) {
        return {
          valid: false,
          message: 'This stock item is already stocked out'
        }
      }

      return { valid: true }
    } catch (error: any) {
      console.error('Error validating barcode:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
      return { valid: false, message: 'Error validating barcode' }
    }
  }

  // Existing handleDateChange function ko replace karo
  const isValidDate = (d: any): d is Date =>
    d instanceof Date && !isNaN(d.getTime())

  const handleDateChange = (date: Date | null) => {
    // Only update formData when a valid Date is provided.
    // This allows the user to type partial dates without causing errors.
    if (isValidDate(date)) {
      // Local date ko UTC mein convert karo without timezone shift
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
      setFormData(prev => ({
        ...prev,
        date: localDate.toISOString()
      }))
    } else if (date === null) {
      // cleared by user
      setFormData(prev => ({
        ...prev,
        date: ''
      }))
    } else {
      // invalid/partial input while typing - do not update formData
      // let the DatePicker's internal input handle the intermediate value
    }
    clearErrors()
  }

  // StockOutForm.tsx mein handleStockOutDateChange function ko update karein
  const handleStockOutDateChange = (date: Date | null) => {
    // Only set when value is a valid Date. This prevents errors while
    // the user is typing partial dates into the input.
    if (isValidDate(date)) {
      const isoDate = date.toISOString()
      setFormData(prev => ({
        ...prev,
        stockOutDate: isoDate
      }))
    } else if (date === null) {
      setFormData(prev => ({
        ...prev,
        stockOutDate: ''
      }))
    } else {
      // invalid/partial input - ignore until a valid date is produced
    }
    clearErrors()
  }

  const handleItemSelect = async (item: Item | null, itemIndex: number) => {
    if (!item) return

    const currentYear = new Date().getFullYear().toString()
    const itemStockRecords = await getResources(
      `/item-stock-records?itemId=${item._id}`
    )
    const currentStockRecord = itemStockRecords.find(
      (record: ItemStockRecord) => !record.year || record.year === currentYear
    )

    const remainingStock = currentStockRecord?.remainingStock || 0

    // Only show warning for items that require serial number management
    if (item.requiresSerialNumberManagement && remainingStock <= 0) {
      showSnackbar(`No stock available for ${item.itemName}`, 'warning')
      return
    }

    const newItems = [...formData.items]
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      itemId: item._id,
      itemName: item.itemName,
      modelNoSKU: item.modelNoSKU,
      unit: item.unit,
      requiresInstallation:
        (item.requiresInstallation as any) === true ||
        (item.requiresInstallation as any) === 'yes',
      requiresSerialNumberManagement:
        (item.requiresSerialNumberManagement as any) === true ||
        (item.requiresSerialNumberManagement as any) === 'yes',
      quantity: 0,
      barcodes: [],
      remainingStock: remainingStock
    }

    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const handleItemFieldChange = (idx: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[idx] = { ...newItems[idx], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: '',
          deliveryStatusId: '',
          installationStatusId: '',
          quantity: 0,
          barcodes: [],
          remainingStock: 0
        }
      ]
    }))
  }

  const removeItemRow = async (idx: number) => {
    // Cannot remove the last item from stock out
    if (formData.items.length === 1) {
      showSnackbar('At least one item is required', 'warning')
      return
    }
    const item = formData.items[idx]

    // If in edit mode, handle backend removal
    if (isEditMode && formData._id && item.itemId) {
      try {
        // Get item data to check if it requires serial number management or installation
        const itemData = items.find(i => i._id === item.itemId)
        const requiresSerialManagement =
          itemData?.requiresSerialNumberManagement
        const requiresInstallation = itemData?.requiresInstallation
        // console.log("Removing item:", item, typeof item.itemId,"Requires Serial Management:", requiresSerialManagement, "Requires Installation:", requiresInstallation);
        // Prepare payload for backend
        const payload = {
          itemId: [item.itemId], // Wrap in array
          quantity: [item.quantity], // Wrap in array
          serialNo: requiresSerialManagement ? [item.barcodes || []] : [[]], // Nested array
          deliveryStatusId: [item.deliveryStatusId], // Wrap in array
          installationStatusId: requiresInstallation
            ? [item.installationStatusId]
            : [null], // Wrap in array
          action: 'remove'
        }

        // Call backend to remove the item
        await updateResource('/stock-outs', formData._id, payload)

        // Update local state after successful backend removal
        setFormData(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== idx)
        }))

        showSnackbar('Item removed successfully!', 'success')
      } catch (error: any) {
        console.error('Error removing item:', error)
        showSnackbar(`Error: ${error.message}`, 'error')
      }
    } else {
      // Just update local state for new items
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== idx)
      }))
    }
  }

  const currentBarcodeItem: StockOutFormItem | null =
    currentBarcodeItemIndex !== null
      ? formData.items[currentBarcodeItemIndex as number]
      : null

  const openBarcodeManager = (idx: number) => {
    setCurrentBarcodeItemIndex(idx)
  }

  const closeBarcodeManager = () => {
    setCurrentBarcodeItemIndex(null)
  }

  const handleBarcodesChange = (barcodes: string[]) => {
    if (currentBarcodeItemIndex !== null) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === currentBarcodeItemIndex ? { ...item, barcodes } : item
        )
      }))
    }
  }

  // In the handleSubmit function, update the payload creation:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStockOutForm(formData, isEditMode)) {
      showSnackbar('Please fix all errors before submitting', 'error')
      return
    }

    try {
      let result
      // await validateStockAvailability();
      if (isEditMode && formData._id) {
        // Prepare payload for backend
        const payload: any = {
          stockOutDate: formData.stockOutDate,
          logisticsProviderCategoryId: formData.logisticsProviderCategoryId,
          logisticsProviderCategoryName:
            formData.logisticsProviderCategoryName || '',
          partyId: formData.partyId,
          stockOutCategoryId: formData.stockOutCategoryId,
          warehouseId: formData.warehouseId,
          itemId: formData.items.map(item => item.itemId),
          deliveryStatusId: formData.items.map(item => item.deliveryStatusId),
          installationStatusId: formData.items.map(item =>
            item.requiresInstallation ? item.installationStatusId : null
          ),
          quantity: formData.items.map(item => Number(item.quantity)),
          serialNo: formData.items.map(item => item.barcodes || []),
          trackingNo: formData.trackingNo || '',
          date: formData.date,
          ...(formData.invoiceNo?.trim() && {
            invoiceNo: formData.invoiceNo.trim()
          }),
          notes: formData.notes || '',
          action: 'update',
          // Explicitly set storeId to empty string to indicate removal
          storeId:
            formData.storeId && formData.storeId.trim() !== ''
              ? formData.storeId
              : ''
        }
        //  console.log("Stock Out Payload:", payload);

        result = await updateStockOut(formData._id, payload)
        showSnackbar('Stock Out record updated successfully!', 'success')

        // Backend handles item stock record updates and transactions for stock-out updates.
        // No client-side stock-record adjustments are performed here to avoid double updates.
      } else {
        const payload: any = {
          stockOutDate: formData.stockOutDate,
          logisticsProviderCategoryId: formData.logisticsProviderCategoryId,
          logisticsProviderCategoryName:
            formData.logisticsProviderCategoryName || '',
          partyId: formData.partyId,
          stockOutCategoryId: formData.stockOutCategoryId,
          warehouseId: formData.warehouseId,
          itemId: formData.items.map(item => item.itemId),
          deliveryStatusId: formData.items.map(item => item.deliveryStatusId),
          installationStatusId: formData.items.map(item =>
            item.requiresInstallation ? item.installationStatusId : null
          ),
          quantity: formData.items.map(item => Number(item.quantity)),
          serialNo: formData.items.map(item => item.barcodes || []),
          trackingNo: formData.trackingNo || '',
          date: formData.date,
          invoiceNo: formData.invoiceNo?.trim() || '',
          notes: formData.notes || '',
          // Set storeId to empty string if not provided, let backend handle it
          storeId:
            formData.storeId && formData.storeId.trim() !== ''
              ? formData.storeId
              : ''
        }
        //  console.log("Stock Out Payload created:", payload);
        result = await createStockOut(payload)
        showSnackbar('Stock Out record created successfully!', 'success')
      }
      // Handle success
      if (onSuccess) {
        onSuccess()
      } else if (!isEditMode) {
        resetForm()
        setTimeout(() => navigate('/StockOutPage'), 1500)
      } else {
        // For edit mode, navigate back after success
        setTimeout(() => navigate('/StockOutPage'), 1500)
      }
    } catch (error: any) {
      console.error('Submission error:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
      // showSnackbar(
      //   error instanceof Error ? error.message : "Failed to process stock out",
      //   "error"
      // );
    }
  }

  // Update the fetchAvailableBarcodes function
  const fetchAvailableBarcodes = async (itemId: string) => {
    try {
      const data = await getSpecificResources(`/available-stock-items`, {
        itemId,
        includeStockedOut: false // Only get available items
      })
      return data
    } catch (error: any) {
      console.error('Error fetching available barcodes:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
      return []
    }
  }

  const resetForm = () => {
    setFormData({
      stockOutDate: '',
      logisticsProviderCategoryId: '',
      logisticsProviderCategoryName: '',
      stockOutCategoryId: '',
      storeId: '',
      partyId: '',
      warehouseId: '',
      trackingNo: '',
      date: new Date().toISOString(),
      invoiceNo: '',
      notes: '',
      items: [
        {
          itemId: '',
          deliveryStatusId: '',
          installationStatusId: '',
          quantity: 0,
          barcodes: [],
          remainingStock: 0
        }
      ]
    })
  }
  // Update the handleBarcodeDelete function to use MongoDB ID
  const handleBarcodeDelete = async (barcode: string, stockItemId: string) => {
    try {
      // If stockOutId exists (edit mode with saved document), call backend barcode remover
      if (formData._id && currentBarcodeItem) {
        const currentBarcodes = currentBarcodeItem.barcodes || []
        const updatedBarcodes = currentBarcodes.filter(bc => bc !== barcode)
        const qtyToRestore = currentBarcodes.length - updatedBarcodes.length

        await updateResource('/stock-outs', formData._id as string, {
          itemId: [currentBarcodeItem.itemId],
          quantity: [currentBarcodeItem.quantity],
          serialNo: [currentBarcodes.filter(bc => bc === barcode)], // Send only the barcode being removed in nested array format
          action: 'barcoderemover'
        })
      }

      // Update frontend state (always do this regardless of backend call)
      setFormData(prev => {
        const newItems = prev.items.map(item =>
          item.barcodes?.includes(barcode)
            ? {
                ...item,
                barcodes: item.barcodes.filter(bc => bc !== barcode)
              }
            : item
        )
        return { ...prev, items: newItems }
      })

      showSnackbar('Barcode removed successfully!', 'success')
    } catch (error: any) {
      console.error('Error removing barcode:', error)
      showSnackbar(`Failed to remove barcode. Error: ${error.message}`, 'error')
      throw error
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/StockOutPage')
    }
  }

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{ pb: 6 }}
      className='flex flex-col w-full'
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <IconButton onClick={handleCancel} size='small' sx={{ border: '1px solid', borderColor: 'divider' }}>
          <ArrowBack fontSize='small' />
        </IconButton>
        <Box>
          <Typography variant='h4' component='h1' sx={{ lineHeight: 1.15 }}>
            {isEditMode ? 'Edit stock-out' : 'New stock-out'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Record an outbound inventory movement
          </Typography>
        </Box>
      </Box>

      <Box className='flex flex-col gap-4'>
        {/* Stock Out Details Section */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='overline' sx={{ color: 'text.secondary' }}>Details</Typography>

          <Box className='flex flex-col gap-4' sx={{ mt: 1 }}>
            {/* Party and Store */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth size='small' error={!!errors.partyId}>
                <Autocomplete
                  className='w-full'
                  options={parties} // This should use filteredParties, not parties
                  getOptionLabel={option =>
                    `${option.partyName}${
                      option.gstn ? ` (GSTN: ${option.gstn})` : ''
                    }`
                  }
                  value={
                    parties.find(party => party._id === formData.partyId) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    const selectedPartyId = newValue?._id || ''
                    const selectedPartyName = newValue?.partyName || ''

                    setFormData(prev => ({
                      ...prev,
                      partyId: selectedPartyId,
                      partyName: selectedPartyName
                    }))

                    clearErrors()
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Party *'
                      size='small'
                      error={!!errors.partyId}
                      helperText={errors.partyId as string}
                      required
                      className='w-full'
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant='body2'>
                          {option.partyName}
                        </Typography>
                        {option.gstn && (
                          <Typography variant='caption' color='textSecondary'>
                            GSTN: {option.gstn}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(
                      option =>
                        option.partyName
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()) ||
                        (option.gstn &&
                          option.gstn
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()))
                    )
                  }}
                />
                {errors.partyId && (
                  <FormHelperText>
                    {(errors.partyId as any).message || errors.partyId}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                size='small'
                disabled={!formData.partyId && stores.length > 0}
              >
                <Autocomplete
                  className='w-full'
                  options={filteredStores}
                  loading={isLoading}
                  disableClearable={false}
                  getOptionLabel={option => {
                    const cityName =
                      option.cityId && typeof option.cityId === 'object'
                        ? (option.cityId as any)?.cityName
                        : ''
                    const stateName =
                      option.stateId && typeof option.stateId === 'object'
                        ? (option.stateId as any)?.stateName
                        : option.storeState || ''

                    return `${option.storeName}${
                      cityName ? `, ${cityName}` : ''
                    }${option.storePinCode ? ` - ${option.storePinCode}` : ''}${
                      stateName ? `, ${stateName}` : ''
                    }`
                  }}
                  value={
                    filteredStores.find(
                      store => store._id === formData.storeId
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      storeId: newValue?._id || '', // Use _id instead of storeId
                      storeName: newValue?.storeName || ''
                    }))
                    clearErrors()
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Store (Optional)'
                      size='small'
                      className='w-full'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading ? (
                              <CircularProgress color='inherit' size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  noOptionsText={
                    formData.partyId
                      ? 'No stores available for this party'
                      : 'Select a party first'
                  }
                />
              </FormControl>
            </Box>

            {formData.storeId && selectedStore && (
              <Box
                sx={{
                  mt: 1, p: 2, borderRadius: 2,
                  bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
                }}
              >
                <Typography variant='overline' sx={{ color: 'text.secondary' }}>Store details</Typography>
                <Box
                  sx={{
                    mt: 1, display: 'grid', gap: 1.5,
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                  }}
                >
                  {([
                    ['Store ID', selectedStore.storeId],
                    ['Store Name', selectedStore.storeName],
                    ['Address', selectedStore.storeAddress],
                    ['City', selectedStore.cityId && typeof selectedStore.cityId === 'object' ? (selectedStore.cityId as any)?.cityName : ''],
                    ['State', selectedStore.stateId && typeof selectedStore.stateId === 'object' ? (selectedStore.stateId as any)?.stateName : selectedStore.storeState],
                    ['Pin Code', selectedStore.storePinCode],
                    ['Manager', selectedStore.smName],
                    ['Contact', selectedStore.smContactNo],
                  ] as [string, any][]).map(([label, value]) => (
                    <Box key={label} sx={{ minWidth: 0 }}>
                      <Typography variant='overline' sx={{ color: 'text.disabled', display: 'block', lineHeight: 1.4 }}>{label}</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{value || '—'}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {/* Warehouse and Logistics Provider */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth size='small' error={!!errors.warehouseId}>
                <Autocomplete
                  className='w-full'
                  options={warehouses}
                  getOptionLabel={option => option.warehouseName}
                  value={
                    warehouses.find(w => w._id === formData.warehouseId) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      warehouseId: newValue?._id || '',
                      warehouseName: newValue?.warehouseName || ''
                    }))
                    clearErrors()
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Warehouse *'
                      size='small'
                      error={!!errors.warehouseId}
                      // helperText={String(errors.warehouseId)}
                      required
                    />
                  )}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(opt =>
                      opt.warehouseName
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  }
                />
              </FormControl>

              <FormControl
                fullWidth
                size='small'
                error={!!errors.logisticsProviderCategoryId}
              >
                <Autocomplete
                  className='w-full'
                  options={[
                    ...logisticsProviderCategories,
                    { _id: 'other', logisticsProviderCategoryName: 'Other' }
                  ]}
                  getOptionLabel={option =>
                    option.logisticsProviderCategoryName
                  }
                  value={
                    logisticsProviderCategories.find(
                      c => c._id === formData.logisticsProviderCategoryId
                    ) ||
                    (formData.logisticsProviderCategoryId === null
                      ? { _id: 'other', logisticsProviderCategoryName: 'Other' }
                      : null)
                  }
                  onChange={(event, newValue) => {
                    if (newValue?._id === 'other') {
                      setFormData(prev => ({
                        ...prev,
                        logisticsProviderCategoryId: null,
                        // Keep existing name if switching to Other
                        logisticsProviderCategoryName:
                          prev.logisticsProviderCategoryName || ''
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        logisticsProviderCategoryId: newValue?._id || '',
                        logisticsProviderCategoryName:
                          newValue?.logisticsProviderCategoryName || ''
                      }))
                    }
                    clearErrors()
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Logistics Provider *'
                      size='small'
                      required
                      error={!!errors.logisticsProviderCategoryId}
                    />
                  )}
                />
              </FormControl>

              {/* Show custom name field when "Other" is selected OR when editing an existing "Other" record */}
              {(formData.logisticsProviderCategoryId === null ||
                (!formData.logisticsProviderCategoryId &&
                  formData.logisticsProviderCategoryName)) && (
                <TextField
                  fullWidth
                  label='Custom Logistics Provider Name *'
                  name='logisticsProviderCategoryName'
                  value={formData.logisticsProviderCategoryName || ''}
                  onChange={handleInputChange}
                  size='small'
                  required
                  error={!!errors.logisticsProviderCategoryName}
                />
              )}
            </Box>

            {/* Tracking Number and Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label='Tracking Number (Optional)'
                name='trackingNo'
                value={formData.trackingNo}
                onChange={handleInputChange}
                size='small'
                // required
                // error={!!errors.trackingNo}
                // helperText={String(errors.trackingNo)}
              />
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                <DatePicker
                  label='Document Date *'
                  value={toDate(formData.date)}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            {/* Stock Out Date + Category (paired for symmetry) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <DatePicker
                  label='Stock Out Date *'
                  value={toDate(formData.stockOutDate)}
                  onChange={handleStockOutDateChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      required: true,
                      error: !!errors.stockOutDate
                    }
                  }}
                  className='w-full'
                />
              </LocalizationProvider>

              <FormControl className='w-full' size='small'>
                <Autocomplete
                  className='w-full'
                  options={stockOutCategories}
                  getOptionLabel={option => option.stockOutCategoryName}
                  value={
                    stockOutCategories.find(
                      c => c._id === formData.stockOutCategoryId
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      stockOutCategoryId: newValue?._id || ''
                    }))
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Stock Out Category'
                      size='small'
                    />
                  )}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(opt =>
                      opt.stockOutCategoryName
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  }
                />
              </FormControl>
            </Box>

            {/* Invoice Number and Notes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label='Invoice Number (Optional)'
                name='invoiceNo'
                value={formData.invoiceNo}
                onChange={handleInputChange}
                size='small'
                error={!!errors.invoiceNo}
                className='w-full'
              />

              <TextField
                fullWidth
                label='Notes (Optional)'
                name='notes'
                value={formData.notes}
                onChange={handleInputChange}
                size='small'
                multiline
                rows={2}
                className='w-full'
              />
            </Box>
          </Box>
        </Paper>

        {/* Items Section — card-based rows (no horizontal scroll) */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant='h6'>Items</Typography>
              <Typography variant='caption' color='text.secondary'>
                {formData.items.length} item{formData.items.length === 1 ? '' : 's'} in this stock-out
              </Typography>
            </Box>
            <Button variant='contained' startIcon={<Add />} onClick={addItemRow}>
              Add item
            </Button>
          </Box>

          {formData.items.length === 0 ? (
            <Box
              sx={{
                border: '1px dashed', borderColor: 'divider', borderRadius: 2,
                py: 5, textAlign: 'center', color: 'text.secondary',
              }}
            >
              <Typography variant='body2'>No items added yet.</Typography>
              <Button size='small' startIcon={<Add />} onClick={addItemRow} sx={{ mt: 1 }}>
                Add the first item
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {formData.items.map((row, idx) => {
                const itemErr = (errors.items as any)?.[idx] || {};
                const stockTone = (row.remainingStock || 0) > 0 ? 'success' : 'error';
                return (
                  <Box
                    key={`${row.itemId || 'new'}-${idx}`}
                    sx={{
                      border: '1px solid', borderColor: itemErr.itemId ? 'error.main' : 'divider',
                      borderRadius: 2, p: { xs: 1.5, md: 2 },
                      bgcolor: 'background.paper',
                    }}
                  >
                    {/* Row head: index + item selector + stock + remove */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box
                        sx={{
                          mt: 0.5, width: 24, height: 24, flexShrink: 0, borderRadius: '7px',
                          display: 'grid', placeItems: 'center', bgcolor: 'action.hover',
                          fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary',
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ItemSelector
                          items={items}
                          value={items.find(item => item._id === row.itemId) || null}
                          onChange={item => handleItemSelect(item, idx)}
                          error={!!itemErr.itemId}
                          helperText={itemErr.itemId}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Chip
                          label={`Stock: ${row.remainingStock || 0}`}
                          size='small'
                          color={stockTone as any}
                          variant='outlined'
                        />
                        <IconButton color='error' onClick={() => removeItemRow(idx)} size='small'>
                          <Delete fontSize='small' />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Detail grid — wraps fluidly, never scrolls sideways */}
                    <Box
                      sx={{
                        mt: 1.5, display: 'grid', gap: 1.5,
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
                        alignItems: 'start',
                      }}
                    >
                      <TextField
                        label='SKU' fullWidth size='small'
                        value={row.modelNoSKU || ''}
                        InputProps={{ readOnly: true }}
                      />
                      <TextField
                        label='Unit' fullWidth size='small'
                        value={row.unit || ''}
                        InputProps={{ readOnly: true }}
                      />
                      <FormControl fullWidth size='small' error={!!itemErr.deliveryStatusId} sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }}>
                        <Autocomplete
                          options={deliveryStatuses}
                          getOptionLabel={option => option.deliveryStatusName || ''}
                          value={deliveryStatuses.find(s => s._id === row.deliveryStatusId) || null}
                          onChange={(_, newValue) => handleItemFieldChange(idx, 'deliveryStatusId', newValue?._id || '')}
                          renderInput={params => (
                            <TextField {...params} label='Delivery *' size='small' error={!!itemErr.deliveryStatusId} />
                          )}
                          filterOptions={(options, { inputValue }) =>
                            options.filter(opt => opt.deliveryStatusName.toLowerCase().includes(inputValue.toLowerCase()))
                          }
                        />
                      </FormControl>
                      <FormControl fullWidth size='small' disabled={!row.requiresInstallation} error={!!itemErr.installationStatusId} sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }}>
                        <InputLabel>{row.requiresInstallation ? 'Installation' : 'Installation (N/A)'}</InputLabel>
                        <Select
                          label={row.requiresInstallation ? 'Installation' : 'Installation (N/A)'}
                          value={row.requiresInstallation ? row.installationStatusId : ''}
                          onChange={e => handleItemFieldChange(idx, 'installationStatusId', row.requiresInstallation ? e.target.value : '')}
                        >
                          {installationStatuses.map(status => (
                            <MenuItem key={`installation-${status._id}`} value={status._id}>
                              {status.installationStatusName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label='Quantity *' type='number' fullWidth size='small'
                        value={row.quantity || 0}
                        onChange={e => handleItemFieldChange(idx, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 0, step: 1 }}
                        error={!!itemErr.quantity}
                        helperText={itemErr.quantity}
                      />
                      <Box>
                        <Typography variant='overline' sx={{ color: 'text.disabled', display: 'block', mb: 0.25 }}>
                          Barcodes
                        </Typography>
                        {row.requiresSerialNumberManagement ? (
                          <Chip
                            label={`${row.barcodes?.length || 0} / ${row.quantity || 0}`}
                            size='small'
                            color={(row.barcodes?.length || 0) === (row.quantity || 0) ? 'success' : 'default'}
                            onClick={() => openBarcodeManager(idx)}
                            clickable
                            sx={{ width: '100%' }}
                          />
                        ) : (
                          <Chip
                            label={row.barcodes?.length ? `${row.barcodes.length} added` : 'Optional'}
                            size='small'
                            color={row.barcodes?.length ? 'info' : 'default'}
                            onClick={() => openBarcodeManager(idx)}
                            clickable
                            variant='outlined'
                            sx={{ width: '100%' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant='outlined' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? 'Processing...'
              : isEditMode
              ? 'Update Stock Out'
              : 'Create Stock Out'}
          </Button>
        </Box>
      </Box>

      {currentBarcodeItem && (
        <BarcodeManager
          open={currentBarcodeItemIndex !== null}
          onClose={closeBarcodeManager}
          itemName={currentBarcodeItem.itemName}
          requiredQuantity={Number(currentBarcodeItem.quantity)}
          barcodes={currentBarcodeItem.barcodes || []}
          onBarcodesChange={handleBarcodesChange}
          onBarcodeDelete={handleBarcodeDelete}
          isEdite={isEditMode}
          stockOutId={formData._id}
          itemId={currentBarcodeItem.itemId}
          barcodeIdMap={barcodeIdMaps[currentBarcodeItem.itemId] || {}}
          required={currentBarcodeItem.requiresSerialNumberManagement}
          mode={isEditMode ? 'edit' : 'add'}
          fetchAvailableBarcodes={fetchAvailableBarcodes}
          validateBarcode={validateBarcode}
          operationType='stock-out'
          allowFreeEntry={!currentBarcodeItem.requiresSerialNumberManagement}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* API Error Display */}
      {apiError && (
        <Snackbar
          open={!!apiError}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity='error' sx={{ width: '100%' }}>
            {apiError}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}
