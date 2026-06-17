import { Add, ArrowBack, Delete, QrCodeScanner } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  createFilterOptions,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
  type SelectChangeEvent
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createResource,
  deleteResource,
  getResources,
  itemStockRecordsAPI,
  stockItemsAPI,
  updateResource
} from '../../api/api'
import type {
  Item,
  ItemGroup,
  ItemStockRecord,
  StockItem
} from '../../api/types'

interface ItemFormData {
  _id?: string
  itemId: string
  itemName: string
  modelNoSKU: string
  requiresInstallation: string
  requiresSerialNumberManagement: boolean | string
  unit: string
  description: string
  itemGroupId?: string
  openingStock: number
  closingStock?: number
  remainingStock?: number
  inActive?: boolean
  barcodes: string[]
}

interface ItemFormProps {
  itemData?: Item | null
  onSuccess?: () => void
  isEditMode?: boolean // Add this prop to identify edit mode
}
export default function ItemForm ({
  itemData,
  onSuccess,
  isEditMode = false
}: ItemFormProps) {
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    itemId: '',
    itemName: '',
    modelNoSKU: '',
    requiresInstallation: 'no',
    requiresSerialNumberManagement: 'no',
    unit: '',
    description: '',
    itemGroupId: '',
    openingStock: 0,
    closingStock: 0,
    remainingStock: 0,
    inActive: false,
    barcodes: []
  })

  const [itemsGroups, setItemsGroups] = useState<ItemGroup[]>([])
  const [currentBarcode, setCurrentBarcode] = useState('')
  const [isFetchingBarcodes, setIsFetchingBarcodes] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    itemGroups: false,
    stockRecords: false,
    barcodes: false,
    itemData: false
  })
  const [errors, setErrors] = useState<
    Partial<ItemFormData & { barcodes?: string[] }>
  >({})
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })
  const navigate = useNavigate()

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      navigate('/ItemPage')
    }
  }

  // Fetch stock items (barcodes) for the current item
  const fetchStockItems = async (itemId: string): Promise<StockItem[]> => {
    if (!itemId) return []
    try {
      setLoadingStates(prev => ({ ...prev, barcodes: true }))
      const response = await stockItemsAPI.getAll({
        itemId,
        $select: ['serialNo', '_id'] // Include _id for deletion if needed
      })
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Error fetching stock items:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
      return []
    } finally {
      setLoadingStates(prev => ({ ...prev, barcodes: false }))
    }
  }

  const fetchStockRecords = async (
    itemId: string
  ): Promise<ItemStockRecord[]> => {
    if (!itemId) return []

    try {
      setLoadingStates(prev => ({ ...prev, stockRecords: true }))

      // Add debug logging
      // console.log("Fetching stock records for itemId:", itemId);

      const response = await itemStockRecordsAPI.getAll({
        itemId,
        $sort: { createdAt: -1 },
        $limit: 10 // Increased limit for testing
      })

      // console.log("API Response:", response); // Debug log

      if (!Array.isArray(response)) {
        console.error('Unexpected response format:', response)
        return []
      }

      return response
    } catch (error: any) {
      console.error('Error fetching stock records:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
      return []
    } finally {
      setLoadingStates(prev => ({ ...prev, stockRecords: false }))
    }
  }
  const loadItemsGroup = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, itemGroups: true }))
      const response = await getResources('/item-groups')
      setItemsGroups(Array.isArray(response) ? response : [])
    } catch (error: any) {
      console.error('Error loading item groups:', error)
      showSnackbar(`Error: ${error.message}`, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, itemGroups: false }))
    }
  }

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, itemData: true }))
        await loadItemsGroup()

        if (itemData?._id) {
          const [stockRecords, stockItems] = await Promise.all([
            fetchStockRecords(itemData._id),
            fetchStockItems(itemData._id)
          ])

          // Properly type the latestStock variable
          const latestStock: ItemStockRecord | null = stockRecords[0] || null
          const barcodes = stockItems.map((item: StockItem) => item.serialNo)

          setItemFormData({
            ...itemData,
            requiresInstallation: itemData.requiresInstallation ? 'yes' : 'no',
            requiresSerialNumberManagement:
              itemData.requiresSerialNumberManagement ? 'yes' : 'no',
            unit: itemData.unit,
            description: itemData.description,
            openingStock:
              latestStock?.openingStock ?? itemData.openingStock ?? 0,
            closingStock:
              latestStock?.closingStock ?? itemData.closingStock ?? 0,
            remainingStock:
              latestStock?.remainingStock ?? itemData.remainingStock ?? 0,
            barcodes: barcodes.length > 0 ? barcodes : itemData.barcodes ?? [],
            inActive: !itemData.isActive
          })
        } else if (!itemData) {
          // New item - reset form
          setItemFormData({
            itemId: '',
            itemName: '',
            modelNoSKU: '',
            requiresInstallation: 'no',
            requiresSerialNumberManagement: 'no',
            unit: '',
            description: '',
            itemGroupId: '',
            openingStock: 0,
            closingStock: 0,
            remainingStock: 0,
            barcodes: [],
            inActive: false
          })
        }
      } catch (error: any) {
        console.error('Error loading item data:', error)
        showSnackbar(`Error: ${error.message}`, 'error')
      } finally {
        setLoadingStates(prev => ({ ...prev, itemData: false }))
      }
    }

    loadAllData()
  }, [itemData])
  // Fixed stock calculation
  useEffect(() => {
    setItemFormData(prev => ({
      ...prev,
      remainingStock: Number(prev.openingStock)
    }))
  }, [itemFormData.openingStock])

  // Snackbar helpers
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Barcode management
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBarcode(e.target.value)
  }

  const addBarcode = () => {
    // if (!validateBarcode(currentBarcode)) {
    //   showSnackbar("must be exactly 16 digits (numbers only)", "error");
    //   return;
    // }

    if (itemFormData.barcodes?.includes(currentBarcode)) {
      showSnackbar('This barcode has already been added', 'error')
      return
    }

    setItemFormData(prev => ({
      ...prev,
      barcodes: [...(prev.barcodes || []), currentBarcode]
    }))
    setCurrentBarcode('')
  }

  const removeBarcode = (index: number) => {
    setItemFormData(prev => ({
      ...prev,
      barcodes: prev.barcodes?.filter((_, i) => i !== index) || []
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addBarcode()
    }
  }

  // Form handlers
  const formHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setItemFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name as keyof ItemFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const isLoading = useMemo(() => {
    return Object.values(loadingStates).some(state => state)
  }, [loadingStates])

  const handleSelectChange = (e: SelectChangeEvent<string | boolean>) => {
    const { name, value } = e.target
    setItemFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<ItemFormData & { barcodes?: string[] }> = {}

    // Basic field validations
    if (!itemFormData.itemName.trim())
      newErrors.itemName = 'Item name is required'
    if (!itemFormData.modelNoSKU.trim())
      newErrors.modelNoSKU = 'Model/SKU is required'
    if (!itemFormData.itemGroupId)
      newErrors.itemGroupId = 'Item group is required'

    // Serial number management validations
    if (!itemFormData.unit.trim()) {
      newErrors.unit = 'Unit is required'
    }
    if (!itemFormData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showSnackbar(
        'Please fix the validation errors before submitting',
        'error'
      )
      return
    }

    try {
      setLoadingStates(prev => ({ ...prev, itemData: true }))

      const payload = {
        itemId: itemFormData.itemId,
        itemName: itemFormData.itemName,
        modelNoSKU: itemFormData.modelNoSKU,
        requiresInstallation: itemFormData.requiresInstallation as 'yes' | 'no',
        requiresSerialNumberManagement:
          itemFormData.requiresSerialNumberManagement as 'yes' | 'no',
        unit: itemFormData.unit,
        description: itemFormData.description,
        itemGroupId: itemFormData.itemGroupId,
        // In edit mode, don't update stock values
        ...(isEditMode
          ? {}
          : {
              openingStock: Number(itemFormData.openingStock),
              closingStock: Number(itemFormData.closingStock),
              remainingStock: Number(itemFormData.remainingStock)
            }),
        barcodes: itemFormData.barcodes || [],
        isActive: !itemFormData.inActive
      }

      let itemId: string
      if (itemFormData._id) {
        // Update existing item
        await updateResource('/items', itemFormData._id, payload)
        itemId = itemFormData._id
        showSnackbar('Item updated successfully!', 'success')

        // Only create new stock record if not in edit mode
        if (!isEditMode) {
          await createResource('/item-stock-records', {
            itemId,
            openingStock: Number(itemFormData.openingStock),
            closingStock: Number(itemFormData.closingStock),
            remainingStock: Number(itemFormData.remainingStock)
          })
        }

        // Handle barcode updates if serial number management is enabled
        if (itemFormData.requiresSerialNumberManagement === 'yes') {
          // In edit mode, only add new barcodes, don't remove existing ones
          if (isEditMode) {
            const currentStockItems = await fetchStockItems(itemId)
            const currentBarcodes = currentStockItems.map(item => item.serialNo)

            // Find only barcodes to add (no removal in edit mode)
            const barcodesToAdd = itemFormData.barcodes?.filter(
              barcode => !currentBarcodes.includes(barcode)
            )

            // Add new barcodes only
            const addPromises = barcodesToAdd?.map(barcode =>
              createResource('/stock-items', {
                itemId,
                serialNo: barcode
              })
            )

            await Promise.all(addPromises || [])
          } else {
            // Original logic for new items
            const currentStockItems = await fetchStockItems(itemId)
            const currentBarcodes = currentStockItems.map(item => item.serialNo)

            const barcodesToAdd = itemFormData.barcodes?.filter(
              barcode => !currentBarcodes.includes(barcode)
            )
            const barcodesToRemove = currentBarcodes.filter(
              (barcode: string) => !itemFormData?.barcodes?.includes(barcode)
            )

            const addPromises = barcodesToAdd?.map(barcode =>
              createResource('/stock-items', {
                itemId,
                serialNo: barcode
              })
            )

            const removePromises = barcodesToRemove.map((barcode: string) => {
              const itemToDelete = currentStockItems.find(
                (item: StockItem) => item.serialNo === barcode
              )
              return itemToDelete?._id
                ? deleteResource('/stock-items', itemToDelete._id)
                : Promise.resolve()
            })

            await Promise.all([...addPromises, ...removePromises])
          }
        }
      } else {
        // Create new item (original logic)
        const newItem = await createResource('/items', payload)
        itemId = newItem._id
        showSnackbar('Item created successfully!', 'success')

        await createResource('/item-stock-records', {
          itemId,
          openingStock: Number(itemFormData.openingStock),
          closingStock: Number(itemFormData.closingStock),
          remainingStock: Number(itemFormData.remainingStock),
          transactions: [
            {
              date: new Date(),
              quantity: Number(itemFormData.openingStock),
              type: 'Opening',
              reference: `${itemId}`
            }
          ]
        })

        if (itemFormData.requiresSerialNumberManagement === 'yes') {
          await Promise.all(
            itemFormData.barcodes.map(barcode =>
              createResource('/stock-items', {
                itemId,
                serialNo: barcode,
                stockInId: null
              })
            )
          )
        }
      }

      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/ItemPage')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      showSnackbar(errorMessage, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, itemData: false }))
    }
  }

  if (isLoading && !itemFormData._id) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    )
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
            {itemData?.itemId ? 'Edit item' : 'New item'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {itemData?.itemId
              ? 'Update the item details below.'
              : 'Add a new inventory item.'}
          </Typography>
        </Box>
      </Box>

      <Box className='flex flex-col md:flex-row gap-4'>
        <Box className='w-full'>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant='overline' sx={{ color: 'text.secondary' }}>Item details</Typography>

            {/* Basic Item Information */}
            <Box className='flex flex-col md:flex-row md:justify-between w-full gap-8'>
              <TextField
                id='itemName'
                name='itemName'
                label='Item Name'
                variant='outlined'
                value={itemFormData.itemName}
                onChange={formHandler}
                size='small'
                className='w-full'
                error={!!errors.itemName}
                helperText={errors.itemName}
                required
                disabled={isLoading}
              />

              <TextField
                id='modelNoSKU'
                name='modelNoSKU'
                label='Model No/SKU'
                variant='outlined'
                value={itemFormData.modelNoSKU}
                onChange={formHandler}
                size='small'
                className='w-full'
                error={!!errors.modelNoSKU}
                helperText={errors.modelNoSKU}
                required
                disabled={isLoading}
              />
            </Box>

            {/* Configuration Options */}
            <Box className='flex flex-col md:flex-row md:justify-between w-full my-5 gap-8'>
              <FormControl fullWidth size='small' disabled={isLoading}>
                <InputLabel id='installation-label'>
                  Requires Installation
                </InputLabel>
                <Select
                  labelId='installation-label'
                  id='requiresInstallation'
                  name='requiresInstallation'
                  label='Requires Installation'
                  value={itemFormData.requiresInstallation}
                  onChange={handleSelectChange}
                >
                  <MenuItem value='yes'>Yes</MenuItem>
                  <MenuItem value='no'>No</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size='small' disabled={isLoading}>
                <InputLabel id='serial-label'>
                  Serial Number Management
                </InputLabel>
                <Select
                  labelId='serial-label'
                  id='requiresSerialNumberManagement'
                  name='requiresSerialNumberManagement'
                  label='Serial Number Management'
                  value={itemFormData.requiresSerialNumberManagement}
                  onChange={handleSelectChange}
                >
                  <MenuItem value='yes'>Yes</MenuItem>
                  <MenuItem value='no'>No</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!itemFormData.inActive}
                    onChange={e =>
                      setItemFormData(prev => ({
                        ...prev,
                        inActive: !e.target.checked
                      }))
                    }
                    disabled={isLoading}
                  />
                }
                label='Status'
              />
              <Chip
                label={itemFormData.inActive ? 'Inactive' : 'Active'}
                color={itemFormData.inActive ? 'error' : 'success'}
                variant='outlined'
                size='small'
              />
            </Box>
            <Box className='flex flex-col md:flex-row md:justify-between w-full my-5 gap-8'>
              {/* Item Group Selection */}
              <Autocomplete
                className='w-full'
                options={[...(itemsGroups ?? [])].sort((a, b) => a.itemGroupName.localeCompare(b.itemGroupName))}
                getOptionLabel={option => option.itemGroupName}
                filterOptions={createFilterOptions({
                  matchFrom: 'any',
                  stringify: (option: ItemGroup) => option.itemGroupName
                })}
                value={
                  itemsGroups.find(g => g._id === itemFormData.itemGroupId) ||
                  null
                }
                onChange={(_, newValue) =>
                  setItemFormData(prev => ({
                    ...prev,
                    itemGroupId: newValue ? newValue._id : ''
                  }))
                }
                renderInput={params => (
                  <TextField
                    className='w-full'
                    {...params}
                    label='Item Group *'
                    size='small'
                    error={!!errors.itemGroupId}
                    helperText={errors.itemGroupId}
                    required
                    disabled={isLoading}
                  />
                )}
              />

              <TextField
                id='unit'
                name='unit'
                label='Unit'
                variant='outlined'
                value={itemFormData.unit}
                onChange={formHandler}
                size='small'
                className='w-full'
                error={!!errors.unit}
                helperText={errors.unit}
                required
                disabled={isLoading}
              />
            </Box>
            <TextField
              id='description'
              name='description'
              label='Description'
              variant='outlined'
              value={itemFormData.description}
              onChange={formHandler}
              size='small'
              className='w-full'
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={2}
              required
              disabled={isLoading}
            />

            {/* Stock Management Section - Read-only in edit mode */}
            <Box sx={{ mt: 4 }}>
              <Typography variant='overline' sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Stock Management {isEditMode && '(Read-only)'}
              </Typography>

              <Box className='flex flex-col md:flex-row gap-4'>
                <TextField
                  fullWidth
                  label='Opening Stock'
                  name='openingStock'
                  value={itemFormData.openingStock || 0}
                  onChange={formHandler}
                  size='small'
                  type='number'
                  className='w-full'
                  sx={isEditMode ? { '& .MuiInputBase-root': { bgcolor: 'action.hover' } } : undefined}
                  InputProps={{
                    readOnly: isEditMode // Make read-only in edit mode
                  }}
                />
                <TextField
                  fullWidth
                  label='Closing'
                  name='closingStock'
                  value={itemFormData.closingStock || 0}
                  onChange={formHandler}
                  type='number'
                  size='small'
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
                  className='w-full'
                />
                <TextField
                  fullWidth
                  label='Remaining Stock'
                  name='remainingStock'
                  value={itemFormData.remainingStock || 0}
                  onChange={formHandler}
                  type='number'
                  size='small'
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
                  className='w-full'
                />
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box className='w-full'>
          <Collapse in={itemFormData.requiresSerialNumberManagement === 'yes'}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
              {/* Barcode Management Section - Read-only view in edit mode */}

              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2
                  }}
                >
                  <Typography variant='h6' gutterBottom>
                    Barcode Management {isEditMode && '(View Only)'}
                  </Typography>
                  <Chip
                    label={`${itemFormData.barcodes?.length} barcodes`}
                    color='info'
                    variant='outlined'
                  />
                </Box>

                {!isEditMode ? (
                  // Original barcode input for new items
                  <>
                    <Box className='flex flex-col md:flex-row gap-2 mb-6'>
                      <TextField
                        fullWidth
                        label='Enter barcode'
                        size='small'
                        value={currentBarcode}
                        onChange={handleBarcodeChange}
                        onKeyPress={handleKeyPress}
                        // inputProps={{
                        //   maxLength: 16,
                        //   inputMode: 'numeric',
                        //   pattern: '[0-9]*'
                        // }}
                        disabled={itemFormData.openingStock <= 0}
                        error={!!errors.barcodes}
                        helperText={errors.barcodes?.[0] || ' '}
                        sx={{ flex: 1 }}
                      />
                      <Box className='flex justify-between gap-2'>
                        <Button
                          variant='outlined'
                          onClick={addBarcode}
                          disabled={itemFormData.openingStock <= 0}
                          startIcon={<Add />}
                          color='success'
                          className='h-10 w-full'
                        >
                          Add
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<QrCodeScanner fontSize='small' />}
                          disabled={itemFormData.openingStock <= 0}
                          className='h-10 w-full'
                        >
                          Scan
                        </Button>
                      </Box>
                    </Box>

                    {isFetchingBarcodes && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          my: 2
                        }}
                      >
                        <CircularProgress size={24} />
                        <Typography variant='body2' sx={{ ml: 2 }}>
                          Loading barcodes...
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : null}

                {itemFormData.barcodes?.length > 0 ? (
                  <List
                    dense
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    {itemFormData.barcodes?.map((barcode, index) => (
                      <ListItem
                        key={index}
                        // Only show delete button in add mode, not edit mode
                        secondaryAction={
                          !isEditMode ? (
                            <IconButton
                              edge='end'
                              onClick={() => removeBarcode(index)}
                              color='error'
                            >
                              <Delete />
                            </IconButton>
                          ) : null
                        }
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <ListItemText
                          primary={`${index + 1}. ${barcode}`}
                          secondary={
                            itemData ? 'Existing barcode' : 'New barcode'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center',
                      backgroundColor: 'action.hover'
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      {itemData
                        ? 'No barcodes associated with this item'
                        : 'No barcodes added yet. ' +
                          (itemFormData.openingStock > 0
                            ? 'Start adding barcodes above.'
                            : '')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Collapse>

          {(loadingStates.stockRecords || loadingStates.barcodes) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
              <Typography variant='body2' sx={{ ml: 2 }}>
                {loadingStates.stockRecords && 'Loading stock records...'}
                {loadingStates.barcodes && 'Loading barcodes...'}
              </Typography>
            </Box>
          )}
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant='outlined' onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant='contained'
              type='submit'
              disabled={
                isLoading ||
                // Remove barcode validation in edit mode
                (!isEditMode &&
                itemFormData.requiresSerialNumberManagement === 'yes'
                  ? Number(itemFormData.barcodes.length) !==
                    Number(itemFormData.openingStock)
                  : false) ||
                // Keep basic validation for both modes
                !itemFormData.itemName ||
                !itemFormData.modelNoSKU ||
                !itemFormData.itemGroupId
              }
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading
                ? 'Processing...'
                : itemData?.itemId
                ? 'Update'
                : 'Save'}
            </Button>
          </Box>
        </Box>
      </Box>

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
    </Box>
  )
}
