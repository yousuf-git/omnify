import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteResource, getResources } from '../api/api'
import type {
  FilterTicket,
  IssueType,
  ResolutionStatus,
  State,
  StockItem,
  Store,
  SupportPerson,
  Ticket,
  TicketStatus
} from '../api/types'
import { ConfirmationDialog } from '../components/common/DeleteConfirmDialog'
import { EditItemDialog } from '../components/common/EditItemDialog'
import { TicketList } from '../components/common/TicketList'
import { TicketFilterPanel } from '../components/filter/TicketFilterPanel'

export default function TicketPage () {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterTicket>({
    search: '',
    ticketType: undefined,
    ticketStatusId: '',
    resolutionStatusId: '',
    issueTypeId: '',
    storeId: '',
    supportPersonId: '',
    dateFrom: '',
    dateTo: '',
    storeStatus: 'all',
    rating: 0,
    ratingSort: ''
  })
  //  rating: 0,ratingSort: "", // Added for rating sorting
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([])
  const [resolutionStatuses, setResolutionStatuses] = useState<
    ResolutionStatus[]
  >([])
  const [supportPersons, setSupportPersons] = useState<SupportPerson[]>([])
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [states, setStates] = useState<State[]>([])
  const [editDialog, setEditDialog] = useState({
    open: false,
    ticket: null as Ticket | null
  })
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    ticket: null as Ticket | null,
    loading: false
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all required data in parallel
      const [
        ticketsResponse,
        ticketStatusesResponse,
        resolutionStatusesResponse,
        supportPersonsResponse,
        issueTypesResponse,
        stockItemsResponse,
        storesResponse,
        statesResponse
      ] = await Promise.all([
        getResources('/ticket'),
        getResources('/ticket-status?showInactive=true'),
        getResources('/resolution-status?showInactive=true'),
        getResources('/support-person?showInactive=true'),
        getResources('/issue-type?showInactive=true'),
        getResources('/stock-items?showInactive=true'),
        getResources('/stores?showInactive=true'),
        getResources('/states?showInactive=true')
      ])

      // Set all state with the responses
      setTickets(Array.isArray(ticketsResponse) ? ticketsResponse : [])
      setTicketStatuses(
        Array.isArray(ticketStatusesResponse) ? ticketStatusesResponse : []
      )
      setResolutionStatuses(
        Array.isArray(resolutionStatusesResponse)
          ? resolutionStatusesResponse
          : []
      )
      setSupportPersons(
        Array.isArray(supportPersonsResponse) ? supportPersonsResponse : []
      )
      setIssueTypes(Array.isArray(issueTypesResponse) ? issueTypesResponse : [])
      setStockItems(Array.isArray(stockItemsResponse) ? stockItemsResponse : [])
      setStores(Array.isArray(storesResponse) ? storesResponse : [])
      setStates(Array.isArray(statesResponse) ? statesResponse : [])
    } catch (err: any) {
      console.error('Error loading data:', err)
      showSnackbar(`Error: ${err.message}`, 'error')
      setError(err instanceof Error ? err.message : 'Failed to load data')

      // Reset all states on error
      setTickets([])
      setTicketStatuses([])
      setResolutionStatuses([])
      setSupportPersons([])
      setIssueTypes([])
      setStockItems([])
      setStores([])
      setStates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // ---- lookup maps for the record list ----
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]))
  const statusMap = useMemo(() => mapBy(ticketStatuses), [ticketStatuses])
  const resolutionMap = useMemo(() => mapBy(resolutionStatuses), [resolutionStatuses])
  const issueMap = useMemo(() => mapBy(issueTypes), [issueTypes])
  const supportMap = useMemo(() => mapBy(supportPersons), [supportPersons])
  const storeMap = useMemo(() => mapBy(stores), [stores])
  const stockItemMap = useMemo(() => mapBy(stockItems), [stockItems])

  const filteredTickets = useMemo(() => {
    if (!tickets) return []

    const ticketsWithAging = tickets
      .map(ticket => {
        const store =
          typeof ticket.storeId === 'object' && ticket.storeId !== null
            ? ticket.storeId
            : stores.find(s => s._id === ticket.storeId)

        const ticketStatus =
          typeof ticket.ticketStatusId === 'object' &&
          ticket.ticketStatusId !== null
            ? (ticket.ticketStatusId as TicketStatus)
            : ticketStatuses.find(s => s._id === ticket.ticketStatusId)

        const isClosed =
          ticketStatus?.name?.toLowerCase() === 'completed' ||
          ticketStatus?.name?.toLowerCase() === 'resolved'

        // Calculate both aging values
        const openDate = ticket.openingDate
          ? new Date(ticket.openingDate)
          : null
        let currentAging = 0
        let resolutionAging = 0

        if (openDate) {
          // Current Aging: Current Date - Open Date (for open tickets)
          const currentDate = new Date()
          const currentDiffTime = Math.abs(
            currentDate.getTime() - openDate.getTime()
          )
          currentAging = Math.ceil(currentDiffTime / (1000 * 60 * 60 * 24))

          // Resolution Aging: Resolution Date - Open Date (for closed tickets)
          if (isClosed && ticket.resolutionDate) {
            const resolutionDate = new Date(ticket.resolutionDate)
            const resolutionDiffTime = Math.abs(
              resolutionDate.getTime() - openDate.getTime()
            )
            resolutionAging = Math.ceil(
              resolutionDiffTime / (1000 * 60 * 60 * 24)
            )
          }
        }
        const rating = Number(ticket.rating) || 0

        return {
          ...ticket,
          isStoreActive: store?.isActive ?? true,
          currentAging: currentAging,
          resolutionAging: resolutionAging,
          ticketStatus: ticketStatus,
          isClosed: isClosed,
          rating: rating
        }
      })
      .filter(ticket => {
        const ticketStatus =
          typeof ticket.ticketStatusId === 'object' &&
          ticket.ticketStatusId !== null
            ? (ticket.ticketStatusId as TicketStatus)
            : ticketStatuses.find(s => s._id === ticket.ticketStatusId)

        // 🔴 By default hide "Completed" and "Resolved"
        const isCompletedOrResolved =
          ticketStatus?.name?.toLowerCase() === 'completed' ||
          ticketStatus?.name?.toLowerCase() === 'resolved'

        // Agar user ne koi filter apply nahi kiya, to hide karo
        // But if a resolution status filter is applied, show completed/resolved tickets
        if (
          !filters.ticketStatusId &&
          !filters.resolutionStatusId &&
          isCompletedOrResolved
        ) {
          return false
        }

        // Baaki existing filters same rahenge
        const resolutionStatus =
          typeof ticket.resolutionStatusId === 'object' &&
          ticket.resolutionStatusId !== null
            ? (ticket.resolutionStatusId as ResolutionStatus)
            : resolutionStatuses.find(s => s._id === ticket.resolutionStatusId)

        const issueType =
          typeof ticket.issueTypeId === 'object' && ticket.issueTypeId !== null
            ? (ticket.issueTypeId as IssueType)
            : issueTypes.find(i => i._id === ticket.issueTypeId)

        const stockItem =
          typeof ticket.stockItemId === 'object' && ticket.stockItemId !== null
            ? (ticket.stockItemId as StockItem)
            : stockItems.find(i => i._id === ticket.stockItemId)

        // Get serial number - either from StockItem object or plain string
        const serialNumber = (() => {
          if (!ticket.stockItemId) return ''
          if (typeof ticket.stockItemId === 'object' && ticket.stockItemId !== null) {
            return (ticket.stockItemId as StockItem).serialNo || ''
          }
          // Check if it's a MongoDB ObjectId or plain serial number
          const isMongoId = /^[a-f\d]{24}$/i.test(ticket.stockItemId as string)
          if (isMongoId) {
            return stockItem?.serialNo || ''
          }
          // It's a plain serial number string
          return ticket.stockItemId as string
        })()

        const supportPerson =
          typeof ticket.supportPersonId === 'object' &&
          ticket.supportPersonId !== null
            ? (ticket.supportPersonId as SupportPerson)
            : supportPersons.find(s => s._id === ticket.supportPersonId)

        const store =
          typeof ticket.storeId === 'object' && ticket.storeId !== null
            ? (ticket.storeId as Store)
            : stores.find(s => s._id === ticket.storeId)

        // ✅ Filters
        const searchTerm = (filters.search || '').toLowerCase()
        const matchesSearch =
          !searchTerm ||
          ticket.ticketId?.toString().toLowerCase().includes(searchTerm) ||
          ticket.callId?.toLowerCase().includes(searchTerm) ||
          ticketStatus?.name?.toLowerCase().includes(searchTerm) ||
          resolutionStatus?.resolutionStatusName
            ?.toLowerCase()
            .includes(searchTerm) ||
          ticket?.rating.toString().includes(searchTerm) ||
          issueType?.issueTypeName?.toLowerCase().includes(searchTerm) ||
          serialNumber?.toLowerCase().includes(searchTerm) ||
          store?.storeName?.toLowerCase().includes(searchTerm) ||
          supportPerson?.supportPersonName?.toLowerCase().includes(searchTerm) ||
          ticket?.notes?.toLowerCase().includes(searchTerm)

        const matchesType =
          !filters.ticketType || ticket.ticketType === filters.ticketType

        const matchesStatus =
          !filters.ticketStatusId ||
          (typeof ticket.ticketStatusId === 'object' &&
          ticket.ticketStatusId !== null
            ? (ticket.ticketStatusId as TicketStatus)._id ===
              filters.ticketStatusId
            : ticket.ticketStatusId === filters.ticketStatusId)
        const matchesRating =
          !filters.rating ||
          ticket.rating?.toString() === filters.rating.toString() ||
          ticket.rating?.toString().includes(filters.rating.toString())

        const matchesResolution =
          !filters.resolutionStatusId ||
          (typeof ticket.resolutionStatusId === 'object' &&
          ticket.resolutionStatusId !== null
            ? (ticket.resolutionStatusId as ResolutionStatus)._id ===
              filters.resolutionStatusId
            : ticket.resolutionStatusId === filters.resolutionStatusId)

        const matchesIssue =
          !filters.issueTypeId ||
          (ticket.ticketType === 'INSTALLATION' && !filters.issueTypeId) || // Use ticket.ticketType instead of formData.ticketType
          (typeof ticket.issueTypeId === 'object' && ticket.issueTypeId !== null
            ? (ticket.issueTypeId as IssueType)._id === filters.issueTypeId
            : ticket.issueTypeId === filters.issueTypeId)

        const matchesStore =
          !filters.storeId ||
          (typeof ticket.storeId === 'object' && ticket.storeId !== null
            ? (ticket.storeId as Store)._id === filters.storeId
            : ticket.storeId === filters.storeId)

        // State filter - matches if store's state matches the filter
        const matchesState = (() => {
          if (!filters.stateId) return true
          if (!store) return false
          const storeStateId = typeof store.stateId === 'object' && store.stateId !== null
            ? (store.stateId as any)._id
            : store.stateId
          return storeStateId === filters.stateId
        })()

        const matchesSupportPerson =
          !filters.supportPersonId ||
          (typeof ticket.supportPersonId === 'object' &&
          ticket.supportPersonId !== null
            ? (ticket.supportPersonId as SupportPerson)._id ===
              filters.supportPersonId
            : ticket.supportPersonId === filters.supportPersonId)

        const openingDate = ticket.openingDate
          ? new Date(ticket.openingDate)
          : null
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null

        const matchesDateFrom =
          !fromDate || !openingDate || openingDate >= fromDate
        const matchesDateTo = !toDate || !openingDate || openingDate <= toDate

        const matchesStoreStatus =
          !filters.storeStatus ||
          filters.storeStatus === 'all' ||
          (filters.storeStatus === 'active' && ticket.isStoreActive) ||
          (filters.storeStatus === 'inactive' && !ticket.isStoreActive)

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus &&
          matchesResolution &&
          matchesIssue &&
          matchesStore &&
          matchesState &&
          matchesSupportPerson &&
          matchesDateFrom &&
          matchesRating &&
          matchesDateTo &&
          matchesStoreStatus
        )
      })

    // Sort tickets: pending items on top by current aging (descending)
    // return ticketsWithAging.sort((a, b) => {
    //   // If both are pending, sort by current aging (higher aging first)
    //   if (!a.isClosed && !b.isClosed) {
    //     return b.currentAging! - a.currentAging!;
    //   }

    //   // If only a is pending, it comes first
    //   if (!a.isClosed && b.isClosed) {
    //     return -1;
    //   }

    //   // If only b is pending, it comes first
    //   if (a.isClosed && !b.isClosed) {
    //     return 1;
    //   }

    //   // If both are closed, sort by resolution aging (higher resolution time first)
    //   if (a.isClosed && b.isClosed) {
    //     return b.resolutionAging! - a.resolutionAging!;
    //   }

    //   return 0;
    // });

    const sortedTickets = [...ticketsWithAging]

    if (filters.ratingSort === 'asc') {
      sortedTickets.sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0

        return ratingA - ratingB
      })
    }
    // ✅ Fix the rating sort logic
    if (filters.ratingSort === 'asc') {
      // console.log('Sorting ascending',sortedTickets.map(t => t.rating))
      sortedTickets.sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        // console.log(`Comparing ${ratingA} vs ${ratingB}`)
        return ratingA - ratingB
      })
    } else if (filters.ratingSort === 'desc') {
      // console.log( 'Sorting dscending',sortedTickets.map(t => t.rating))
      sortedTickets.sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        // console.log(`Comparing ${ratingA} vs ${ratingB}`)
        return ratingB - ratingA
      })
    } else {
      // Default aging sort
      sortedTickets.sort((a, b) => {
        if (!a.isClosed && !b.isClosed) {
          return b.currentAging! - a.currentAging!
        }
        if (!a.isClosed && b.isClosed) return -1
        if (a.isClosed && !b.isClosed) return 1
        if (a.isClosed && b.isClosed) {
          return b.resolutionAging! - a.resolutionAging!
        }
        return 0
      })
    }
    return sortedTickets
  }, [
    tickets,
    filters.search,
    filters.ticketType,
    filters.ticketStatusId,
    filters.resolutionStatusId,
    filters.issueTypeId,
    filters.storeId,
    filters.stateId,
    filters.supportPersonId,
    filters.dateFrom,
    filters.dateTo,
    filters.storeStatus,
    filters.rating,
    filters.ratingSort,
    ticketStatuses,
    resolutionStatuses,
    issueTypes,
    stockItems,
    stores,
    supportPersons
  ])

  // const filteredTickets = useMemo(() => {
  //   if (!tickets) return [];

  //   return tickets
  //     .map((ticket) => {
  //       const store =
  //         typeof ticket.storeId === "object" && ticket.storeId !== null
  //           ? ticket.storeId
  //           : stores.find((s) => s._id === ticket.storeId);

  //       return {
  //         ...ticket,
  //         isStoreActive: store?.isActive ?? true,
  //       };
  //     })
  //     .filter((ticket) => {
  //       const ticketStatus =
  //         typeof ticket.ticketStatusId === "object" &&
  //         ticket.ticketStatusId !== null
  //           ? (ticket.ticketStatusId as TicketStatus)
  //           : ticketStatuses.find((s) => s._id === ticket.ticketStatusId);

  //       // 🔴 By default hide "Completed" and "Resolved"
  //       const isCompletedOrResolved =
  //         ticketStatus?.name?.toLowerCase() === "completed" ||
  //         ticketStatus?.name?.toLowerCase() === "resolved";

  //       // Agar user ne koi filter apply nahi kiya, to hide karo
  //       if (!filters.ticketStatusId && isCompletedOrResolved) {
  //         return false;
  //       }

  //       // Baaki existing filters same rahenge
  //       const resolutionStatus =
  //         typeof ticket.resolutionStatusId === "object" &&
  //         ticket.resolutionStatusId !== null
  //           ? (ticket.resolutionStatusId as ResolutionStatus)
  //           : resolutionStatuses.find(
  //               (s) => s._id === ticket.resolutionStatusId
  //             );

  //       const issueType =
  //         typeof ticket.issueTypeId === "object" && ticket.issueTypeId !== null
  //           ? (ticket.issueTypeId as IssueType)
  //           : issueTypes.find((i) => i._id === ticket.issueTypeId);

  //       const stockItem =
  //         typeof ticket.stockItemId === "object" && ticket.stockItemId !== null
  //           ? (ticket.stockItemId as StockItem)
  //           : stockItems.find((i) => i._id === ticket.stockItemId);

  //       const supportPerson =
  //         typeof ticket.supportPersonId === "object" &&
  //         ticket.supportPersonId !== null
  //           ? (ticket.supportPersonId as SupportPerson)
  //           : supportPersons.find((s) => s._id === ticket.supportPersonId);

  //       const store =
  //         typeof ticket.storeId === "object" && ticket.storeId !== null
  //           ? (ticket.storeId as Store)
  //           : stores.find((s) => s._id === ticket.storeId);

  //       // ✅ Filters
  //       const searchTerm = (filters.search || "").toLowerCase();
  //       const matchesSearch =
  //         !searchTerm ||
  //         ticket.ticketId?.toString().toLowerCase().includes(searchTerm) ||
  //         ticket.callId?.toLowerCase().includes(searchTerm) ||
  //         ticketStatus?.name?.toLowerCase().includes(searchTerm) ||
  //         resolutionStatus?.resolutionStatusName
  //           ?.toLowerCase()
  //           .includes(searchTerm) ||
  //         issueType?.issueTypeName?.toLowerCase().includes(searchTerm) ||
  //         stockItem?.serialNo?.toLowerCase().includes(searchTerm) ||
  //         store?.storeName?.toLowerCase().includes(searchTerm) ||
  //         supportPerson?.supportPersonName?.toLowerCase().includes(searchTerm);

  //       const matchesType =
  //         !filters.ticketType || ticket.ticketType === filters.ticketType;

  //       const matchesStatus =
  //         !filters.ticketStatusId ||
  //         (typeof ticket.ticketStatusId === "object" &&
  //         ticket.ticketStatusId !== null
  //           ? (ticket.ticketStatusId as TicketStatus)._id ===
  //             filters.ticketStatusId
  //           : ticket.ticketStatusId === filters.ticketStatusId);

  //       const matchesResolution =
  //         !filters.resolutionStatusId ||
  //         (typeof ticket.resolutionStatusId === "object" &&
  //         ticket.resolutionStatusId !== null
  //           ? (ticket.resolutionStatusId as ResolutionStatus)._id ===
  //             filters.resolutionStatusId
  //           : ticket.resolutionStatusId === filters.resolutionStatusId);

  //       const matchesIssue =
  //         !filters.issueTypeId ||
  //         (ticket.ticketType === "INSTALLATION" && !filters.issueTypeId) || // Use ticket.ticketType instead of formData.ticketType
  //         (typeof ticket.issueTypeId === "object" && ticket.issueTypeId !== null
  //           ? (ticket.issueTypeId as IssueType)._id === filters.issueTypeId
  //           : ticket.issueTypeId === filters.issueTypeId);

  //       const matchesStore =
  //         !filters.storeId ||
  //         (typeof ticket.storeId === "object" && ticket.storeId !== null
  //           ? (ticket.storeId as Store)._id === filters.storeId
  //           : ticket.storeId === filters.storeId);

  //       const matchesSupportPerson =
  //         !filters.supportPersonId ||
  //         (typeof ticket.supportPersonId === "object" &&
  //         ticket.supportPersonId !== null
  //           ? (ticket.supportPersonId as SupportPerson)._id ===
  //             filters.supportPersonId
  //           : ticket.supportPersonId === filters.supportPersonId);

  //       const openingDate = ticket.openingDate
  //         ? new Date(ticket.openingDate)
  //         : null;
  //       const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
  //       const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

  //       const matchesDateFrom =
  //         !fromDate || !openingDate || openingDate >= fromDate;
  //       const matchesDateTo = !toDate || !openingDate || openingDate <= toDate;

  //       const matchesStoreStatus =
  //         !filters.storeStatus ||
  //         filters.storeStatus === "all" ||
  //         (filters.storeStatus === "active" && ticket.isStoreActive) ||
  //         (filters.storeStatus === "inactive" && !ticket.isStoreActive);

  //       return (
  //         matchesSearch &&
  //         matchesType &&
  //         matchesStatus &&
  //         matchesResolution &&
  //         matchesIssue &&
  //         matchesStore &&
  //         matchesSupportPerson &&
  //         matchesDateFrom &&
  //         matchesDateTo &&
  //         matchesStoreStatus
  //       );
  //     });
  // }, [
  //   tickets,
  //   filters.search,
  //   filters.ticketType,
  //   filters.ticketStatusId,
  //   filters.resolutionStatusId,
  //   filters.issueTypeId,
  //   filters.storeId,
  //   filters.supportPersonId,
  //   filters.dateFrom,
  //   filters.dateTo,
  //   filters.storeStatus,
  //   ticketStatuses,
  //   resolutionStatuses,
  //   issueTypes,
  //   stockItems,
  //   stores,
  //   supportPersons,
  // ]);

  const handleEdit = (ticket: Ticket) => {
    navigate(`/ticket-details/${ticket._id}`)
  }

  const handleDelete = (ticket: Ticket) => {
    setDeleteDialog({ open: true, ticket, loading: false })
  }


  const confirmDelete = async () => {
    if (!deleteDialog.ticket) return

    setDeleteDialog(prev => ({ ...prev, loading: true }))

    try {
      await deleteResource('/ticket', deleteDialog.ticket._id as string)
      setTickets(prev =>
        prev.filter(item => item._id !== deleteDialog.ticket!._id)
      )
      showSnackbar('Ticket deleted successfully', 'success')
    } catch (error) {
      console.error('Delete error:', error)
      showSnackbar(
        error instanceof Error ? error.message : 'Failed to delete ticket',
        'error'
      )
    } finally {
      setDeleteDialog({ open: false, ticket: null, loading: false })
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
      ticketType: undefined,
      ticketStatusId: '',
      resolutionStatusId: '',
      issueTypeId: '',
      storeId: '',
      stateId: '',
      supportPersonId: '',
      dateFrom: '',
      dateTo: '',
      storeStatus: 'all',
      rating: 0,
      ratingSort: ''
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

  return (
    <Box className='flex flex-col'>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
          <Box sx={{ width: '3px', borderRadius: '2px', bgcolor: 'primary.main' }} />
          <Box>
            <Typography variant='h4' component='h1' sx={{ lineHeight: 1.15 }}>Tickets</Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.25 }}>
              Support & installation tickets
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Search tickets…'
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
          <Button variant='contained' startIcon={<Plus size={16} />} onClick={() => navigate('/TicketForm')}>
            New ticket
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <TicketFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        ticketStatuses={ticketStatuses}
        resolutionStatuses={resolutionStatuses}
        issueTypes={issueTypes}
        stores={stores}
        supportPersons={supportPersons}
        states={states}
      />

      {/* Record list */}
      <TicketList
        records={filteredTickets as any}
        statusMap={statusMap}
        resolutionMap={resolutionMap}
        issueMap={issueMap}
        supportMap={supportMap}
        storeMap={storeMap}
        stockItemMap={stockItemMap}
        ratingSort={(filters.ratingSort as any) || ''}
        onRatingSortChange={(v) => setFilters((prev) => ({ ...prev, ratingSort: v }))}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, ticket: null })}
        type='ticket'
        item={editDialog.ticket}
        onSuccess={loadAllData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, ticket: null, loading: false })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: 'Delete Ticket',
          description: `Are you sure you want to delete ticket #${deleteDialog.ticket?.ticketId}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
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
