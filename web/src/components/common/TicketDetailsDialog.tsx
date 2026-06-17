import {
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Portal,
  Tooltip,
  Typography
} from '@mui/material'
import { Copy, X, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { imageAPI } from '../../api/api'
import type {
  IssueType,
  ResolutionStatus,
  StockItem,
  Store,
  SupportPerson,
  Ticket,
  TicketStatus
} from '../../api/types'

interface TicketDetailsDialogProps {
  open: boolean
  onClose: () => void
  ticket: Ticket | null
  ticketStatuses: TicketStatus[]
  resolutionStatuses: ResolutionStatus[]
  issueTypes: IssueType[]
  supportPersons: SupportPerson[]
  stockItems: StockItem[]
  stores: Store[]
}

interface ImageWithUrl {
  key: string
  url: string | null
  loading: boolean
  error: boolean
}

export const TicketDetailsDialog = ({
  open,
  onClose,
  ticket,
  ticketStatuses,
  resolutionStatuses,
  issueTypes,
  supportPersons,
  stockItems,
  stores
}: TicketDetailsDialogProps) => {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [images, setImages] = useState<ImageWithUrl[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  // Fetch S3 download URLs when dialog opens and ticket has pictures
  useEffect(() => {
    if (!open || !ticket?.pictures || ticket.pictures.length === 0) {
      setImages([])
      return
    }

    const fetchImageUrls = async () => {
      setLoadingImages(true)
      try {
        // console.log('Ticket pictures from DB:', ticket.pictures)

        // Initialize images with loading state
        const initialImages: ImageWithUrl[] = ticket.pictures!.map(key => ({
          key,
          url: null,
          loading: true,
          error: false
        }))
        setImages(initialImages)

        // Fetch download URLs
        let downloadResponse
        if (ticket.pictures!.length === 1) {
          // console.log('Fetching single image URL for key:', ticket.pictures![0])
          // Single image
          downloadResponse = await imageAPI.getSingleDownloadUrl(
            ticket.pictures![0]
          )
          // console.log('Single image API response:', downloadResponse)
          downloadResponse = {
            results: [
              {
                key: ticket.pictures![0],
                downloadUrl: downloadResponse.downloadUrl,
                success: downloadResponse.success !== false
              }
            ]
          }
        } else {
          // console.log( 'Fetching multiple image URLs for keys:',ticket.pictures!)
          // Multiple images
          downloadResponse = await imageAPI.getMultipleDownloadUrls(
            ticket.pictures!
          )
          // console.log('Multiple images API response:', downloadResponse)
        }

        // console.log('Final download response:', downloadResponse)

        if (downloadResponse.results) {
          // Update images with URLs
          setImages(prev =>
            prev.map(img => {
              const result = downloadResponse.results.find(
                (r: any) => r.key === img.key
              )
              // console.log( `Processing image key: ${img.key}, found result:`,result)
              return {
                ...img,
                url: result?.success ? result.downloadUrl : null,
                loading: false,
                error: !result?.success
              }
            })
          )
        } else {
          console.error('No results found in download response')
          setImages(prev =>
            prev.map(img => ({
              ...img,
              loading: false,
              error: true
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching image URLs:', error)
        // Mark all images as error
        setImages(prev =>
          prev.map(img => ({
            ...img,
            loading: false,
            error: true
          }))
        )
      } finally {
        setLoadingImages(false)
      }
    }

    fetchImageUrls()
  }, [open, ticket?.pictures])

  if (!ticket) return null
  // Add this component definition somewhere in your file
  const DetailItem = ({
    label,
    children
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
        {label}
      </Typography>
      <Typography variant='body1'>{children}</Typography>
    </Box>
  )
  // Calculate aging functions
  const calculateAging = (
    startDate: string | Date | null
  ): { text: string; startDate: string } => {
    if (!startDate) return { text: 'N/A', startDate: 'N/A' }

    const start = new Date(startDate)
    const current = new Date()
    const diffTime = Math.abs(current.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const ageText = diffDays === 1 ? '1 day' : `${diffDays} days`
    const startDateFormatted = start.toLocaleDateString('en-GB')

    return { text: ageText, startDate: startDateFormatted }
  }

  const supportCompanyAging = calculateAging(ticket.callIdDate)
  const internalSystemAging = calculateAging(ticket.openingDate)
  const calculateInternalAging = (ticket: Ticket) => {
    try {
      const openingDate = ticket.openingDate
        ? new Date(ticket.openingDate)
        : null
      if (!openingDate) return 'No opening date'

      const isResolved =
        ticketStatus?.name?.toLowerCase() === 'resolved' ||
        ticketStatus?.name?.toLowerCase() === 'completed' ||
        ticketStatus?.name?.toLowerCase() === 'closed'

      if (isResolved && ticket.resolutionDate) {
        const resolutionDate = new Date(ticket.resolutionDate)
        const diffTime = resolutionDate.getTime() - openingDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} days (Resolved)`
      } else {
        const currentDate = new Date()
        const diffTime = currentDate.getTime() - openingDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} days (Open)`
      }
    } catch (error) {
      return 'Error calculating'
    }
  }

  const calculateSupportCompanyAging = (ticket: Ticket) => {
    try {
      const callIdDate = ticket.callIdDate ? new Date(ticket.callIdDate) : null
      if (!callIdDate) return 'No call ID date'

      const isResolved =
        ticketStatus?.name?.toLowerCase() === 'resolved' ||
        ticketStatus?.name?.toLowerCase() === 'completed' ||
        ticketStatus?.name?.toLowerCase() === 'closed'

      if (isResolved && ticket.resolutionDate) {
        const resolutionDate = new Date(ticket.resolutionDate)
        const diffTime = resolutionDate.getTime() - callIdDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} days (Resolved)`
      } else {
        const currentDate = new Date()
        const diffTime = currentDate.getTime() - callIdDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} days (Open)`
      }
    } catch (error) {
      return 'Error calculating'
    }
  }
  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Handle both object and string ID cases for all related fields
  const getTicketStatus = () => {
    if (
      typeof ticket.ticketStatusId === 'object' &&
      ticket.ticketStatusId !== null
    ) {
      return ticket.ticketStatusId as TicketStatus
    }
    return ticketStatuses.find(s => s._id === ticket.ticketStatusId)
  }

  const getResolutionStatus = () => {
    if (
      typeof ticket.resolutionStatusId === 'object' &&
      ticket.resolutionStatusId !== null
    ) {
      return ticket.resolutionStatusId as ResolutionStatus
    }
    return resolutionStatuses.find(s => s._id === ticket.resolutionStatusId)
  }

  const getIssueType = () => {
    if (typeof ticket.issueTypeId === 'object' && ticket.issueTypeId !== null) {
      return ticket.issueTypeId as IssueType
    }
    return issueTypes.find(i => i._id === ticket.issueTypeId)
  }

  const getSupportPerson = () => {
    if (
      typeof ticket.supportPersonId === 'object' &&
      ticket.supportPersonId !== null
    ) {
      return ticket.supportPersonId as SupportPerson
    }
    return supportPersons.find(s => s._id === ticket.supportPersonId)
  }

  const getStockItem = (): StockItem | string | undefined => {
    if (typeof ticket.stockItemId === 'object' && ticket.stockItemId !== null) {
      return ticket.stockItemId as StockItem
    }
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isMongoId = typeof ticket.stockItemId === 'string' && /^[a-f\d]{24}$/i.test(ticket.stockItemId)
    if (isMongoId) {
      return stockItems.find(i => i._id === ticket.stockItemId)
    }
    // Return the plain serial number string as-is
    return ticket.stockItemId as string | undefined
  }

  const getStore = () => {
    if (typeof ticket.storeId === 'object' && ticket.storeId !== null) {
      return ticket.storeId as Store
    }
    return stores.find(s => s._id === ticket.storeId)
  }

  const ticketStatus = getTicketStatus()
  const resolutionStatus = getResolutionStatus()
  const issueType = getIssueType()
  const supportPerson = getSupportPerson()
  const stockItem = getStockItem()
  const store = getStore()

  // Helper to get serial number display value
  const getSerialNoDisplay = (): string => {
    if (!stockItem) return '-'
    if (typeof stockItem === 'string') return stockItem // Plain serial number string
    return stockItem.serialNo || '-' // StockItem object
  }

  // Function to check if image URL is valid
  const isImageUrlValid = (url: string) => {
    return (
      url &&
      (url.startsWith('blob:') ||
        url.startsWith('http') ||
        url.startsWith('data:image'))
    )
  }

  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl)
  }

  const handleCloseEnlargedImage = () => {
    setEnlargedImage(null)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h6'>
                Ticket Details - #{ticket.ticketId}
              </Typography>
              <Tooltip title='Copy ID'>
                <IconButton
                  size='small'
                  onClick={() => copyToClipboard(ticket.ticketId || '')}
                  sx={{ ml: 1 }}
                >
                  <Copy size={16} />
                </IconButton>
              </Tooltip>
            </Box>
            <IconButton onClick={onClose} size='small'>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Aging Section */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1
              }}
            >
              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Aging (Support Company)
                </Typography>
                <Typography variant='body1' fontWeight='bold' color='primary'>
                  {ticket ? calculateSupportCompanyAging(ticket) : '-'}

                  {/* {supportCompanyAging.text} */}
                </Typography>
                <Typography variant='caption' color='textSecondary'>
                  From: {supportCompanyAging.startDate}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Aging (Internal System)
                </Typography>
                <Typography variant='body1' fontWeight='bold' color='secondary'>
                  {ticket ? calculateInternalAging(ticket) : '-'}
                  {/* {internalSystemAging.text} */}
                </Typography>
                <Typography variant='caption' color='textSecondary'>
                  From: {internalSystemAging.startDate}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Ticket Type
                </Typography>
                <Chip
                  label={ticket.ticketType}
                  size='small'
                  color={
                    ticket.ticketType === 'INSTALLATION'
                      ? 'primary'
                      : 'secondary'
                  }
                />
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Ticket Status
                </Typography>
                <Typography variant='body1'>
                  {ticketStatus?.name || 'Unknown'}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Resolution Status
                </Typography>
                <Typography variant='body1'>
                  {resolutionStatus?.resolutionStatusName || 'Not Set'}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                {ticket.ticketType === 'SUPPORT' && (
                  <DetailItem label='Issue Type'>
                    {issueType ? (
                      <Box display='flex' alignItems='center' gap={0.5}>
                        {issueType.issueTypeName}
                        {!issueType.isActive && (
                          <Chip
                            label='Inactive'
                            size='small'
                            color='error'
                            variant='outlined'
                          />
                        )}
                      </Box>
                    ) : (
                      'Not specified'
                    )}
                  </DetailItem>
                )}
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Support Person
                </Typography>
                <Typography variant='body1'>
                  {supportPerson?.supportPersonName || 'Not Assigned'}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Call ID
                </Typography>
                <Typography variant='body1'>
                  {ticket.callId || 'Not Provided'}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Call ID Date
                </Typography>
                <Typography variant='body1'>
                  {ticket.callIdDate
                    ? new Date(ticket.callIdDate).toLocaleDateString('en-GB')
                    : 'Not Provided'}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Opening Date
                </Typography>
                <Typography variant='body1'>
                  {new Date(ticket.openingDate).toLocaleDateString('en-GB')}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Resolution Date
                </Typography>
                <Typography variant='body1'>
                  {ticket.resolutionDate
                    ? new Date(ticket.resolutionDate).toLocaleDateString(
                        'en-GB'
                      )
                    : 'Not Resolved'}
                </Typography>
              </Box>
            </Box>

            {/* Pictures Section */}
            {(images.length > 0 || loadingImages) && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Pictures ({ticket.pictures?.length || 0})
                  </Typography>

                  {loadingImages && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2
                      }}
                    >
                      <CircularProgress size={20} />
                      <Typography variant='body2' color='textSecondary'>
                        Loading images from S3...
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {images.map((image, index) => (
                      <Box
                        key={image.key}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          backgroundColor: '#f5f5f5',
                          position: 'relative',
                          cursor:
                            image.url && !image.error ? 'pointer' : 'default',
                          '&:hover .zoom-icon': {
                            opacity: image.url && !image.error ? 1 : 0
                          }
                        }}
                        onClick={() =>
                          image.url &&
                          !image.error &&
                          handleImageClick(image.url)
                        }
                      >
                        {image.loading && <CircularProgress size={24} />}

                        {image.error && (
                          <Typography
                            variant='caption'
                            color='error'
                            textAlign='center'
                          >
                            Failed to load image
                          </Typography>
                        )}

                        {image.url && !image.error && !image.loading && (
                          <>
                            <Box
                              component='img'
                              src={image.url}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              alt={`Ticket picture ${index + 1}`}
                              onError={() => {
                                setImages(prev =>
                                  prev.map(img =>
                                    img.key === image.key
                                      ? { ...img, error: true }
                                      : img
                                  )
                                )
                              }}
                            />
                            <Box
                              className='zoom-icon'
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <ZoomIn color='white' size={24} />
                            </Box>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {/* Show S3 keys for debugging if needed */}
                  {/* {images.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        S3 Keys: {images.map(img => img.key.split('/').pop()).join(', ')}
                      </Typography>
                    </Box>
                  )} */}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Enlargement Modal */}
      <Portal>
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: 9999, // Set to a very high z-index
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          open={!!enlargedImage}
          onClick={handleCloseEnlargedImage}
        >
          {enlargedImage && (
            <Box
              sx={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component='img'
                src={enlargedImage}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 1
                }}
                alt='Enlarged ticket image'
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
                onClick={handleCloseEnlargedImage}
              >
                <X size={24} />
              </IconButton>
            </Box>
          )}
        </Backdrop>
      </Portal>
    </>
  )
}
