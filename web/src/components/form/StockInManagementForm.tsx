import { Add, ArrowBack, Delete } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormHelperText,
  IconButton,
  Paper,
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

import { deleteResource, getResources, updateResource } from '../../api/api'
import type {
  ItemStockRecord,
  StockIn,
  StockInCategory,
  StockItem,
  Warehouse
} from '../../api/types'
import { useStockApi } from '../../hooks/useStockApi'
import { useStockFormValidation } from '../../hooks/useStockFormValidation'
import { toDate } from '../../utils/safeDate'
import { BarcodeManager } from '../shared/BarcodeManager'
import { ItemSelector } from '../shared/ItemSelector'

interface StockFormData {
  _id?: string
  stockInDate: string
  partyId: string
  partyName: string
  stockInCategoryId: string
  stockInCategoryName: string
  warehouseId: string
  warehouseName: string
  date: string
  invoiceNo?: string
  notes: string
}

interface StockItemFormData {
  itemId: string
  itemName: string
  modelNoSKU?: string
  unit?: string
  requiresInstallation?: boolean
  requiresSerialNumberManagement?: boolean
  newStock: number | string
  barcodes: string[]
  barcodeIdMap?: Record<string, string> // Map of barcode to its database ID
  previousNewStock?: number
  currentStock?: number
}

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

interface StockInFormProps {
  stockInData?: StockIn | null
  onSuccess?: () => void
  onCancel?: () => void
  isEditMode?: boolean
}

