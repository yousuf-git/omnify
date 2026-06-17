import { AddPhotoAlternate, ArrowBack, Delete } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  createFilterOptions,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { enGB } from 'date-fns/locale/en-GB'
import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createResource,
  getResource,
  getResources,
  getSpecificResources,
  imageAPI,
  updateResource
} from '../../api/api'
import type {
  AssignedTo,
  IssueType,
  ResolutionStatus,
  StockItem,
  Store,
  SupportPerson,
  Ticket,
  TicketStatus
} from '../../api/types'
import { useNestedEntity } from '../../contexts/NestedEntityContext'
import { toDate } from '../../utils/safeDate'

// Helper function to get city name from store
const getCityName = (store: Store): string => {
  if (typeof store.cityId === 'object' && store.cityId !== null) {
    return (store.cityId as any).cityName || ''
  }
  return ''
}

// Helper function to get state name from store
const getStateName = (store: Store): string => {
  if (typeof store.stateId === 'object' && store.stateId !== null) {
    return (store.stateId as any).stateName || ''
  }
  return ''
}

// Helper function to get state ID from store for filtering
const getStoreStateId = (store: Store): string => {
  if (typeof store.stateId === 'object' && store.stateId !== null) {
    return (store.stateId as any)._id || ''
  }
  return store.stateId as string || ''
}

// Create filter options for State Autocomplete
const stateFilterOptions = createFilterOptions<{ _id: string; stateName: string }>({
  matchFrom: 'any',
  stringify: (option) => option.stateName
})

// Helper function to format store display label
const getStoreDisplayLabel = (store: Store): string => {
  const cityName = getCityName(store)
  const stateName = getStateName(store)
  const location = [cityName, stateName].filter(Boolean).join(', ')
  return location ? `${store.storeName} (${location})` : store.storeName
}

// Create filter options for Store Autocomplete
const storeFilterOptions = createFilterOptions<Store>({
  matchFrom: 'any',
  stringify: (option) => `${option.storeName} ${getCityName(option)} ${getStateName(option)}`
})

// Helper function to get city name from support person
const getSupportPersonCityName = (person: SupportPerson): string => {
  if (typeof person.cityId === 'object' && person.cityId !== null) {
    return (person.cityId as any).cityName || ''
  }
  return ''
}

// Helper function to get state name from support person
const getSupportPersonStateName = (person: SupportPerson): string => {
  if (typeof person.stateId === 'object' && person.stateId !== null) {
    return (person.stateId as any).stateName || ''
  }
  return ''
}

// Helper function to get state ID from support person for filtering
const getSupportPersonStateId = (person: SupportPerson): string => {
  if (typeof person.stateId === 'object' && person.stateId !== null) {
    return (person.stateId as any)._id || ''
  }
  return person.stateId as string || ''
}

// Helper function to format support person display label
const getSupportPersonDisplayLabel = (person: SupportPerson): string => {
  const cityName = getSupportPersonCityName(person)
  const stateName = getSupportPersonStateName(person)
  const location = [cityName, stateName].filter(Boolean).join(', ')
  return location ? `${person.supportPersonName} (${location})` : person.supportPersonName
}

// Create filter options for Support Person Autocomplete
const supportPersonFilterOptions = createFilterOptions<SupportPerson>({
  matchFrom: 'any',
  stringify: (option) => `${option.supportPersonName} ${getSupportPersonCityName(option)} ${getSupportPersonStateName(option)}`
})

interface TicketFormData {
  _id?: string
  ticketType: 'INSTALLATION' | 'SUPPORT'
  ticketStatusId: string | TicketStatus | null // Match Ticket interface
  resolutionStatusId?: string | ResolutionStatus | null // Match Ticket interface
  supportPersonId?: string | SupportPerson | null // Match Ticket interface
  issueTypeId: string | IssueType | null // Match Ticket interface
  stockItemId: string | StockItem | null // Match Ticket interface
  storeId?: string | Store | null
  assignedToId?: string | AssignedTo | null // Optional assigned to
  openingDate: string
  resolutionDate?: string
  callId: string
  rating?: number
  callIdDate: string
  pictures?: string[]
  notes?: string // Optional notes field
  isActive: boolean
  ticketId?: string
  storeDetails?: any
  createdAt?: string
  updatedAt?: string
}

interface UploadedImage {
  file: File
  preview: string
  key?: string // S3 key after upload
  uploaded: boolean
  uploading: boolean
}

interface TicketFormProps {
  ticketData?: Ticket | null
  onSuccess?: () => void
  onCancel?: () => void
  isEditMode?: boolean
  dialogZIndex?: number
}

