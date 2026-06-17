import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { enGB } from 'date-fns/locale/en-GB'
import { ReceiptText, Copy, Check, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteResource, getResource, getResources } from '../api/api'
import type {
  FilterItemStockRecord,
  Item,
  ItemStockRecord,
  TableColumn
} from '../api/types'
import { ConfirmationDialog } from '../components/common/DeleteConfirmDialog'
import { EditItemDialog } from '../components/common/EditItemDialog'
import { DynamicTable } from '../components/common/table'
import { toDate as safeToDate } from '../utils/safeDate'

interface TransactionHistoryDialogProps {
  item: ItemStockRecord
  items: Item[]
}
export interface Transaction {
  _id?: string
  date: Date | string
  quantity: number
  type: 'Stock-In' | 'Stock-Out' | 'Opening'
  reference: string
}

// day-only key for inclusive date comparisons (ignores time/timezone)
const dayValue = (d: Date | string) => {
  const x = new Date(d)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
}

function TxnCopyButton ({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  return (
    <Tooltip title={done ? 'Copied' : 'Copy'}>
      <IconButton
        size='small'
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setDone(true)
            setTimeout(() => setDone(false), 1200)
          } catch {
            /* clipboard unavailable */
          }
        }}
        sx={{ p: 0.25, color: done ? 'success.main' : 'text.disabled', '&:hover': { color: 'primary.main' } }}
      >
        {done ? <Check size={13} /> : <Copy size={13} />}
      </IconButton>
    </Tooltip>
  )
}

