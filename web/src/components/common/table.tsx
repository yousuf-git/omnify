import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { motion } from 'framer-motion'
import React from 'react'
import type { TableProps } from '../../api/types'

export const DynamicTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  sx,
  maxHeight,
  stickyHeader = false,
  onRowClick,
  actions = [],
  getRowId = (row: T) => row.id,
  disableInternalSort = false,
  serialColumn = false
}: TableProps<T>) => {
  // Internal pagination state for client-side pagination
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const MotionTableRow = motion(TableRow)
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // Reset to first page when changing rows per page
  }

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row)
    }
  }

  // Sort and calculate paginated data for client-side
  // const paginatedData = React.useMemo(() => {
  //   let sortedData = [...data];

  //   // Check if data has createdAt field and sort by newest first
  //   if (data.length > 0 && data[0].hasOwnProperty('createdAt')) {
  //     sortedData = sortedData.sort((a, b) => {
  //       const dateA = new Date(a.createdAt).getTime();
  //       const dateB = new Date(b.createdAt).getTime();
  //       return dateB - dateA; // Newest first (descending order)
  //     });
  //   }

  //   return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  // }, [data, page, rowsPerPage]);

  const paginatedData = React.useMemo(() => {
    if (data.length === 0) return []

    // If internal sort is disabled, just paginate without sorting
    if (disableInternalSort) {
      return data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    }

    const sortedData = [...data]

    // Define sorting priorities
    const dateFields = ['stockInDate', 'stockOutDate', 'createdAt']

    // Find the best available date field (exists in at least one item)
    let availableDateField = null
    for (const field of dateFields) {
      const hasValidDates = data.some(
        row =>
          row &&
          row[field] !== undefined &&
          row[field] !== null &&
          !isNaN(new Date(row[field]).getTime())
      )

      if (hasValidDates) {
        availableDateField = field
        break
      }
    }

    // console.log('Best available date field:', availableDateField);

    if (availableDateField) {
      sortedData.sort((a, b) => {
        try {
          const dateA = a[availableDateField]
            ? new Date(a[availableDateField]).getTime()
            : 0
          const dateB = b[availableDateField]
            ? new Date(b[availableDateField]).getTime()
            : 0

          // Handle cases where date might be missing in some items
          if (isNaN(dateA) && isNaN(dateB)) return 0
          if (isNaN(dateA)) return 1 // Put items without date at end
          if (isNaN(dateB)) return -1 // Put items without date at end

          return dateB - dateA // latest first
        } catch (error) {
          console.warn('Date parsing error:', error)
          return 0
        }
      })
    }

    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [data, page, rowsPerPage, disableInternalSort])

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
        <LinearProgress />
      </Paper>
    )
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
        {emptyState?.component || (
          <>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              {emptyState?.title || 'No items found'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {emptyState?.message ||
                'Try adjusting your filters or add some items to get started.'}
            </Typography>
          </>
        )}
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '6px',
        ...sx
      }}
      className='transition-all duration-900 ease-in-out'
    >
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          maxHeight,
          fontSize: '0.875rem'
        }}
        className='transition-all duration-900 ease-in-out'
      >
        <Table stickyHeader={stickyHeader} sx={{ minWidth: 800 }}>
          <TableHead>
            <MotionTableRow>
              {serialColumn && (
                <TableCell sx={{ width: 56, textWrap: 'nowrap' }}>Sr.</TableCell>
              )}
              {columns.map(column => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    position: column.sticky ? 'sticky' : undefined,
                    left: column.sticky ? 0 : undefined,
                    zIndex: column.sticky ? 2 : undefined,
                    backgroundColor: column.sticky ? 'background.default' : undefined,
                    ...column.headerSx,
                    textWrap: 'nowrap'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  align='center'
                  sx={{
                    position: 'sticky',
                    right: 0,
                    zIndex: 2,
                    backgroundColor: 'background.default'
                  }}
                >
                  Actions
                </TableCell>
              )}
            </MotionTableRow>
          </TableHead>
          <TableBody
            className='transition-all duration-900 ease-in-out'
            sx={{ transition: 'background-color 0.2s ease-in-out' }}
          >
            {paginatedData.map((row, rowIndex) => {
              const rowId = getRowId(row)
              return (
                <TableRow
                  hover={!!onRowClick}
                  tabIndex={-1}
                  key={rowId}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleRowClick(row)}
                  className='transition-all duration-900 ease-in-out'
                >
                  {serialColumn && (
                    <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                      {page * rowsPerPage + rowIndex + 1}
                    </TableCell>
                  )}
                  {columns.map(column => {
                    const value = row[column.id as keyof T]
                    const cellContent = column.renderCell
                      ? column.renderCell(row)
                      : column.format
                      ? column.format(value, row)
                      : value

                    if (
                      column.id === 'requiresInstallation' ||
                      column.id === 'requiresSerialNumberManagement'
                    ) {
                      return (
                        <TableCell
                          sx={{ fontSize: '0.85rem' }}
                          key={column.id}
                          align={column.align}
                        >
                          <Chip
                            label={cellContent === true ? 'Yes' : 'No'}
                            variant='outlined'
                            size='small'
                            sx={{
                              fontWeight: 'medium',
                              minWidth: 60
                            }}
                          />
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell
                        key={String(column.id)}
                        align={column.align}
                        sx={{
                          position: column.sticky ? 'sticky' : undefined,
                          left: column.sticky ? 0 : undefined,
                          backgroundColor: column.sticky
                            ? 'background.paper'
                            : undefined,
                          ...column.cellSx,
                          fontSize: '0.85rem',
                          textWrap: 'nowrap'
                        }}
                      >
                        {cellContent}
                      </TableCell>
                    )
                  })}
                  {actions.length > 0 && (
                    <TableCell
                      align='center'
                      sx={{
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'background.paper',
                        zIndex: 1,
                        fontSize: '0.85rem'
                      }}
                    >
                      <Box display='flex' gap={1} justifyContent='center'>
                        {actions.map((action, index) => (
                          <Tooltip key={index} title={action.tooltip}>
                            <IconButton
                              size='small'
                              onClick={e => {
                                e.stopPropagation()
                                action.onClick(row)
                              }}
                              sx={{
                                color: `${action.color}.main`,
                                '&:hover': {
                                  backgroundColor: `${action.color}.light`,
                                  color: 'white'
                                }
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component='div'
        count={data.length} // Total number of items
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          borderTop: '1px solid',
          borderColor: theme =>
            theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'
        }}
      />
    </Paper>
  )
}
