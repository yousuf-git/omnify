// components/common/ImportExportButtons.tsx
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import { Download, Upload } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { CSVValidationResult } from '../../api/csvtype'
import { Store } from '../../api/types'
import { validateCSVFile } from '../services/csvValidationService'
import { importStores } from '../services/importService'

interface ImportExportButtonsProps {
  items: Store[]
  onImportComplete: () => void
  isLoading?: boolean
}

export const ImportExportStoreButton: React.FC<ImportExportButtonsProps> = ({
  items,
  onImportComplete,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<{
    loading: boolean
    result: CSVValidationResult | null
    showPreview: boolean
  }>({
    loading: false,
    result: null,
    showPreview: false
  })

  // const handleExport = () => {
  //   const csvContent = convertToCSV(items);
  //   downloadCSV(csvContent, 'stores_export.csv');
  // };

  //   const handleExport = () => {
  //   if (!items || items.length === 0) return;
  //   const csvContent = convertToCSV(items);
  //   const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'stores_export.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };
  const handleExport = () => {
    // console.log('Exporting items:', items)
    const csvContent = convertToCSV(items)
    downloadCSV(csvContent, 'stores_export.csv')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus(prev => ({ ...prev, loading: true, result: null }))

    try {
      const validationResult = await validateCSVFile(file)
      setImportStatus(prev => ({
        ...prev,
        result: validationResult,
        showPreview: !validationResult.isValid || validationResult.validRows > 0
      }))
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        result: {
          isValid: false,
          errors: ['Failed to read CSV file'],
          validatedData: [],
          totalRows: 0,
          validRows: 0
        },
        showPreview: true
      }))
    } finally {
      setImportStatus(prev => ({ ...prev, loading: false }))
    }

    // Reset file input
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!importStatus.result?.validatedData.length) return

    setImportStatus(prev => ({ ...prev, loading: true }))

    try {
      const importResult = await importStores(importStatus.result.validatedData)

      // If import had any failures, surface them in the preview modal
      if (!importResult.success) {
        const failureMessages = importResult.failures.map(
          f => `Row ${f.row}: ${f.error}`
        )
        setImportStatus(prev => ({
          ...prev,
          loading: false,
          result: {
            ...prev.result!,
            errors: [...(prev.result?.errors || []), ...failureMessages]
          }
        }))
        return
      }

      // Success: notify and close preview
      onImportComplete()
      setImportStatus({ loading: false, result: null, showPreview: false })
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        result: {
          ...prev.result!,
          errors: [...(prev.result?.errors || []), 'Failed to import stores']
        },
        loading: false
      }))
    }
  }

  // const convertToCSV = (stores: Store[]): string => {
  //   const headers = [
  //     'storeId',
  //     'storeName',
  //     'partyName',
  //     'cityName',
  //     'stateName',
  //     'storeAddress',
  //     'storePinCode',
  //     'smName',
  //     'smContactNo',
  //     'isActive'
  //   ];

  //   const rows = stores.map(store => [
  //     store.storeId?.toString() || '',
  //     store.storeName || '',
  //     typeof store.partyId === 'object' ? (store.partyId as any).partyName : '',
  //     typeof store.cityId === 'object' ? (store.cityId as any).cityName : '',
  //     typeof store.stateId === 'object' ? (store.stateId as any).stateName : '',
  //     store.storeAddress || '',
  //     store.storePinCode || '',
  //     store.smName || '',
  //     store.smContactNo || '',
  //     store.isActive ? 'true' : 'false'
  //   ]);

  //   return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  // };

  const convertToCSV = (stores: Store[]): string => {
    const headers = [
      'storeId',
      'storeName',
      'partyName',
      'cityName',
      'stateName',
      'storeAddress',
      'storePinCode',
      'smName',
      'smContactNo',
      'isActive'
    ]

    const rows = stores.map(store => [
      store.storeId?.toString() || '',
      store.storeName || '',
      store.partyId && typeof store.partyId === 'object'
        ? (store.partyId as any).partyName
        : '',
      store.cityId && typeof store.cityId === 'object'
        ? (store.cityId as any).cityName
        : '',
      store.stateId && typeof store.stateId === 'object'
        ? (store.stateId as any).stateName
        : '',
      store.storeAddress || '',
      store.storePinCode || '',
      store.smName || '',
      store.smContactNo || '',
      store.isActive ? 'true' : 'false'
    ])

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept='.csv'
        style={{ display: 'none' }}
      />

      <Button
        variant='outlined'
        startIcon={<Upload size={14} />}
        onClick={handleImportClick}
        disabled={isLoading || importStatus.loading}
        sx={{ fontSize: 12, py: 0.8 }}
      >
        <span className='hidden md:block'>Import CSV</span>
      </Button>

      <Button
        variant='outlined'
        startIcon={<Download size={14} />}
        onClick={handleExport}
        disabled={isLoading || items.length === 0}
        sx={{ fontSize: 12, py: 0.8 }}
      >
        <span className='hidden md:block'>Export CSV</span>
      </Button>

      {/* Import Preview Modal */}
      {importStatus.showPreview && importStatus.result && (
        <ImportPreviewModal
          result={importStatus.result}
          loading={importStatus.loading}
          onConfirm={handleConfirmImport}
          onCancel={() =>
            setImportStatus(prev => ({ ...prev, showPreview: false }))
          }
        />
      )}
    </Box>
  )
}

// Import Preview Modal Component
const ImportPreviewModal: React.FC<{
  result: CSVValidationResult
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ result, loading, onConfirm, onCancel }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 1,
          maxWidth: 600,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <Typography variant='h6' gutterBottom>
          CSV Import Preview
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          {result.totalRows} rows found • {result.validRows} valid rows •{' '}
          {result.totalRows - result.validRows} errors
        </Typography>

        {result.errors.length > 0 && (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              Validation Errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.errors.map((error, index) => (
                <li key={index}>
                  <Typography variant='body2'>{error}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {result.validRows > 0 && (
          <Alert severity='success' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              {result.validRows} stores ready to import
            </Typography>
          </Alert>
        )}

        <Box
          sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}
        >
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={onConfirm}
            disabled={loading || result.validRows === 0}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Importing...' : `Import ${result.validRows} Stores`}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