const TransactionHistoryDialog = ({
  item,
  items
}: TransactionHistoryDialogProps) => {
  const [open, setOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // invoiceNo -> { _id, num } for resolving a transaction's source in/out record
  const [stockInByRef, setStockInByRef] = useState<Record<string, { _id: string; num: any }>>({})
  const [stockOutByRef, setStockOutByRef] = useState<Record<string, { _id: string; num: any }>>({})
  const [currentStock, setCurrentStock] = useState<number>(item.remainingStock)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const navigate = useNavigate()

  const handleOpen = async () => {
    setOpen(true)
    setLoading(true)
    setError(null)

    // Default range: first day of the current month → today.
    const now = new Date()
    setFromDate(new Date(now.getFullYear(), now.getMonth(), 1))
    setToDate(now)

    try {
      const [record, stockIns, stockOuts] = await Promise.all([
        getResource('/item-stock-records', item._id as string),
        getResources('/stock-ins').catch(() => []),
        getResources('/stock-outs').catch(() => [])
      ])

      const txns: Transaction[] = Array.isArray(record?.transactions) ? record.transactions : []
      txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setTransactions(txns)
      setCurrentStock(record?.remainingStock ?? item.remainingStock)

      // Build invoiceNo -> record maps so each txn can link to its in/out entry.
      const inMap: Record<string, { _id: string; num: any }> = {}
      ;(Array.isArray(stockIns) ? stockIns : []).forEach((s: any) => {
        if (s.invoiceNo) inMap[String(s.invoiceNo)] = { _id: s._id, num: s.stockInId }
      })
      const outMap: Record<string, { _id: string; num: any }> = {}
      ;(Array.isArray(stockOuts) ? stockOuts : []).forEach((s: any) => {
        if (s.invoiceNo) outMap[String(s.invoiceNo)] = { _id: s._id, num: s.stockOutId }
      })
      setStockInByRef(inMap)
      setStockOutByRef(outMap)
    } catch (err) {
      console.error('Failed to fetch transaction history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  // From must be on/before To.
  const dateError = !!(fromDate && toDate && dayValue(fromDate) > dayValue(toDate))

  const filteredTransactions = useMemo(() => {
    if (!fromDate || !toDate || dateError) return []
    const from = dayValue(fromDate)
    const to = dayValue(toDate)
    return transactions.filter(txn => {
      const d = dayValue(txn.date)
      return d >= from && d <= to
    })
  }, [transactions, fromDate, toDate, dateError])

  const calculateSummary = useMemo(() => {
    const empty = { openingBalance: 0, totalStockIn: 0, totalStockOut: 0, closingBalance: 0 }
    if (!fromDate || !toDate || dateError) return empty
    const from = dayValue(fromDate)
    const signed = (t: Transaction) => (t.type === 'Stock-Out' ? -t.quantity : t.quantity)

    // Opening balance = signed sum of everything strictly before the FROM date.
    let openingBalance = 0
    transactions.forEach(t => {
      if (dayValue(t.date) < from) openingBalance += signed(t)
    })

    let totalStockIn = 0
    let totalStockOut = 0
    filteredTransactions.forEach(t => {
      if (t.type === 'Stock-In' || t.type === 'Opening') totalStockIn += t.quantity
      else if (t.type === 'Stock-Out') totalStockOut += t.quantity
    })

    return {
      openingBalance,
      totalStockIn,
      totalStockOut,
      closingBalance: openingBalance + totalStockIn - totalStockOut
    }
  }, [filteredTransactions, transactions, fromDate, toDate, dateError])

  const itemName =
    (item.itemId && typeof item.itemId === 'object'
      ? (item.itemId as any).itemName
      : items.find(i => i._id === item.itemId)?.itemName) || 'Unknown Item'

  return (
    <>
      <Tooltip title='View transactions'>
        <IconButton size='small' color='primary' onClick={handleOpen}>
          <ReceiptText size={18} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
        <DialogTitle>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>Transaction History</Typography>
            <Typography variant='subtitle1'>
              Current Stock: <strong>{currentStock}</strong>
            </Typography>
          </Box>
          <Typography variant='subtitle2' color='text.secondary'>
            {itemName}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box display='flex' justifyContent='center' p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity='error'>{error}</Alert>
          ) : transactions.length === 0 ? (
            <Typography
              variant='body1'
              color='text.secondary'
              textAlign='center'
              p={2}
            >
              No transaction history found for this item.
            </Typography>
          ) : (
            <>
              {/* Date Range Filter */}
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                <Box sx={{ display: 'flex', gap: 2, mb: dateError ? 1.5 : 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DatePicker
                      label='From Date'
                      value={safeToDate(fromDate)}
                      onChange={newValue => setFromDate(newValue)}
                      format='dd/MM/yyyy'
                      maxDate={toDate || undefined}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DatePicker
                      label='To Date'
                      value={safeToDate(toDate)}
                      onChange={newValue => setToDate(newValue)}
                      format='dd/MM/yyyy'
                      minDate={fromDate || undefined}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                  </Box>
                </Box>
              </LocalizationProvider>
              {dateError && (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  “From” date must be on or before the “To” date.
                </Alert>
              )}

              {/* Summary Section */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant='h6' gutterBottom>
                  Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Opening Balance
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {calculateSummary.openingBalance}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Total Stock-In
                    </Typography>
                    <Typography variant='h6' color='success.main'>
                      +{calculateSummary.totalStockIn}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Total Stock-Out
                    </Typography>
                    <Typography variant='h6' color='error.main'>
                      -{calculateSummary.totalStockOut}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Closing Balance
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {calculateSummary.closingBalance}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Transactions Table */}
              <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align='right'>Quantity</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Opening balance carried into this period (bank-statement style) */}
                    {!dateError && (
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          {fromDate
                            ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                            Opening balance
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Box component='span' sx={{ fontWeight: 700 }}>{calculateSummary.openingBalance}</Box>
                        </TableCell>
                        <TableCell><Typography variant='body2' color='text.disabled'>—</Typography></TableCell>
                        <TableCell><Typography variant='body2' color='text.disabled'>—</Typography></TableCell>
                      </TableRow>
                    )}
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align='center'>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            py={2}
                          >
                            {dateError
                              ? 'Fix the date range to view transactions.'
                              : 'No stock movements in this range — balance carried from before.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map(txn => {
                        const rowKey =
                          txn._id || `${txn.date.toString()}-${txn.reference}`

                        // Resolve the source in/out record for ref + redirect.
                        const src =
                          txn.type === 'Stock-In'
                            ? stockInByRef[String(txn.reference)]
                            : txn.type === 'Stock-Out'
                            ? stockOutByRef[String(txn.reference)]
                            : undefined
                        const refLabel = src?.num != null ? `#${src.num}` : txn.reference
                        const detailPath =
                          txn.type === 'Stock-In' && src
                            ? `/stock-in-details/${src._id}`
                            : txn.type === 'Stock-Out' && src
                            ? `/stock-out-details/${src._id}`
                            : null

                        return (
                          <TableRow key={rowKey} hover>
                            <TableCell>
                              {new Date(txn.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size='small'
                                label={
                                  txn.type === 'Stock-In'
                                    ? 'Stock-In'
                                    : txn.type === 'Opening'
                                    ? 'Opening'
                                    : 'Stock-Out'
                                }
                                color={
                                  txn.type === 'Stock-In'
                                    ? 'success'
                                    : txn.type === 'Opening'
                                    ? 'info'
                                    : 'error'
                                }
                                variant={txn.type === 'Opening' ? 'outlined' : 'filled'}
                              />
                            </TableCell>
                            <TableCell align='right'>
                              <Box
                                component='span'
                                sx={{
                                  fontWeight: 700,
                                  color:
                                    txn.type === 'Stock-Out' ? 'error.main' : 'success.main'
                                }}
                              >
                                {txn.type === 'Stock-Out' ? '−' : '+'}
                                {txn.quantity}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {txn.type === 'Opening' ? (
                                <Typography variant='caption' color='text.disabled'>
                                  — (opening balance)
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                  <Typography variant='body2' sx={{ fontFamily: '"Space Mono", monospace' }}>
                                    {refLabel}
                                  </Typography>
                                  <TxnCopyButton value={String(refLabel)} />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              {detailPath ? (
                                <Tooltip title={`Open ${txn.type === 'Stock-In' ? 'stock-in' : 'stock-out'} entry`}>
                                  <IconButton size='small' color='primary' onClick={() => navigate(detailPath)}>
                                    <OpenInNewIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Typography variant='body2' color='text.disabled'>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                    {/* Closing balance at end of period */}
                    {!dateError && (
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          {toDate
                            ? new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                            Closing balance
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Box component='span' sx={{ fontWeight: 700 }}>{calculateSummary.closingBalance}</Box>
                        </TableCell>
                        <TableCell><Typography variant='body2' color='text.disabled'>—</Typography></TableCell>
                        <TableCell><Typography variant='body2' color='text.disabled'>—</Typography></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const StockRecordFilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters
}: {
  filters: FilterItemStockRecord
  onFiltersChange: (filters: FilterItemStockRecord) => void
  onClearFilters: () => void
}) => {
  const [open, setOpen] = useState(false) // collapsed by default
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const activeCount = filters.year ? 1 : 0

  return (
    <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
      {/* Header — filter icon toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          cursor: 'pointer',
          borderBottom: open ? '1px solid' : 'none',
          borderColor: 'divider'
        }}
        onClick={() => setOpen(o => !o)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          {activeCount > 0 && (
            <Box
              sx={{
                minWidth: 18,
                height: 18,
                px: 0.5,
                borderRadius: 999,
                bgcolor: 'primary.main',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              {activeCount}
            </Box>
          )}
        </Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          onClick={e => e.stopPropagation()}
        >
          {activeCount > 0 && (
            <Button
              size='small'
              variant='text'
              startIcon={<X size={14} />}
              onClick={onClearFilters}
            >
              Clear
            </Button>
          )}
          <IconButton
            size='small'
            onClick={() => setOpen(o => !o)}
            aria-label='toggle filters'
            sx={{
              color: open ? 'primary.main' : 'text.secondary',
              bgcolor: open ? 'action.selected' : 'transparent'
            }}
          >
            <SlidersHorizontal size={17} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={open} timeout={260}>
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)'
            }
          }}
        >
          {/* Year Filter */}
          <FormControl size='small' fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={filters.year}
              label='Year'
              onChange={e =>
                onFiltersChange({ ...filters, year: e.target.value })
              }
            >
              <MenuItem value=''>All Years</MenuItem>
              {years.map(year => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Card>
  )
}

export default function ItemStockRecordPage () {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [itemStockRecord, setItemStockRecord] = useState<ItemStockRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterItemStockRecord>({
    search: '',
    itemStockRecordId: 0,
    itemId: '',
    openingStock: 0,
    closingStock: 0,
    remainingStock: 0,
    createdAt: '',
    updatedAt: '',
    year: String(new Date().getFullYear()) // default to current year
  })
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    item: ItemStockRecord | null
  }>({ open: false, item: null })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    item: ItemStockRecord | null
    loading: boolean
  }>({ open: false, item: null, loading: false })
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [itemsResponse, stockRecordsResponse] = await Promise.all([
        getResources('/items?showInactive=true'),
        getResources('/item-stock-records')
      ])

      setItems(Array.isArray(itemsResponse) ? itemsResponse : [])
      setItemStockRecord(
        Array.isArray(stockRecordsResponse) ? stockRecordsResponse : []
      )
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setItems([])
      setItemStockRecord([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const columns: TableColumn<ItemStockRecord>[] = [
    {
      id: 'itemId',
      label: 'Item',
      format: (value: any) => {
        const it = value && typeof value === 'object' ? value : items.find(g => g._id === value)
        return it ? (
          <Box display='flex' alignItems='center' gap={0.5}>
            {it.itemName}
            {!it.isActive && (
              <Chip
                label='Inactive'
                size='small'
                color='error'
                variant='outlined'
              />
            )}
          </Box>
        ) : (
          'Unknown'
        )
      }
    },
    {
      id: 'openingStock',
      label: 'Opening Stock',
      format: value => value?.toString() || '0'
    },
    {
      id: 'closingStock',
      label: 'Closing',
      format: value => value?.toString() || '0'
    },
    {
      id: 'remainingStock',
      label: 'Remaining',
      format: value => value?.toString() || '0'
    },
    {
      id: 'updatedAt',
      label: 'Updated At',
      format: value => new Date(value).toLocaleDateString('en-GB')
    },
    {
      id: 'createdAt',
      label: 'Created At',
      format: value => new Date(value).toLocaleDateString('en-GB')
    },
    {
      id: 'actions',
      label: 'Details',
      format: (_, item) => (
        <TransactionHistoryDialog item={item} items={items} />
      )
    }
  ]

  const filteredItems = useMemo(() => {
    if (!itemStockRecord) return []

    return itemStockRecord.filter(item => {
      const searchStr = filters.search.toLowerCase()

      // Year filter logic
      if (filters.year) {
        const itemYear = new Date(item.createdAt).getFullYear().toString()
        if (itemYear !== filters.year) {
          return false
        }
      }

      // Find the related item details (itemId may be a populated object)
      const relatedItem =
        item.itemId && typeof item.itemId === 'object'
          ? (item.itemId as any)
          : items.find(i => i._id === item.itemId)

      return (
        // Search in stock record fields
        item.itemStockRecordId?.toString().toLowerCase().includes(searchStr) ||
        item.openingStock?.toString().toLowerCase().includes(searchStr) ||
        item.closingStock?.toString().toLowerCase().includes(searchStr) ||
        item.remainingStock?.toString().toLowerCase().includes(searchStr) ||
        item.createdAt.toLowerCase().includes(searchStr) ||
        item.updatedAt.toLowerCase().includes(searchStr) ||
        // Search in related item fields
        relatedItem?.itemName?.toLowerCase().includes(searchStr) ||
        false ||
        relatedItem?.modelNoSKU?.toLowerCase().includes(searchStr) ||
        false
      )
    })
  }, [itemStockRecord, filters.search, filters.year, items])

  const confirmDelete = async () => {
    if (!deleteDialog.item) return

    setDeleteDialog(prev => ({ ...prev, loading: true }))

    try {
      await deleteResource(
        '/item-stock-records',
        deleteDialog.item._id as string
      )
      setItemStockRecord((prev: ItemStockRecord[] | null) => {
        if (!prev) return []
        return prev.filter(item => item._id !== deleteDialog.item!._id)
      })
      showSnackbar('Item deleted successfully', 'success')
      setDeleteDialog({ open: false, item: null, loading: false })
    } catch (error) {
      console.error('Error deleting item:', error)
      showSnackbar('Failed to delete item', 'error')
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      itemStockRecordId: 0,
      itemId: '',
      openingStock: 0,
      closingStock: 0,
      remainingStock: 0,
      createdAt: '',
      updatedAt: '',
      year: ''
    })
  }

  if (loading) {
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  if (itemStockRecord === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='warning'>No item stock record available</Alert>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col'>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
          <Box sx={{ width: '3px', borderRadius: '2px', bgcolor: 'primary.main' }} />
          <Box>
            <Typography variant='h4' component='h1' sx={{ lineHeight: 1.15 }}>Item Stock Records</Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.25 }}>
              Track stock levels & transaction history
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Search records…'
            value={filters.search || ''}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: { xs: '100%', sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search size={16} style={{ opacity: 0.6 }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>
      </Box>

      {/* Filter Panel */}
      <StockRecordFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <DynamicTable
        data={filteredItems || []}
        columns={columns}
        serialColumn
        actions={
          [
            // {
            //   icon: <OpenInNewIcon fontSize="small" />,
            //   tooltip: "View details",
            //   color: "primary",
            //   onClick: (item) => {}, // Handled by the TransactionHistoryDialog component
            // },
          ]
        }
      />

      {/* Edit Dialog */}
      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, item: null })}
        type='itemStockRecord'
        item={editDialog.item}
        onSuccess={loadAllData}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, item: null, loading: false })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: 'Delete Item',
          description:
            'Are you sure you want to delete this item? This action cannot be undone.',
          confirmText: 'Delete',
          loadingText: 'Deleting...'
        }}
        severity='error'
        actionVariant='delete'
      />

      {/* Snackbar */}
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