export function TicketForm ({
  ticketData,
  onSuccess,
  onCancel,
  isEditMode = false,
  dialogZIndex
}: TicketFormProps) {
  const navigate = useNavigate()
  const { openDialog, registerRefreshCallback, unregisterRefreshCallback } = useNestedEntity()
  const [submitting, setSubmitting] = useState(false)
  const [originalPictures, setOriginalPictures] = useState<string[]>([])
  // Add this state near the other image-related states
  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState<TicketFormData>({
    ticketType: 'SUPPORT',
    ticketStatusId: '',
    resolutionStatusId: '',
    supportPersonId: '',
    issueTypeId: '',
    stockItemId: '',
    storeId: null,
    openingDate: getTodayDateString(),
    resolutionDate: getTodayDateString(),
    callId: '',
    rating: 0,
    callIdDate: new Date().toISOString(),
    pictures: [],
    notes: '',
    isActive: true,
    storeDetails: null,
    // Remove ticketId from the spread
    ...(ticketData
      ? {
          ...ticketData,
          ticketStatusId:
            ticketData.ticketStatusId &&
            typeof ticketData.ticketStatusId === 'object'
              ? ticketData.ticketStatusId._id
              : ticketData.ticketStatusId || '',
          resolutionStatusId:
            ticketData.resolutionStatusId &&
            typeof ticketData.resolutionStatusId === 'object'
              ? ticketData.resolutionStatusId._id
              : ticketData.resolutionStatusId,
          supportPersonId:
            ticketData.supportPersonId &&
            typeof ticketData.supportPersonId === 'object'
              ? ticketData.supportPersonId._id
              : ticketData.supportPersonId || '',
          issueTypeId:
            ticketData.issueTypeId && typeof ticketData.issueTypeId === 'object'
              ? ticketData.issueTypeId._id
              : ticketData.issueTypeId || null,
          stockItemId:
            ticketData.stockItemId && typeof ticketData.stockItemId === 'object'
              ? ticketData.stockItemId._id
              : ticketData.stockItemId || '',
          storeId:
            ticketData.storeId && typeof ticketData.storeId === 'object'
              ? ticketData.storeId._id
              : ticketData.storeId || null,
          notes: ticketData.notes || ''
        }
      : {})
  })

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [existingImages, setExistingImages] = useState<
    { key: string; url: string | null; loading: boolean }[]
  >([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasImageChanges, setHasImageChanges] = useState(false)

  // Helper function to validate image file types
  const validateImageFile = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    return allowedTypes.includes(file.type)
  }

  // Helper function to generate unique filename
  // const generateFileName = (originalName: string): string => {
  //   const extension = originalName.split('.').pop();
  //   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  //   return `image-${timestamp}.${extension}`;
  // };

  // Data state
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([])
  const [resolutionStatuses, setResolutionStatuses] = useState<
    ResolutionStatus[]
  >([])
  const [supportPersons, setSupportPersons] = useState<SupportPerson[]>([])
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [states, setStates] = useState<{ _id: string; stateName: string }[]>([])
  const [assignedToList, setAssignedToList] = useState<AssignedTo[]>([])
  const [selectedStateId, setSelectedStateId] = useState<string>('')
  const [isStoreLocked, setIsStoreLocked] = useState(false)
  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [manualValidation, setManualValidation] = useState(false)
  // Serial number validation state
  const [serialNo, setSerialNo] = useState('')
  const [serialNoValidation, setSerialNoValidation] = useState({
    isValid: false,
    message: 'Enter serial number to check availability',
    isChecking: false,
    stockItem: null as StockItem | null,
    hasBeenChecked: false
  })

  // Helper function to get display value for Autocomplete options
  const getOptionLabel = (option: any, fieldType: string) => {
    if (!option) return ''

    if (typeof option === 'string') {
      // Find the actual object from the corresponding array
      switch (fieldType) {
        case 'ticketStatus':
          const status = ticketStatuses.find(s => s._id === option)
          return status?.name || ''
        case 'resolutionStatus':
          const resolution = resolutionStatuses.find(r => r._id === option)
          return resolution?.resolutionStatusName || ''
        case 'supportPerson':
          const person = supportPersons.find(p => p._id === option)
          return person?.supportPersonName || ''
        case 'issueType':
          const issue = issueTypes.find(i => i._id === option)
          return issue?.issueTypeName || ''
        default:
          return ''
      }
    }

    // If option is an object
    switch (fieldType) {
      case 'ticketStatus':
        return option.name || ''
      case 'resolutionStatus':
        return option.resolutionStatusName || ''
      case 'supportPerson':
        return option.supportPersonName || ''
      case 'issueType':
        return option.issueTypeName || ''
      default:
        return ''
    }
  }

  // Helper function to find option by ID
  const findOptionById = (id: string, array: any[], fieldType: string) => {
    if (!id) return null
    const option = array.find(item => item._id === id)
    return (
      option || {
        _id: id,
        [fieldType === 'ticketStatus'
          ? 'name'
          : fieldType === 'resolutionStatus'
          ? 'resolutionStatusName'
          : fieldType === 'supportPerson'
          ? 'supportPersonName'
          : 'issueTypeName']: 'Loading...'
      }
    )
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      uploadedImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, [uploadedImages])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          ticketStatusesRes,
          resolutionStatusesRes,
          supportPersonsRes,
          issueTypesRes,
          storesRes,
          statesRes,
          assignedToRes
        ] = await Promise.all([
          getResources('/ticket-status?showInactive=true'),
          getResources('/resolution-status?showInactive=true'),
          getResources('/support-person?showInactive=true'),
          getResources('/issue-type?showInactive=true'),
          getResources('/stores?showInactive=true'),
          getResources('/states?showInactive=true'),
          getResources('/assigned-to?showInactive=true')
        ])

        setTicketStatuses(
          Array.isArray(ticketStatusesRes) ? ticketStatusesRes : []
        )
        setResolutionStatuses(
          Array.isArray(resolutionStatusesRes) ? resolutionStatusesRes : []
        )
        setSupportPersons(
          Array.isArray(supportPersonsRes) ? supportPersonsRes : []
        )
        setIssueTypes(Array.isArray(issueTypesRes) ? issueTypesRes : [])
        setStores(Array.isArray(storesRes) ? storesRes : [])
        setStates(Array.isArray(statesRes) ? statesRes : [])
        setAssignedToList(Array.isArray(assignedToRes) ? assignedToRes : [])

        // If we have ticket data (editing mode), populate the form
        if (ticketData) {
          // console.log("Ticket data received:", ticketData);

          // Helper function to safely extract ID from object or string
          const extractId = (value: any): string | null => {
            if (!value) return null
            if (typeof value === 'object' && value !== null && '_id' in value) {
              return value._id
            }
            return value || null
          }

          // Helper function to check if value is an object
          const isObject = (value: any): boolean => {
            return value && typeof value === 'object' && value !== null
          }

          // Extract the IDs from the populated objects
          const formDataToSet: TicketFormData = {
            _id: ticketData._id,
            ticketId: ticketData.ticketId,
            ticketType: ticketData.ticketType || 'SUPPORT',
            ticketStatusId: extractId(ticketData.ticketStatusId),
            resolutionStatusId: extractId(ticketData.resolutionStatusId),
            supportPersonId: extractId(ticketData.supportPersonId),
            issueTypeId: extractId(ticketData.issueTypeId),
            stockItemId: extractId(ticketData.stockItemId),
            storeId: extractId(ticketData.storeId), // This can now return null
            assignedToId: extractId(ticketData.assignedToId), // Optional assigned to
            openingDate: ticketData.openingDate,
            resolutionDate: ticketData.resolutionDate || '',
            callId: ticketData.callId,
            rating: ticketData.rating || 0,
            callIdDate: ticketData.callIdDate,
            pictures: ticketData.pictures || [],
            isActive:
              ticketData.isActive !== undefined ? ticketData.isActive : true,
            notes: ticketData.notes || '',
            storeDetails: isObject(ticketData.storeId)
              ? ticketData.storeId
              : null
          }

          setFormData(formDataToSet)

          // Set selectedStateId based on store's state for edit mode
          if (ticketData.storeId && isObject(ticketData.storeId)) {
            const storeObj = ticketData.storeId as Store
            const storeStateId = typeof storeObj.stateId === 'object' && storeObj.stateId !== null
              ? (storeObj.stateId as any)._id
              : storeObj.stateId as string
            if (storeStateId) {
              setSelectedStateId(storeStateId)
            }
          }

          // Store original pictures for comparison during edit
          if (ticketData.pictures && ticketData.pictures.length > 0) {
            setOriginalPictures([...ticketData.pictures])
            // Load existing images with S3 URLs
            loadExistingImages(ticketData.pictures)
          }
          // Set image previews if pictures exist
          if (ticketData.pictures && ticketData.pictures.length > 0) {
            setImagePreviews(ticketData.pictures)
          }
          // Set serial number from the stockItemId (can be StockItem object or plain string)
          if (ticketData.stockItemId) {
            if (isObject(ticketData.stockItemId)) {
              // It's a populated StockItem object
              const stockItem = ticketData.stockItemId as StockItem
              setSerialNo(stockItem.serialNo || '')
              setSerialNoValidation({
                isValid: true,
                message: 'Stock item loaded from existing ticket',
                isChecking: false,
                stockItem: stockItem,
                hasBeenChecked: true
              })

              // Check if store should be locked (if stock item has stockOutId)
              if (stockItem.stockOutId) {
                setIsStoreLocked(true)
              }
            } else {
              // It's a plain string (serial number or MongoDB ObjectId that wasn't populated)
              const stockItemIdStr = ticketData.stockItemId as string
              // Check if it's a MongoDB ObjectId (24 hex characters) or a serial number
              const isMongoId = /^[a-f\d]{24}$/i.test(stockItemIdStr)
              if (!isMongoId) {
                // It's a plain serial number, show it directly
                setSerialNo(stockItemIdStr)
                setSerialNoValidation({
                  isValid: false,
                  message: 'Serial number (not validated)',
                  isChecking: false,
                  stockItem: null,
                  hasBeenChecked: false
                })
              } else {
                // It's a MongoDB ObjectId, try to find it in stockItems
                // This case shouldn't happen often as backend usually populates
                setSerialNo('')
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading data:', err)
        showSnackbar(`Error: ${err.message}`, 'error')
      }
    }

    loadData()
  }, [ticketData])

  // Helper function to refresh specific data
  const refreshSupportPersons = async () => {
    try {
      const response = await getResources('/support-person?showInactive=true')
      setSupportPersons(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error('Error refreshing support persons:', err)
    }
  }

  const refreshStores = async () => {
    try {
      const response = await getResources('/stores?showInactive=true')
      setStores(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error('Error refreshing stores:', err)
    }
  }

  const refreshAssignedToList = async () => {
    try {
      const response = await getResources('/assigned-to?showInactive=true')
      setAssignedToList(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error('Error refreshing assigned to list:', err)
    }
  }

  // Register refresh callbacks for nested entity creation
  useEffect(() => {
    registerRefreshCallback('supportPersons', refreshSupportPersons)
    registerRefreshCallback('stores', refreshStores)
    registerRefreshCallback('assignedToList', refreshAssignedToList)
    
    return () => {
      unregisterRefreshCallback('supportPersons')
      unregisterRefreshCallback('stores')
      unregisterRefreshCallback('assignedToList')
    }
  }, [registerRefreshCallback, unregisterRefreshCallback])

  // Handlers for adding new entities
  const handleAddSupportPerson = () => {
    openDialog('supportPerson', refreshSupportPersons)
  }

  const handleAddStore = () => {
    openDialog('store', refreshStores)
  }

  const handleAddAssignedTo = () => {
    openDialog('assignedTo', refreshAssignedToList)
  }

  // Serial number validation is now manual only - no auto-validation
  // User must click the Validate button to validate the serial number
  // const checkSerialNumber = async () => {
  //   if (!serialNo.trim()) {
  //     setSerialNoValidation({
  //       isValid: false,
  //       message: "Enter serial number to check availability",
  //       isChecking: false,
  //       stockItem: null,
  //       hasBeenChecked: false,
  //     });
  //     setFormData((prev) => ({ ...prev, stockItemId: "" }));
  //     return;
  //   }

  //   setSerialNoValidation((prev) => ({
  //     ...prev,
  //     isChecking: true,
  //     hasBeenChecked: true,
  //   }));
  //   try {
  //     const response = await getSpecificResources(
  //       `/stock-items/check?serialNo=${encodeURIComponent(serialNo)}`
  //     );

  //     if (response && response.isValid && response.isStockedOut) {
  //       // Success case
  //       setSerialNoValidation({
  //         isValid: true,
  //         message:
  //           response.message || "Serial number is available for ticket ✅",
  //         isChecking: false,
  //         stockItem: response.stockItem,
  //         hasBeenChecked: true,
  //       });
  //       // console.log("Stock item:", response.stockItem);
  //       // console.log("Stock item ID:", response.stockItem?._id);
  //       // console.log("Stock item serial number:", response);

  //       if (response.stockItem.stockOutId) {
  //         const stockOutId = response.stockItem.stockOutId;

  //         // Step 3: Fetch the StockOut document
  //         const stockOutResponse = await getResource("/stock-outs", stockOutId);
  //         console.log("stockOutResponse", stockOutResponse);
  //         // Check if storeId exists in stockOutResponse
  //         if (stockOutResponse.storeId) {
  //           const storeId = stockOutResponse.storeId;

  //           // Update form data with store information
  //           setFormData((prev) => ({
  //             ...prev,
  //             storeId: storeId._id,
  //             storeDetails: storeId,
  //           }));

  //           // Lock the store field
  //           setIsStoreLocked(true);
  //         } else {
  //           // If no storeId in stockOutResponse, keep storeId as null
  //           setFormData((prev) => ({
  //             ...prev,
  //             storeId: null,
  //             storeDetails: null,
  //           }));

  //           // Don't lock the store field since it's optional
  //           setIsStoreLocked(false);
  //         }
  //       } else {
  //         throw new Error("Stock item details not found");
  //       }

  //       if (response.stockItem && response.stockItem._id) {
  //         setFormData((prev) => ({
  //           ...prev,
  //           stockItemId: response.stockItem._id,
  //         }));
  //       }
  //     } else {
  //       // Invalid case
  //       setSerialNoValidation({
  //         isValid: false,
  //         message:
  //           response?.message ||
  //           "Serial number is not available or not stocked out ❌",
  //         isChecking: false,
  //         stockItem: null,
  //         hasBeenChecked: true,
  //       });

  //       setFormData((prev) => ({
  //         ...prev,
  //         stockItemId: "",
  //       }));
  //     }
  //   } catch (error: any) {
  //     console.error("Error checking serial number:", error);
  //     showSnackbar(`Error: ${error.message}`, "error");

  //     // Fallback: Allow manual selection if backend is down
  //     setSerialNoValidation({
  //       isValid: true, // Allow proceeding for now
  //       message: "Backend unavailable - proceeding with manual validation ⚠️",
  //       isChecking: false,
  //       stockItem: null,
  //       hasBeenChecked: true,
  //     });
  //   }
  // };

  // Remove the store locking logic from checkSerialNumber function
  const checkSerialNumber = async () => {
    if (!serialNo.trim()) {
      setSerialNoValidation({
        isValid: true, // Make empty serial number valid
        message: 'Serial number is optional',
        isChecking: false,
        stockItem: null,
        hasBeenChecked: true
      })
      setFormData(prev => ({ ...prev, stockItemId: '' }))
      return
    }

    setSerialNoValidation(prev => ({
      ...prev,
      isChecking: true,
      hasBeenChecked: true
    }))

    try {
      const response = await getSpecificResources(
        `/stock-items/check?serialNo=${encodeURIComponent(serialNo)}`
      )

      if (response && response.isValid && response.isStockedOut) {
        setSerialNoValidation({
          isValid: true,
          message:
            response.message || 'Serial number is available for ticket ✅',
          isChecking: false,
          stockItem: response.stockItem,
          hasBeenChecked: true
        })

        // Set stock item ID if serial number is valid
        if (response.stockItem && response.stockItem._id) {
          setFormData(prev => ({
            ...prev,
            stockItemId: response.stockItem._id
          }))

          // Optional: If store is not already set and stock item has store info, auto-populate it
          // But don't lock the field
          if (!formData.storeId && response.stockItem.stockOutId) {
            try {
              const stockOutResponse = await getResource(
                '/stock-outs',
                response.stockItem.stockOutId
              )
              if (stockOutResponse.storeId) {
                setFormData(prev => ({
                  ...prev,
                  storeId: stockOutResponse.storeId._id,
                  storeDetails: stockOutResponse.storeId
                }))
                // Don't lock the store field - setIsStoreLocked(false);
              }
            } catch (error) {
              console.error('Error fetching store details:', error)
            }
          }
        }
      } else {
        setSerialNoValidation({
          isValid: false,
          message:
            response?.message ||
            'Serial number is not available or not stocked out ❌',
          isChecking: false,
          stockItem: null,
          hasBeenChecked: true
        })
        setFormData(prev => ({
          ...prev,
          stockItemId: ''
        }))
      }
    } catch (error: any) {
      console.error('Error checking serial number:', error)
      showSnackbar(`Error: ${error.message}`, 'error')

      setSerialNoValidation({
        isValid: true, // Allow proceeding even if validation fails
        message: 'Validation service unavailable - you can still proceed ⚠️',
        isChecking: false,
        stockItem: null,
        hasBeenChecked: true
      })
    }
  }

  const handleManualValidate = async () => {
    setManualValidation(true)
    await checkSerialNumber()
  }
  //   if (!isEditMode || !ticketData?.stockItemId) {
  //     const timeoutId = setTimeout(checkSerialNumber, 500);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [serialNo, isEditMode, ticketData?.stockItemId]);

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
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAutocompleteChange =
    (name: string) => (event: any, newValue: any) => {
      setFormData(prev => ({
        ...prev,
        [name]: newValue ? newValue._id : ''
      }))
    }

  const handleSerialNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSerialNo(newValue)
    // Reset validation state when user changes serial number
    setSerialNoValidation({
      isValid: false,
      message: newValue.trim() ? 'Click Validate to check serial number (optional)' : 'Enter serial number to check availability',
      isChecking: false,
      stockItem: null,
      hasBeenChecked: false
    })
    // Clear the stockItemId since serial number changed
    setFormData(prev => ({ ...prev, stockItemId: '' }))
    setManualValidation(false)
  }
  const handleDateChange = (name: string) => (date: Date | null) => {
    if (!date) {
      setFormData(prev => ({ ...prev, [name]: '' }))
      return
    }

    // Extract date in local timezone without shifting
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    // If you want DATE only
    const formatted = `${year}-${month}-${day}`

    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.ticketType) {
      showSnackbar('Ticket type is required', 'error')
      return false
    }

    if (!formData.ticketStatusId) {
      showSnackbar('Ticket status is required', 'error')
      return false
    }

    // For installation tickets, clear issueTypeId if it's empty
    if (formData.ticketType === 'INSTALLATION' && !formData.issueTypeId) {
      setFormData(prev => ({ ...prev, issueTypeId: '' }))
    }

    // Enhanced serial number validation
    // if (!formData.stockItemId) {
    //   showSnackbar("Valid serial number is required", "error");
    //   return false;
    // }

    // if (!serialNoValidation.isValid) {
    //   if (serialNoValidation.isChecking) {
    //     showSnackbar("Please wait while we check the serial number", "warning");
    //   } else if (!serialNoValidation.hasBeenChecked) {
    //     showSnackbar("Please check the serial number availability", "error");
    //   } else {
    //     showSnackbar(
    //       "Please enter a valid serial number that is stocked out",
    //       "error"
    //     );
    //   }
    //   return false;
    // }

    //     if (serialNo.trim() && !serialNoValidation.isValid) {
    //   if (serialNoValidation.isChecking) {
    //     showSnackbar("Please wait while we check the serial number", "warning");
    //     return false;
    //   } else {
    //     showSnackbar("Please enter a valid serial number", "error");
    //     return false;
    //   }
    // }

    // if (!formData.storeId) {
    //   showSnackbar("Store is required", "error");
    //   return false;
    // }

    if (!formData.callId) {
      showSnackbar('Call ID is required', 'error')
      return false
    }

    if (!formData.callIdDate) {
      showSnackbar('Call ID date is required', 'error')
      return false
    }

    // Validate serial number
    // if (!serialNoValidation.isValid) {
    //   if (!serialNoValidation.hasBeenChecked) {
    //     showSnackbar("Please check the serial number availability", "error");
    //   } else {
    //     showSnackbar(
    //       "Please enter a valid serial number that is stocked out",
    //       "error"
    //     );
    //   }
    //   return false;
    // }

    if (serialNoValidation.isChecking) {
      showSnackbar('Please wait while we check the serial number', 'warning')
      return false
    }

    // If resolution status is being set, ensure resolution date and support person are provided
    if (formData.resolutionStatusId) {
      if (!formData.resolutionDate) {
        showSnackbar(
          'Resolution date is required when setting resolution status',
          'error'
        )
        return false
      }
      if (!formData.supportPersonId) {
        showSnackbar(
          'Support person is required when setting resolution status',
          'error'
        )
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      setApiError(null)
      setSubmitting(true)
      let finalPictureKeys: string[] = []

      if (isEditMode) {
        // In edit mode, handle existing and new images
        const currentExistingKeys = existingImages.map(img => img.key)

        // Delete removed images from S3 (if any were removed)
        if (originalPictures.length > 0) {
          await deleteRemovedImages(originalPictures, currentExistingKeys)
        }

        // Upload new images if any
        let newUploadedKeys: string[] = []
        if (uploadedImages.length > 0) {
          newUploadedKeys = await uploadImagesToS3()
        }

        finalPictureKeys = [...currentExistingKeys, ...newUploadedKeys]
      } else {
        // console.log("=== CREATE MODE IMAGE DEBUG ===");
        // console.log("Is edit mode:", isEditMode);
        // console.log("Uploaded images count:", uploadedImages.length);
        // console.log("Uploaded images:", uploadedImages);
        // console.log("=== END CREATE MODE DEBUG ===");

        // In create mode, upload images if any are selected
        if (uploadedImages.length > 0) {
          try {
            // console.log("Attempting to upload images to S3...");
            finalPictureKeys = await uploadImagesToS3()
            // console.log("Upload completed, final keys:", finalPictureKeys);

            // TEMPORARY DEBUG: If we got empty keys, add test keys to see if backend accepts them
            // if (finalPictureKeys.length === 0 && uploadedImages.length > 0) {
            //   console.log("WARNING: Upload returned empty keys, using test keys for debugging");
            //   finalPictureKeys = ["test-key-1", "test-key-2"];
            // }
          } catch (imageError) {
            console.error('Image upload failed:', imageError)
            showSnackbar('Failed to upload images. Please try again.', 'error')
            return
          }
        } else {
          console.log('No images to upload')
          finalPictureKeys = []
        }
      }

      const payload = {
        ticketType: formData.ticketType,
        ticketStatusId:
          formData.ticketStatusId && typeof formData.ticketStatusId === 'object'
            ? formData.ticketStatusId._id
            : formData.ticketStatusId,
        resolutionStatusId: formData.resolutionStatusId
          ? typeof formData.resolutionStatusId === 'object'
            ? formData.resolutionStatusId._id
            : formData.resolutionStatusId
          : undefined,
        supportPersonId: formData.supportPersonId
          ? typeof formData.supportPersonId === 'object'
            ? formData.supportPersonId._id
            : formData.supportPersonId
          : undefined,
        issueTypeId:
          formData.issueTypeId && typeof formData.issueTypeId === 'object'
            ? formData.issueTypeId._id
            : formData.issueTypeId,
        // stockItemId can be: validated MongoDB ObjectId, or plain serial number string
        stockItemId: serialNoValidation.isValid && formData.stockItemId
          ? (typeof formData.stockItemId === 'object'
            ? formData.stockItemId._id
            : formData.stockItemId)
          : (serialNo.trim() || undefined),
        storeId:
          formData.storeId && typeof formData.storeId === 'object'
            ? formData.storeId._id
            : formData.storeId,
        assignedToId: formData.assignedToId
          ? typeof formData.assignedToId === 'object'
            ? formData.assignedToId._id
            : formData.assignedToId
          : undefined,
        openingDate: formData.openingDate,
        resolutionDate: formData.resolutionDate || undefined,
        callId: formData.callId,
        rating: Number(formData.rating),
        callIdDate: formData.callIdDate,
        pictures: finalPictureKeys,
        isActive: formData.isActive,
        notes: formData.notes || undefined
      }

      // console.log("=== TICKET SUBMISSION DEBUG ===");
      // console.log("Final picture keys being sent:", finalPictureKeys);
      // console.log("Pictures array length:", finalPictureKeys.length);
      // console.log("Complete payload:", payload);
      // console.log("=== END DEBUG ===");

      // Frontend validation: ensure resolutionDate is not before openingDate
      // Note: Same dates are allowed. Compare only date parts (ignore time/timezone)
      if (formData.resolutionDate && formData.openingDate) {
        const opening = new Date(formData.openingDate)
        const resolution = new Date(formData.resolutionDate)
        // Compare dates by setting time to midnight to avoid timezone issues
        opening.setHours(0, 0, 0, 0)
        resolution.setHours(0, 0, 0, 0)
        if (resolution.getTime() < opening.getTime()) {
          showSnackbar('Resolution date cannot be before opening date', 'error')
          setIsLoading(false)
          setSubmitting(false)
          return
        }
      }

      let result

      if (formData._id) {
        result = await updateResource('/ticket', formData._id, payload)
        showSnackbar('Ticket updated successfully!', 'success')
      } else {
        result = await createResource('/ticket', payload)
        showSnackbar('Ticket created successfully!', 'success')
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        navigate('/TicketPage')
      }, 2000)
    } catch (error) {
      console.error('Detailed submission error:', error)
      let errorMessage = 'Failed to save ticket. Please try again.'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      setApiError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    // Clean up any uploaded images that weren't saved
    await cleanupUnusedImages()

    if (onCancel) {
      onCancel()
    } else {
      navigate('/TicketPage')
    }
  }

  // Cleanup function for unused uploaded images
  const cleanupUnusedImages = async () => {
    const uploadedButUnusedImages = uploadedImages.filter(
      img => img.uploaded && img.key
    )

    if (uploadedButUnusedImages.length > 0) {
      try {
        const keysToDelete = uploadedButUnusedImages.map(img => img.key!)
        if (keysToDelete.length === 1) {
          await imageAPI.deleteSingle(keysToDelete[0])
        } else {
          await imageAPI.bulkDelete(keysToDelete)
        }
        console.log('Cleaned up unused images:', keysToDelete)
      } catch (error) {
        console.error('Failed to cleanup unused images:', error)
      }
    }

    // Revoke object URLs to prevent memory leaks
    uploadedImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
  }

  // Image management functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: UploadedImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!validateImageFile(file)) {
        showSnackbar(`File ${file.name} is not a supported image type`, 'error')
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showSnackbar(
          `File ${file.name} is too large. Maximum size is 10MB`,
          'error'
        )
        continue
      }

      const preview = URL.createObjectURL(file)
      newImages.push({
        file,
        preview,
        uploaded: false,
        uploading: false
      })
    }

    if (newImages.length > 0) {
      // console.log("=== IMAGE SELECTION DEBUG ===");
      // console.log("New images selected:", newImages.length);
      // console.log("New images details:", newImages.map(img => ({ name: img.file.name, size: img.file.size })));
      // console.log("=== END IMAGE SELECTION DEBUG ===");

      setUploadedImages(prev => [...prev, ...newImages])
      setHasImageChanges(true)
    }
  }

  const handleImageRemove = async (index: number) => {
    const imageToRemove = uploadedImages[index]

    // If the image was already uploaded to S3, delete it from S3
    if (imageToRemove.uploaded && imageToRemove.key) {
      try {
        await imageAPI.deleteSingle(imageToRemove.key)
        // console.log("Deleted image from S3:", imageToRemove.key);
        showSnackbar('Image removed and deleted from S3', 'success')
      } catch (error) {
        console.error('Failed to delete image from S3:', error)
        showSnackbar(
          'Image removed from list, but failed to delete from S3',
          'warning'
        )
        // Continue with removal from UI even if S3 deletion failed
      }
    }

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imageToRemove.preview)

    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setHasImageChanges(true)
  }

  const uploadImagesToS3 = async (): Promise<string[]> => {
    const imagesToUpload = uploadedImages.filter(img => !img.uploaded)
    const alreadyUploadedKeys = uploadedImages
      .filter(img => img.uploaded && img.key)
      .map(img => img.key!)

    if (imagesToUpload.length === 0) {
      // Return already uploaded images
      return alreadyUploadedKeys
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Prepare files for batch upload
      const files = imagesToUpload.map(img => ({
        // fileName : generateFileName(img.file.name),
        fileName: img.file.name, // Use original filename
        contentType: img.file.type
      }))

      // Get upload URLs
      let uploadResponse
      if (files.length === 1) {
        uploadResponse = await imageAPI.getSingleUploadUrl(
          files[0].fileName,
          files[0].contentType
        )
        uploadResponse = {
          results: [
            {
              uploadUrl: uploadResponse.uploadUrl,
              key: uploadResponse.key,
              success: true
            }
          ]
        }
      } else {
        uploadResponse = await imageAPI.getBatchUploadUrls(files)
      }

      if (!uploadResponse.results || uploadResponse.results.length === 0) {
        throw new Error('Failed to get upload URLs')
      }

      // Upload files to S3
      const uploadPromises = uploadResponse.results.map(
        async (result: any, index: number) => {
          if (!result.success) {
            throw new Error(
              `Failed to get upload URL for ${files[index].fileName}`
            )
          }

          const imageIndex = uploadedImages.findIndex(
            img => img === imagesToUpload[index]
          )

          // Mark as uploading
          setUploadedImages(prev =>
            prev.map((img, i) =>
              i === imageIndex ? { ...img, uploading: true } : img
            )
          )

          const response = await imageAPI.uploadToS3(
            result.uploadUrl,
            imagesToUpload[index].file
          )

          if (!response.ok) {
            throw new Error(`Failed to upload ${files[index].fileName}`)
          }

          // Mark as uploaded
          setUploadedImages(prev =>
            prev.map((img, i) =>
              i === imageIndex
                ? {
                    ...img,
                    uploading: false,
                    uploaded: true,
                    key: result.key
                  }
                : img
            )
          )

          return result.key
        }
      )

      const uploadedKeys = await Promise.all(uploadPromises)
      setUploadProgress(100)

      // Return both already uploaded keys and newly uploaded keys
      const finalKeys = [...alreadyUploadedKeys, ...uploadedKeys]
      // console.log("=== IMAGE UPLOAD DEBUG ===");
      // console.log("Already uploaded keys:", alreadyUploadedKeys);
      // console.log("Newly uploaded keys:", uploadedKeys);
      // console.log("Final combined keys:", finalKeys);
      // console.log("=== END IMAGE UPLOAD DEBUG ===");

      return finalKeys
    } catch (error) {
      console.error('Error uploading images:', error)
      showSnackbar('Failed to upload images', 'error')
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteRemovedImages = async (
    originalKeys: string[],
    currentKeys: string[]
  ) => {
    const keysToDelete = originalKeys.filter(key => !currentKeys.includes(key))

    if (keysToDelete.length === 0) return

    try {
      if (keysToDelete.length === 1) {
        await imageAPI.deleteSingle(keysToDelete[0])
      } else {
        await imageAPI.bulkDelete(keysToDelete)
      }
      // console.log('Deleted images:', keysToDelete)
    } catch (error) {
      console.error('Error deleting images:', error)
      // Don't throw error as this shouldn't block the main operation
    }
  }

  // Load existing images with S3 download URLs for edit mode
  const loadExistingImages = async (pictureKeys: string[]) => {
    if (!pictureKeys || pictureKeys.length === 0) {
      setExistingImages([])
      return
    }

    try {
      // console.log('Loading existing images for keys:', pictureKeys)

      // Initialize with loading state
      const initialImages = pictureKeys.map(key => ({
        key,
        url: null,
        loading: true
      }))
      setExistingImages(initialImages)

      // Fetch download URLs
      let downloadResponse
      if (pictureKeys.length === 1) {
        // console.log('Fetching single image URL for key:', pictureKeys[0])
        downloadResponse = await imageAPI.getSingleDownloadUrl(pictureKeys[0])
        // console.log('Single image API response:', downloadResponse)
        downloadResponse = {
          results: [
            {
              key: pictureKeys[0],
              downloadUrl: downloadResponse.downloadUrl,
              success: downloadResponse.success !== false
            }
          ]
        }
      } else {
        // console.log('Fetching multiple image URLs for keys:', pictureKeys)
        downloadResponse = await imageAPI.getMultipleDownloadUrls(pictureKeys)
        // console.log('Multiple images API response:', downloadResponse)
      }

      // console.log('Final download response:', downloadResponse)

      if (downloadResponse.results) {
        // Update with URLs
        setExistingImages(prev =>
          prev.map(img => {
            const result = downloadResponse.results.find(
              (r: any) => r.key === img.key
            )
            // console.log(`Processing image key: ${img.key}, found result:`,result)
            return {
              ...img,
              url: result?.success ? result.downloadUrl : null,
              loading: false
            }
          })
        )
      } else {
        console.error('No results found in download response')
        setExistingImages(prev =>
          prev.map(img => ({
            ...img,
            loading: false,
            url: null
          }))
        )
      }
    } catch (error) {
      console.error('Error loading existing images:', error)
      // Mark all as failed to load
      setExistingImages(prev =>
        prev.map(img => ({
          ...img,
          loading: false,
          url: null
        }))
      )
    }
  }

  // Handle removal of existing images in edit mode (just mark for removal, don't delete from S3 yet)
  const handleExistingImageRemove = (index: number) => {
    const imageToRemove = existingImages[index]

    // Remove from UI
    setExistingImages(prev => prev.filter((_, i) => i !== index))

    // Update form data to remove the key
    const updatedPictures =
      formData.pictures?.filter(key => key !== imageToRemove.key) || []
    setFormData(prev => ({ ...prev, pictures: updatedPictures }))

    setHasImageChanges(true)
    showSnackbar('Image marked for removal', 'success')
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
            {isEditMode ? 'Edit ticket' : 'New ticket'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Support & installation ticket
          </Typography>
        </Box>
      </Box>

      <Box className='flex flex-col gap-4'>
        {/* Ticket Details Section */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='overline' sx={{ color: 'text.secondary' }}>Details</Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Ticket Type */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Ticket Type *</InputLabel>
                <Select
                  name='ticketType'
                  value={formData.ticketType}
                  label='Ticket Type *'
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value='SUPPORT'>Support</MenuItem>
                  <MenuItem value='INSTALLATION'>Installation</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Ticket Status - Converted to Autocomplete */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Autocomplete
                options={ticketStatuses}
                getOptionLabel={option =>
                  getOptionLabel(option, 'ticketStatus')
                }
                value={findOptionById(
                  formData.ticketStatusId as string,
                  ticketStatuses,
                  'ticketStatus'
                )}
                onChange={handleAutocompleteChange('ticketStatusId')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Ticket Status *'
                    size='small'
                    required
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                filterOptions={(options, { inputValue }) =>
                  options.filter(option =>
                    option.name
                      ?.toLowerCase()
                      .includes(inputValue.toLowerCase())
                  )
                }
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
            </Box>

            {isEditMode && formData.ticketId && (
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label='Ticket ID'
                  value={formData.ticketId}
                  size='small'
                  InputProps={{
                    readOnly: true
                  }}
                  helperText='Auto-generated ticket ID'
                />
              </Box>
            )}

            {/* Resolution Status - Converted to Autocomplete */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Autocomplete
                options={resolutionStatuses}
                getOptionLabel={option =>
                  getOptionLabel(option, 'resolutionStatus')
                }
                value={findOptionById(
                  formData.resolutionStatusId as string,
                  resolutionStatuses,
                  'resolutionStatus'
                )}
                onChange={handleAutocompleteChange('resolutionStatusId')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Resolution Status'
                    size='small'
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                filterOptions={(options, { inputValue }) =>
                  options.filter(option =>
                    option.resolutionStatusName
                      ?.toLowerCase()
                      .includes(inputValue.toLowerCase())
                  )
                }
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
            </Box>

            {/* State Selection for filtering support persons and stores */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Autocomplete
                options={[...states].sort((a, b) => a.stateName.localeCompare(b.stateName))}
                getOptionLabel={(option) => option.stateName || ''}
                filterOptions={stateFilterOptions}
                value={states.find(state => state._id === selectedStateId) || null}
                onChange={(_, newValue) => {
                  setSelectedStateId(newValue?._id || '')
                  // Clear support person and store when state changes
                  setFormData(prev => ({
                    ...prev,
                    supportPersonId: '',
                    storeId: ''
                  }))
                }}
                renderInput={(params) => (
                  <TextField {...params} label='State (filters Support Person & Store)' size='small' />
                )}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
            </Box>

            {/* Store - Filtered by selected state */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={
                    selectedStateId
                      ? [...stores].filter(store => getStoreStateId(store) === selectedStateId)
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      : []
                  }
                  getOptionLabel={(option) => getStoreDisplayLabel(option)}
                  filterOptions={storeFilterOptions}
                  value={stores.find(store => store._id === (typeof formData.storeId === 'string' ? formData.storeId : formData.storeId?._id)) || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      storeId: newValue?._id || ''
                    }))
                  }}
                  disabled={!selectedStateId}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label='Store' 
                      size='small'
                      helperText={!selectedStateId ? 'Select state first' : ''}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box>
                        <Typography variant="body1">{option.storeName}</Typography>
                        {(getCityName(option) || getStateName(option)) && (
                          <Typography variant="caption" color="text.secondary">
                            {[getCityName(option), getStateName(option)].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  slotProps={{
                    popper: {
                      sx: { zIndex: dialogZIndex || 1500 }
                    }
                  }}
                />
                <Tooltip title="Add New Store">
                  <IconButton
                    onClick={handleAddStore}
                    size="small"
                    disabled={!selectedStateId}
                    sx={{
                      mt: 0.5,
                      bgcolor: selectedStateId ? 'primary.main' : 'grey.400',
                      color: 'white',
                      '&:hover': { bgcolor: selectedStateId ? 'primary.dark' : 'grey.500' },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Plus size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Support Person - Filtered by selected state, shows city and state */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={
                    selectedStateId
                      ? [...supportPersons]
                          .filter(person => getSupportPersonStateId(person) === selectedStateId)
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      : [...supportPersons].sort((a, b) => 
                          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                        )
                  }
                  getOptionLabel={option => {
                    if (!option) return ''
                    if (typeof option === 'string') {
                      const person = supportPersons.find(p => p._id === option)
                      return person ? getSupportPersonDisplayLabel(person) : ''
                    }
                    return getSupportPersonDisplayLabel(option)
                  }}
                  filterOptions={supportPersonFilterOptions}
                  value={supportPersons.find(p => p._id === (formData.supportPersonId as string)) || null}
                  onChange={handleAutocompleteChange('supportPersonId')}
                  renderInput={params => (
                    <TextField 
                      {...params} 
                      label='Support Person' 
                      size='small'
                      helperText={selectedStateId ? '' : 'Select state to filter'}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box>
                        <Typography variant="body1">{option.supportPersonName}</Typography>
                        {(getSupportPersonCityName(option) || getSupportPersonStateName(option)) && (
                          <Typography variant="caption" color="text.secondary">
                            {[getSupportPersonCityName(option), getSupportPersonStateName(option)].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  slotProps={{
                    popper: {
                      sx: { zIndex: dialogZIndex || 1500 }
                    }
                  }}
                />
                <Tooltip title="Add New Support Person">
                  <IconButton
                    onClick={handleAddSupportPerson}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Plus size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Assigned To - Optional Autocomplete with Add Button */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={[...assignedToList].sort((a, b) => 
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                  )}
                  getOptionLabel={(option) => {
                    if (!option) return ''
                    if (typeof option === 'string') {
                      const found = assignedToList.find(item => item._id === option)
                      return found?.name || ''
                    }
                    return option.name || ''
                  }}
                  value={
                    formData.assignedToId
                      ? assignedToList.find(item => 
                          item._id === (typeof formData.assignedToId === 'object' 
                            ? formData.assignedToId?._id 
                            : formData.assignedToId)
                        ) || null
                      : null
                  }
                  onChange={(_event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      assignedToId: newValue ? newValue._id : null
                    }))
                  }}
                  renderInput={params => (
                    <TextField {...params} label='Assigned To' size='small' />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value?._id
                  }
                  filterOptions={(options, { inputValue }) =>
                    options.filter(option =>
                      option.name
                        ?.toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  }
                  slotProps={{
                    popper: {
                      sx: { zIndex: dialogZIndex || 1500 }
                    }
                  }}
                />
                <Tooltip title="Add New Assigned To">
                  <IconButton
                    onClick={handleAddAssignedTo}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Plus size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Issue Type - Converted to Autocomplete */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Autocomplete
                options={issueTypes}
                getOptionLabel={option => getOptionLabel(option, 'issueType')}
                value={findOptionById(
                  formData.issueTypeId as string,
                  issueTypes,
                  'issueType'
                )}
                onChange={handleAutocompleteChange('issueTypeId')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={`Issue Type ${
                      formData.ticketType === 'SUPPORT' ? '*' : ''
                    }`}
                    size='small'
                    required={formData.ticketType === 'SUPPORT'}
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                filterOptions={(options, { inputValue }) =>
                  options.filter(option =>
                    option.issueTypeName
                      ?.toLowerCase()
                      .includes(inputValue.toLowerCase())
                  )
                }
                slotProps={{
                  popper: {
                    sx: { zIndex: dialogZIndex || 1500 }
                  }
                }}
              />
            </Box>

            {/* Serial Number Input */}
            {/* <Box sx={{ width: { xs: "100%", sm: "48%" } }}>
              <TextField
                fullWidth
                label="Serial Number *"
                value={serialNo}
                onChange={handleSerialNoChange}
                size="small"
                required
                error={
                  serialNoValidation.hasBeenChecked &&
                  !serialNoValidation.isValid &&
                  serialNo !== ""
                }
                color={serialNoValidation.isValid ? "success" : "primary"}
                helperText={
                  serialNoValidation.isChecking
                    ? "Checking availability..."
                    : serialNoValidation.message
                }
                InputProps={{
                  endAdornment: serialNoValidation.isChecking ? (
                    <CircularProgress size={20} />
                  ) : null,
                }}
                disabled={isEditMode && !!ticketData?.stockItemId}
              />
            </Box> */}

            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label='Serial Number (Optional)'
                  value={serialNo}
                  onChange={handleSerialNoChange}
                  size='small'
                  // required
                  error={
                    serialNoValidation.hasBeenChecked &&
                    !serialNoValidation.isValid &&
                    serialNo !== ''
                  }
                  color={serialNoValidation.isValid ? 'success' : 'primary'}
                  helperText={
                    serialNoValidation.isChecking
                      ? 'Checking availability...'
                      : serialNoValidation.message
                  }
                  InputProps={{
                    endAdornment: serialNoValidation.isChecking ? (
                      <CircularProgress size={20} />
                    ) : null
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleManualValidate}
                  disabled={!serialNo.trim() || serialNoValidation.isChecking}
                  sx={{ minWidth: '100px', height: '40px' }}
                >
                  Validate
                </Button>
              </Box>
            </Box>

            {/* Store */}
            {/* <Box sx={{ width: { xs: "100%", sm: "48%" } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="store-label">Store</InputLabel>{" "}

                <Select
                  labelId="store-label"
                  id="storeId"
                  name="storeId"
                  value={
                    typeof formData.storeId === "string"
                      ? formData.storeId
                      : formData.storeId?._id || ""
                  }
                  onChange={handleSelectChange}
                  disabled={isStoreLocked}
                  readOnly={true}
                  label="Store"
                  // Remove required attribute
                >
                  <MenuItem value="">
                    <em>Select a store (optional)</em>{" "}

                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store._id} value={store._id}>
                      {store.storeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box> */}

            {isStoreLocked && formData.storeDetails && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Card
                  variant='outlined'
                  sx={{ bgcolor: 'success.light', color: 'white' }}
                >
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Store Details
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Name:</strong> {formData.storeDetails.storeName}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Address:</strong>{' '}
                      {formData.storeDetails.storeAddress},{' '}
                      {formData.storeDetails.storeCity}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Manager:</strong> {formData.storeDetails.smName} (
                      {formData.storeDetails.smContactNo})
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            {/* Call ID */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                label='Call ID *'
                name='callId'
                value={formData.callId}
                onChange={handleInputChange}
                size='small'
                required
              />
            </Box>

            {/* Opening Date */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                <DatePicker
                  label='Opening Date *'
                  value={toDate(formData.openingDate)}
                  onChange={handleDateChange('openingDate')}
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

            {/* Call ID Date */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                <DatePicker
                  label='Call ID Date *'
                  value={toDate(formData.callIdDate)}
                  onChange={handleDateChange('callIdDate')}
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
            {/* Resolution Date */}
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                
                <DatePicker
                  label='Resolution Date'
                  value={toDate(formData.resolutionDate)}
                  onChange={handleDateChange('resolutionDate')}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                size='small'
                label='Rating'
                name='rating'
                value={formData.rating}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                type='number'
                inputProps={{
                  min: 0,
                  max: 5,
                  step: 0.1
                }}
              />
            </Box>

            {/* Notes - Optional */}
            <Box sx={{ width: '100%' }}>
              <TextField
                size='small'
                label='Notes (Optional)'
                name='notes'
                value={formData.notes || ''}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                multiline
                rows={3}
                placeholder='Add any additional notes or remarks about this ticket...'
              />
            </Box>

            {/* Active Status */}
            {/* <Box sx={{ width: "100%" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Active Ticket"
              />
            </Box> */}
          </Box>
        </Paper>

        {/* Images Section */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='overline' sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Pictures
          </Typography>

          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant='determinate' value={uploadProgress} />
              <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                Uploading images... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Upload Button */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant='outlined'
              component='label'
              startIcon={<AddPhotoAlternate />}
              disabled={isUploading}
            >
              Select Images
              <input
                type='file'
                hidden
                multiple
                accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                onChange={handleImageSelect}
              />
            </Button>

            {uploadedImages.length > 0 && (
              <Typography variant='caption' color='textSecondary'>
                {uploadedImages.filter(img => !img.uploaded).length} image(s)
                ready to upload
              </Typography>
            )}
          </Box>

          {/* Existing Images Display (for edit mode) */}
          {isEditMode && existingImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                Existing Images ({existingImages.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {existingImages.map((image, index) => (
                  <Box key={image.key} sx={{ position: 'relative' }}>
                    {image.loading ? (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'action.hover'
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    ) : image.url ? (
                      <>
                        <Box
                          component='img'
                          src={image.url}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}
                          alt={`Existing image ${index + 1}`}
                        />
                        {/* Delete Button for Existing Images */}
                        <IconButton
                          size='small'
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            backgroundColor: 'white',
                            '&:hover': { backgroundColor: 'grey.100' }
                          }}
                          onClick={() => handleExistingImageRemove(index)}
                        >
                          <Delete fontSize='small' />
                        </IconButton>
                      </>
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'action.hover'
                        }}
                      >
                        <Typography
                          variant='caption'
                          color='error'
                          textAlign='center'
                        >
                          Failed to load
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* New Images Display */}
          {uploadedImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                {isEditMode ? 'New Images' : 'Selected Images'} (
                {uploadedImages.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {uploadedImages.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      component='img'
                      src={image.preview}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        opacity: image.uploading ? 0.6 : 1
                      }}
                      alt={`New image ${index + 1}`}
                    />

                    {/* Upload Status */}
                    {image.uploading && (
                      <Box
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
                          borderRadius: 1
                        }}
                      >
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      </Box>
                    )}

                    {/* Upload Success Indicator */}
                    {image.uploaded && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 5,
                          left: 5,
                          backgroundColor: 'success.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12
                        }}
                      >
                        ✓
                      </Box>
                    )}

                    {/* Delete Button for New Images */}
                    <IconButton
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: 'grey.100' }
                      }}
                      onClick={() => handleImageRemove(index)}
                      disabled={image.uploading}
                    >
                      <Delete fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Instructions for edit mode */}
          {/* {isEditMode && (existingImages.length > 0 || uploadedImages.length > 0) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                💡 In edit mode: Delete existing images or add new ones, then click "Update Ticket" to save changes.
              </Typography>
            </Box>
          )} */}

          {/* Images will be uploaded automatically when creating/updating ticket */}
          {uploadedImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='caption'
                color='textSecondary'
                sx={{ fontStyle: 'italic' }}
              >
                💡 Images will be uploaded automatically when you create/update
                the ticket
              </Typography>
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
              ? 'Update Ticket'
              : 'Create Ticket'}
          </Button>
        </Box>
      </Box>

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