export function StockInForm ({
  stockInData,
  onSuccess,
  onCancel,
  isEditMode = false
}: StockInFormProps) {
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<StockFormData>({
    _id: stockInData?._id || '',
    stockInDate: stockInData?.stockInDate || '',
    partyId: '',
    partyName: '',
    warehouseId: '',
    warehouseName: '',
    stockInCategoryId: '',
    stockInCategoryName: '',
    date: new Date().toISOString(),
    invoiceNo: '',
    notes: ''
  })

  const [stockItems, setStockItems] = useState<StockItemFormData[]>([])
  const [currentBarcodeItemIndex, setCurrentBarcodeItemIndex] = useState<
    number | null
  >(null)
  const [itemStockRecords, setItemStockRecords] = useState<ItemStockRecord[]>(
    []
  )
  // Data state
  const [items, setItems] = useState<Item[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [stockInCategories, setStockInCategories] = useState<StockInCategory[]>(
    []
  )
  const [barCodes, setBarCodes] = useState<StockItem[]>([])
  const [barcodeIdMaps, setBarcodeIdMaps] = useState<
    Record<string, Record<string, string>>
  >({})
  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  })
  const [filteredParties, setFilteredParties] = useState<Party[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])

  // Update when data loads
  useEffect(() => {
    setFilteredParties(parties)
    setFilteredItems(items)
  }, [parties, items])

  // Custom hooks
  const { errors, validateStockInForm, clearErrors } = useStockFormValidation({
    requireInvoice: false, // Invoice is optional
    requireBarcodes: false // Barcodes are optional
  })

  const {
    isLoading,
    error: apiError,
    createStockIn,
    updateStockIn
    // checkDuplicateInvoice
  } = useStockApi()

  // Fetch initial data and populate form
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          itemsRes,
          partiesRes,
          warehousesRes,
          stockInCategoriesRes,
          stockItemRes,
          itemStockRecordRes
        ] = await Promise.all([
          getResources('/items'),
          getResources('/parties'),
          getResources('/warehouses'),
          getResources('/stock-in-categories'),
          getResources('/stock-items'),
          getResources('/item-stock-records')
        ])

        const itemsWithStock = await fetchItemStockLevels(
          Array.isArray(itemsRes) ? itemsRes : []
        )

        setItems(itemsWithStock)
        setParties(Array.isArray(partiesRes) ? partiesRes : [])
        setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : [])
        setStockInCategories(
          Array.isArray(stockInCategoriesRes) ? stockInCategoriesRes : []
        )
        setBarCodes(Array.isArray(stockItemRes) ? stockItemRes : [])
        setItemStockRecords(
          Array.isArray(itemStockRecordRes) ? itemStockRecordRes : []
        )

        // Populate form data for edit mode
        if (stockInData && isEditMode) {
          await populateFormForEdit(
            stockInData,
            partiesRes,
            warehousesRes,
            stockInCategoriesRes,
            itemsWithStock,
            stockItemRes,
            itemStockRecordRes
          )
        }
      } catch (err: any) {
        console.error('Error loading data:', err)
        showSnackbar(`Error: ${err.message}`, 'error')
      }
    }

    loadData()
  }, [stockInData, isEditMode])

  const fetchItemStockLevels = async (items: Item[]): Promise<Item[]> => {
    try {
      const stockRecords = (await getResources(
        '/item-stock-records'
      )) as ItemStockRecord[]

      return items.map(item => {
        const itemStockRecords = stockRecords.filter(
          record => record.itemId === item._id
        )
        const currentStock = itemStockRecords.reduce(
          (total, record) => total + record.remainingStock,
          0
        )
        return { ...item, currentStock }
      })
    } catch (error) {
      console.error('Error fetching stock levels:', error)
      return items
    }
  }

  const handleBarcodeDelete = async (barcode: string, stockItemId: string) => {
    try {
      // Use your existing deleteResource function
      await deleteResource('/stock-items', stockItemId)
      showSnackbar('Barcode deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting barcode:', error)
      showSnackbar('Failed to delete barcode', 'error')
      throw error
    }
  }

  const populateFormForEdit = async (
    stockInData: StockIn,
    partiesRes: Party[],
    warehousesRes: Warehouse[],
    stockInCategoriesRes: StockInCategory[],
    itemsWithStock: Item[],
    stockItemRes: StockItem[],
    itemStockRecordRes: ItemStockRecord[]
  ) => {
    if (!stockInData) return
    // Party, Warehouse, Category select karna same rahega...
    const selectedParty = partiesRes.find(
      party => party._id === stockInData.partyId
    )
    const selectedWarehouse = warehousesRes.find(
      wh => wh._id === stockInData.warehouseId
    )
    const selectedStockInCategory = stockInCategoriesRes.find(
      category => category._id === stockInData.stockInCategoryId
    )

    setFormData({
      _id: stockInData._id,
      stockInDate: stockInData.stockInDate || '',
      partyId: stockInData.partyId || '',
      partyName: selectedParty?.partyName || '',
      warehouseId: stockInData.warehouseId || '',
      warehouseName: selectedWarehouse?.warehouseName || '',
      stockInCategoryId: stockInData.stockInCategoryId || '',
      stockInCategoryName: selectedStockInCategory?.stockInCategoryName || '',
      invoiceNo: stockInData.invoiceNo,
      date: stockInData.date || new Date().toISOString(),
      notes: stockInData.notes || ''
    })
    //  // ✅ Yahan itemStockRecord ko populate karte waqt remaing stock nikal lo jo item Selet ki ha us ka
    const itemStockMap: Record<string, number> = itemStockRecordRes.reduce(
      (acc, record) => {
        acc[record.itemId] = (acc[record.itemId] || 0) + record.remainingStock
        return acc
      },
      {} as Record<string, number>
    )
    const barcodeIdMaps: Record<string, Record<string, string>> = {}
    stockItemRes.forEach(stockItem => {
      if (
        stockItem.serialNo &&
        stockItem.stockInId === stockInData._id &&
        stockItem.itemId
      ) {
        if (!barcodeIdMaps[stockItem.itemId]) {
          barcodeIdMaps[stockItem.itemId] = {}
        }
        barcodeIdMaps[stockItem.itemId][stockItem.serialNo] = stockItem._id!
      }
    })

    setBarcodeIdMaps(barcodeIdMaps)

    // ✅ Yahan stockItems build karte waqt barcodes bhi set karna
    if (stockInData.itemId && stockInData.stockAdded) {
      const itemIds = Array.isArray(stockInData.itemId)
        ? stockInData.itemId
        : [stockInData.itemId]
      const stockAddedValues = Array.isArray(stockInData.stockAdded)
        ? stockInData.stockAdded
        : [stockInData.stockAdded]

      const stockItemsData = itemIds.map((itemId: string, index: number) => {
        const item = itemsWithStock.find(i => i._id === itemId)

        // Us item ke saare barcodes nikal lo
        const itemBarcodes = stockItemRes
          .filter(s => s.itemId === itemId && s.stockInId === stockInData._id)
          .map(s => s.serialNo)

        return {
          itemId,
          itemName: item?.itemName || 'Unknown Item',
          modelNoSKU: item?.modelNoSKU || '',
          requiresSerialNumberManagement:
            item?.requiresSerialNumberManagement || false,
          requiresInstallation: item?.requiresInstallation || false,
          unit: item?.unit || '',
          newStock: stockAddedValues[index] || 0,
          previousNewStock: stockAddedValues[index] || 0,
          barcodes: itemBarcodes || [], // ✅ yahan inject
          barcodeIdMap: barcodeIdMaps[itemId] || {}, // Map of barcode to its DB ID
          remainingStock: itemStockMap[itemId] || 0, // Remaining stock for this item
          currentStock: item?.currentStock || 0
        }
      })

      setStockItems(stockItemsData)
    }
  }

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning'
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

  const isValidDate = (d: any): d is Date =>
    d instanceof Date && !isNaN(d.getTime())

  const handleStockInDateChange = (date: Date | null) => {
    // Only update formData when a valid Date is provided.
    // This allows the user to type partial dates without causing errors.
    if (isValidDate(date)) {
      const isoDate = date.toISOString()
      setFormData(prev => ({
        ...prev,
        stockInDate: isoDate
      }))
    } else if (date === null) {
      // cleared by user
      setFormData(prev => ({
        ...prev,
        stockInDate: ''
      }))
    } else {
      // invalid/partial input while typing - do not update formData
      // let the DatePicker's internal input handle the intermediate value
    }
    clearErrors()
  }

  const handleDateChange = (date: Date | null) => {
    // Only update formData when a valid Date is provided.
    // This allows the user to type partial dates without causing errors.
    if (isValidDate(date)) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString()
      }))
    } else if (date === null) {
      // cleared by user
      setFormData(prev => ({
        ...prev,
        date: ''
      }))
    } else {
      // invalid/partial input while typing - do not update formData
    }
    clearErrors()
  }

  const handleItemSelect = (item: Item | null, index: number) => {
    if (!item) return

    setStockItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        itemId: item._id,
        itemName: item.itemName,
        modelNoSKU: item.modelNoSKU,
        unit: item.unit,
        currentStock: item.currentStock || 0,
        requiresSerialNumberManagement:
          item.requiresSerialNumberManagement || false,
        requiresInstallation: item.requiresInstallation || false
      }
      return updated
    })
  }

  const handleItemFieldChange = (
    index: number,
    field: keyof StockItemFormData,
    value: any
  ) => {
    setStockItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addItemRow = () => {
    setStockItems(prev => [
      ...prev,
      {
        stockInDate: '',
        itemId: '',
        itemName: '',
        modelNoSKU: '',
        unit: '',
        currentStock: 0,
        newStock: 0,
        barcodes: [],
        requiresSerialNumberManagement: false,
        requiresInstallation: false
      }
    ])
  }

  const removeItem = async (index: number) => {
    if (stockItems.length <= 1) {
      showSnackbar('Cannot remove the last item from stock', 'warning')
      return
    }
    const item = stockItems[index]
    if (!item || !stockInData?._id) {
      setStockItems(prev => prev.filter((_, i) => i !== index))
      return
    }

    try {
      await updateResource('/stock-ins', stockInData._id, {
        itemId: item.itemId,
        serialNo: item.requiresSerialNumberManagement ? item.barcodes : [],
        stockAdded: Number(item.newStock),
        action: 'remove'
      })

      // ✅ UI update
      setStockItems(prev => prev.filter((_, i) => i !== index))
      showSnackbar('Item removed successfully!', 'success')
    } catch (err) {
      console.error('Error removing item:', err)
      showSnackbar('Failed to remove item', 'error')
    }
  }

  const openBarcodeManager = (index: number) => {
    setCurrentBarcodeItemIndex(index)
  }

  const closeBarcodeManager = () => {
    setCurrentBarcodeItemIndex(null)
  }

  const handleBarcodesChange = (barcodes: string[]) => {
    if (currentBarcodeItemIndex !== null) {
      setStockItems(prev => {
        const updated = [...prev]
        updated[currentBarcodeItemIndex] = {
          ...updated[currentBarcodeItemIndex],
          barcodes
        }
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!validateStockInForm(formData, stockItems)) {
        showSnackbar('Please fix all errors before submitting', 'error')
        return
      }

      const payload = {
        stockInDate: formData.stockInDate,
        partyId: formData.partyId,
        stockInCategoryId: formData.stockInCategoryId,
        warehouseId: formData.warehouseId,
        itemId: stockItems.map(item => item.itemId),
        stockAdded: stockItems.map(item => Number(item.newStock)),
        serialNo: stockItems.map(item =>
          item.requiresSerialNumberManagement ? item.barcodes : []
        ),
        ...(formData.invoiceNo?.trim() && {
          invoiceNo: formData.invoiceNo.trim()
        }),
        notes: formData.notes.trim(),
        date: formData.date
      }

      let stockInResult

      if (formData._id) {
        // ✅ Update existing record
        //  console.log("Updating stock-in...", formData._id);
        stockInResult = await updateStockIn(formData._id, payload)
        showSnackbar('Stock In record updated successfully!', 'success')
      } else {
        // ✅ Create new record
        //  console.log("Creating new stock-in...");
        stockInResult = await createStockIn(payload)
        showSnackbar('Stock In record created successfully!', 'success')
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        resetForm()
        navigate('/StockInPage')
      }, 2000)
      // console.log("StockIn Result:", stockInResult);
    } catch (error) {
      console.error('Detailed submission error:', error)
      showSnackbar('Failed to save stock record. Please try again.', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      stockInDate: new Date().toISOString(),
      partyId: '',
      partyName: '',
      warehouseId: '',
      warehouseName: '',
      stockInCategoryId: '',
      stockInCategoryName: '',
      date: new Date().toISOString(),
      // invoiceNo: "",
      notes: ''
    })
    setStockItems([])
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/StockInPage')
    }
  }

  const currentBarcodeItem =
    currentBarcodeItemIndex !== null
      ? stockItems[currentBarcodeItemIndex]
      : null

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
            {isEditMode ? 'Edit stock-in' : 'New stock-in'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Record an inbound inventory receipt
          </Typography>
        </Box>
      </Box>

      <Box className='flex flex-col gap-4'>
        {/* Stock Details Section */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='overline' sx={{ color: 'text.secondary' }}>Details</Typography>

          <Box className='flex flex-col gap-4' sx={{ mt: 1 }}>
            {/* Party and Category */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* <FormControl fullWidth size="small" error={!!errors.partyId}> */}
              <Autocomplete
                className='w-full'
                options={parties}
                getOptionLabel={option =>
                  `${option.partyName}${
                    option.gstn ? ` (GSTN: ${option.gstn})` : ''
                  }`
                }
                value={
                  parties.find(party => party._id === formData.partyId) || null
                }
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    partyId: newValue?._id || '',
                    partyName: newValue?.partyName || ''
                  }))
                  clearErrors()
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Party *'
                    size='small'
                    error={!!errors.partyId}
                    // helperText={errors.partyId}
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

              <Autocomplete
                className='w-full'
                options={stockInCategories}
                getOptionLabel={option => option.stockInCategoryName}
                value={
                  stockInCategories.find(
                    cat => cat._id === formData.stockInCategoryId
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    stockInCategoryId: newValue?._id || '',
                    stockInCategoryName: newValue?.stockInCategoryName || ''
                  }))
                  clearErrors()
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Stock In Category *'
                    size='small'
                    error={!!errors.stockInCategoryId}
                    // helperText={String(errors.stockInCategoryId)}
                    required
                  />
                )}
                filterOptions={(options, { inputValue }) =>
                  options.filter(option =>
                    option.stockInCategoryName
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  )
                }
              />
            </Box>

            {/* Warehouse and Invoice */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Autocomplete
                className='w-full'
                options={warehouses}
                getOptionLabel={option => option.warehouseName}
                value={
                  warehouses.find(wh => wh._id === formData.warehouseId) || null
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
                  options.filter(option =>
                    option.warehouseName
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  )
                }
              />

              <TextField
                fullWidth
                label='Invoice Number (Optional)'
                name='invoiceNo'
                value={formData.invoiceNo}
                onChange={handleInputChange}
                size='small'
                error={!!errors.invoiceNo}
                // helperText={String(errors.invoiceNo)}
              />
            </Box>

            {/* Dates — paired for symmetry */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <DatePicker
                  label='Stock In Date *'
                  value={toDate(formData.stockInDate)}
                  onChange={handleStockInDateChange}
                  slotProps={{ textField: { size: 'small', fullWidth: true, required: true, error: !!errors.stockInDate } }}
                  className='w-full'
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <DatePicker
                  label='Document Date *'
                  value={toDate(formData.date)}
                  onChange={handleDateChange}
                  slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                  className='w-full'
                />
              </LocalizationProvider>
            </Box>

            <TextField
              fullWidth
              label='Notes (Optional)'
              name='notes'
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={2}
              size='small'
            />
          </Box>
        </Paper>

        {/* Items Section — card-based rows (no horizontal scroll) */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant='h6'>Items</Typography>
              <Typography variant='caption' color='text.secondary'>
                {stockItems.length} item{stockItems.length === 1 ? '' : 's'} received
              </Typography>
            </Box>
            <Button variant='contained' startIcon={<Add />} onClick={addItemRow}>
              Add item
            </Button>
          </Box>

          {stockItems.length === 0 ? (
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, py: 5, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant='body2'>No items added yet.</Typography>
              <Button size='small' startIcon={<Add />} onClick={addItemRow} sx={{ mt: 1 }}>
                Add the first item
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stockItems.map((row, idx) => {
                const itemErr = (errors.items as any)?.[idx] || {};
                const currentStock = row.currentStock || 0;
                const newStock = Number(row.newStock) || 0;
                const totalAfter = isEditMode
                  ? currentStock - (row.previousNewStock || 0) + newStock
                  : currentStock + newStock;
                return (
                  <Box
                    key={`${row.itemId || 'new'}-${idx}`}
                    sx={{
                      border: '1px solid', borderColor: itemErr.itemId ? 'error.main' : 'divider',
                      borderRadius: 2, p: { xs: 1.5, md: 2 }, bgcolor: 'background.paper',
                    }}
                  >
                    {/* head: index + selector + total-after + remove */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ mt: 0.5, width: 24, height: 24, flexShrink: 0, borderRadius: '7px', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
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
                        <Chip label={`After: ${totalAfter}`} size='small' color={totalAfter > 0 ? 'success' : 'default'} variant='outlined' />
                        <IconButton color='error' onClick={() => removeItem(idx)} size='small'>
                          <Delete fontSize='small' />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* detail grid — wraps, never scrolls sideways */}
                    <Box sx={{ mt: 1.5, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, alignItems: 'start' }}>
                      <TextField label='SKU' fullWidth size='small' value={row.modelNoSKU || ''} InputProps={{ readOnly: true }} />
                      <TextField label='Unit' fullWidth size='small' value={row.unit || ''} InputProps={{ readOnly: true }} />
                      <TextField label='Current stock' fullWidth size='small' value={currentStock} InputProps={{ readOnly: true }} />
                      <TextField
                        label='New stock *' type='number' fullWidth size='small'
                        value={row.newStock}
                        onChange={e => handleItemFieldChange(idx, 'newStock', e.target.value)}
                        error={!!itemErr.newStock}
                        helperText={itemErr.newStock}
                      />
                      <Box>
                        <Typography variant='overline' sx={{ color: 'text.disabled', display: 'block', mb: 0.25 }}>Barcodes</Typography>
                        {row.requiresSerialNumberManagement ? (
                          <Chip
                            label={`${row.barcodes?.length || 0} / ${row.newStock || 0}`}
                            size='small'
                            color={row.barcodes?.length === Number(row.newStock) ? 'success' : 'default'}
                            onClick={() => openBarcodeManager(idx)}
                            clickable
                            sx={{ width: '100%' }}
                          />
                        ) : (
                          <Chip label='N/A' size='small' variant='outlined' sx={{ width: '100%' }} />
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
              ? 'Update Stock In'
              : 'Create Stock In'}
          </Button>
        </Box>
      </Box>

      {/* Barcode Manager Dialog */}
      {currentBarcodeItem && (
        <BarcodeManager
          open={currentBarcodeItemIndex !== null}
          onClose={closeBarcodeManager}
          itemName={currentBarcodeItem.itemName}
          requiredQuantity={Number(currentBarcodeItem.newStock)}
          barcodes={currentBarcodeItem.barcodes}
          onBarcodesChange={handleBarcodesChange}
          onBarcodeDelete={handleBarcodeDelete}
          isEdite={isEditMode}
          stockInId={stockInData?._id}
          itemId={currentBarcodeItem.itemId}
          barcodeIdMap={barcodeIdMaps[currentBarcodeItem.itemId] || {}}
          required={false}
          mode='add'
          operationType='stock-in'
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
