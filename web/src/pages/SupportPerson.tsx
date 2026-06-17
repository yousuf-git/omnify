// import { useEffect, useState, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
//   Snackbar,
//   Button,
//   Chip,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
// } from "@mui/material";
// import { Edit, Plus, Trash2, Filter, ArrowUp, ArrowDown } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import type { FilterSupportPerson, SupportPerson, Agency, Ticket } from "../api/types";
// import { EditItemDialog } from "../components/common/EditItemDialog";
// import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
// import { deleteResource, getResources, updateResource } from "../api/api";
// import { DynamicTable } from "../components/common/table";
// import { GenericFilterPanel } from "../components/filter/StockInCategoryFilterPanel";
// import { SupportPersonImportExportButtons } from "../components/common/SupportPersonImportExportButtons";
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import { useAuth } from "../contexts/AuthContext";


// export default function SupportPersonPage() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [supportPerson, setSupportPerson] = useState<SupportPerson[] | null>(null);
//   const [showInactive, setShowInactive] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filters, setFilters] = useState<FilterSupportPerson>({
//     search: "",
//     supportPersonName: "",
//     supportPersonNumber: "",
//     cityId: "",
//     stateId: "",
   
//     agencyId: "",
//     agencyName: "",
//     updatedAt: "",
//     createdAt: "",
    
//   });
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [agency, setAgency] = useState<Agency[]>([]);
//   const [cities, setCities] = useState<any[]>([]);
//   const [states, setStates] = useState<any[]>([]);
//   const [agencies, setAgencies] = useState<Agency[]>([]);
  
//   const [editDialog, setEditDialog] = useState<{
//     open: boolean;
//     item: SupportPerson | null;
//   }>({ open: false, item: null });
//   const [deleteDialog, setDeleteDialog] = useState<{
//     open: boolean;
//     item: SupportPerson | null;
//     loading: boolean;
//     deleteType?: 'soft' | 'hard'; // Add this
//   }>({ open: false, item: null, loading: false });
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "error";
//   }>({ open: false, message: "", severity: "success" });

//   const loadTickets = async () => {
//   try {
//     const ticketsResponse = await getResources("/ticket?populate=true");
//     setTickets(Array.isArray(ticketsResponse) ? ticketsResponse : []);
//   } catch (err) {
//     console.error("Error loading tickets:", err);
//     setTickets([]);
//   }
// };

// // useEffect mein tickets bhi load karein
// useEffect(() => {
//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadSupportPerson(),
//         loadTickets(),
//         fetchDropdownData()
//       ]);
//     } catch (err) {
//       console.error("Error loading data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   fetchAllData();
// }, [showInactive]);


//   // Fetch agencies, cities, and states for dropdowns
//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         // Fetch agencies
//         const agenciesData = await getResources("/agency?showInactive=true");
//         setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        
//         // Fetch cities
//         const citiesData = await getResources("/cities?showInactive=true");
//         setCities(Array.isArray(citiesData) ? citiesData : []);
        
//         // Fetch states
//         const statesData = await getResources("/states?showInactive=true");
//         setStates(Array.isArray(statesData) ? statesData : []);
//       } catch (err) {
//         console.error("Error fetching dropdown data:", err);
//       }
//     };
    
//     fetchDropdownData();
//   }, []);

//   const columns: TableColumn<SupportPerson>[] = [
//     { id: "supportPersonId", label: "Support Person Id" },
//     { id: "supportPersonName", label: "Support Person Name" },
//     { id: "supportPersonNumber", label: "Support Person Number" },
//     {
//       id: "agencyId",
//       label: "Agency Name",
//       format: (_value, row) => (
//         <span>
//           {typeof row.agencyId === "object" && row.agencyId !== null
//             ? (row.agencyId as any).agencyName
//             : "N/A"}
//         </span>)
//     },
//     {
//       id: "cityId",
//       label: "City",
//       format: (_value, row) => (
//         <span>
//           {typeof row.cityId === "object" && row.cityId !== null
//             ? (row.cityId as any).cityName
//             : "N/A"}
//         </span>
//       ),
//     },
//       // ✅ YEH NAYA COLUMN ADD KAREIN - Average Rating
//   {
//     id: "averageRating",
//     label: "Average Rating",
//     format: (_value, row) => {
//       // Support person ki rating calculate karein
//       const supportPersonTickets = tickets.filter(ticket => {
//         const ticketSupportPersonId = typeof ticket.supportPersonId === "object" 
//           ? (ticket.supportPersonId as any)?._id 
//           : ticket.supportPersonId;
        
//         const rowSupportPersonId = row._id;
        
//         return ticketSupportPersonId === rowSupportPersonId && ticket.rating;
//       });
      
//       if (supportPersonTickets.length === 0) {
//         return <Chip label="No ratings" size="small" color="default" variant="outlined" />;
//       }
      
//       const totalRating = supportPersonTickets.reduce((sum, ticket) => sum + (ticket.rating || 0), 0);
//       const averageRating = totalRating / supportPersonTickets.length;
//       const roundedRating = Math.round(averageRating * 10) / 10; // 1 decimal point
      
//       return (
//         <Box display="flex" alignItems="center" gap={1}>
//           <Typography variant="body2" fontWeight="medium">
//             {roundedRating}/5
//           </Typography>
//           <Chip 
//             label={`${supportPersonTickets.length} tickets`} 
//             size="small" 
//             color="primary" 
//             variant="outlined" 
//           />
//         </Box>
//       );
//     },
//   },
//     {
//       id: "stateId",
//       label: "State",
//       format: (_value, row) => (
//         <span>
//           {typeof row.stateId === "object" && row.stateId !== null
//             ? (row.stateId as any).stateName
//             : "N/A"}
//         </span>
//       ),
//     },
   
//     {
//       id: "status",
//       label: "Status",
//       format: (_value, row) => (
//         <Chip
//           label={row.isActive ? "Active" : "Inactive"}
//           color={row.isActive ? "success" : "error"}
//           size="small"
//         />
//       ),
//     },
//     {
//       id: "updatedAt",
//       label: "Updated At",
//       format: (value) => new Date(value).toLocaleDateString('en-GB'),
//     },
//     {
//       id: "createdAt",
//       label: "Created At",
//       format: (value) => new Date(value).toLocaleDateString('en-GB'),
//     },
//   ];

//   const loadSupportPerson = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getResources(
//         `/support-person?showInactive=${showInactive}&populate=true`
//       );
//       setSupportPerson(Array.isArray(response) ? response : []);
//     } catch (err:any) {
//       console.error("Error loading Support Person:", err);
//       showSnackbar(`Error: ${err.message}`, "error");
//       setError(err instanceof Error ? err.message : "Failed to load Support Person ");
//       setSupportPerson([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSupportPerson();
//   }, [showInactive]);

//   const filteredItems = useMemo(() => {
//     const safeItems = supportPerson || [];
    
//     // Apply filters
//     let filtered = safeItems.filter((item) => {
//       // Handle populated objects for search and filtering
//       const cityName = typeof item.cityId === 'object' && item.cityId !== null 
//         ? (item.cityId as any).cityName || ""
//         : "";
          
//     const stateName = typeof item.stateId === 'object' && item.stateId !== null 
//       ? (item.stateId as any).stateName || ""
//       : "";

//       const agencyName = typeof item.agencyId === 'object' && item.agencyId !== null 
//         ? (item.agencyId as any).agencyName || ""
//         : "";

//       const supportPersonName = item.supportPersonName || "";
//       const supportPersonNumber = item.supportPersonNumber || "";
      
//       const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";

//       // Extract IDs for filtering (handle both string IDs and populated objects)
//       const itemCityId = typeof item.cityId === 'object' && item.cityId !== null 
//         ? (item.cityId as any)._id 
//         : item.cityId;
      
//       const itemStateId = typeof item.stateId === 'object' && item.stateId !== null 
//         ? (item.stateId as any)._id 
//         : item.stateId;
      
//       const itemAgencyId = typeof item.agencyId === 'object' && item.agencyId !== null 
//         ? (item.agencyId as any)._id 
//         : item.agencyId;

//       const matchesSearch =
//         !filters.search ||
//         supportPersonName.toLowerCase().includes(filters.search.toLowerCase()) ||
//         supportPersonNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
//         cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
//         stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
//         agencyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        
//         createdAt.toLowerCase().includes(filters.search.toLowerCase());

//       const matchesSupportPersonName =
//         !filters.supportPersonName ||
//         supportPersonName.toLowerCase().includes(filters.supportPersonName.toLowerCase());

//       const matchesSupportPersonNumber =
//         !filters.supportPersonNumber ||
//         supportPersonNumber.toLowerCase().includes(filters.supportPersonNumber.toLowerCase());

//       const matchesCity = 
//         !filters.cityId || 
//         itemCityId === filters.cityId;

//       const matchesState = 
//         !filters.stateId || 
//         itemStateId === filters.stateId;



//       const matchesAgency =
//         !filters.agencyId || 
//         itemAgencyId === filters.agencyId;

//       const matchesAgencyName =
//         !filters.agencyName ||
//         agencyName.toLowerCase().includes(filters.agencyName.toLowerCase());

//       const matchesCreatedAt =
//         !filters.createdAt || 
//         createdAt.toLowerCase().includes(filters.createdAt.toLowerCase());

//       return (
//         matchesSearch &&
//         matchesSupportPersonName &&
//         matchesSupportPersonNumber &&
//         matchesCity &&
//         matchesState &&
       
//         matchesAgency &&
//         matchesAgencyName &&
//         matchesCreatedAt
//       );
//     });

  

//     return filtered;
//   }, [supportPerson, filters]);

//   // Add this function to render the filter dropdowns
//   const renderFilterDropdowns = () => (
//     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
//       <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
//         <Filter size={18} style={{ marginRight: '8px' }} />
//         Filters
//       </Typography>
      
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
//         <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//           {/* Agency Filter */}
//           <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
//             <InputLabel>Agency</InputLabel>
//             <Select
//               value={filters.agencyId || ''}
//               label="Agency"
//               onChange={(e) => setFilters({ ...filters, agencyId: e.target.value })}
//             >
//               <MenuItem value="">All Agencies</MenuItem>
//               {agencies.map((agency) => (
//                 <MenuItem key={agency._id} value={agency._id}>
//                   {agency.agencyName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* City Filter */}
//           <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
//             <InputLabel>City</InputLabel>
//             <Select
//               value={filters.cityId || ''}
//               label="City"
//               onChange={(e) => setFilters({ ...filters, cityId: e.target.value })}
//             >
//               <MenuItem value="">All Cities</MenuItem>
//               {cities.map((city) => (
//                 <MenuItem key={city._id} value={city._id}>
//                   {city.cityName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* State Filter */}
//           <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
//             <InputLabel>State</InputLabel>
//             <Select
//               value={filters.stateId || ''}
//               label="State"
//               onChange={(e) => setFilters({ ...filters, stateId: e.target.value })}
//             >
//               <MenuItem value="">All States</MenuItem>
//               {states.map((state) => (
//                 <MenuItem key={state._id} value={state._id}>
//                   {state.stateName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>


//       </Box>
//     </Box>
//   );

//   const handleEdit = (item: SupportPerson) => {
//     setEditDialog({ open: true, item });
//   };

//   // const handleDelete = (item: SupportPerson) => {
//   //   setDeleteDialog({ open: true, item, loading: false });
//   // };

//   // const confirmDelete = async () => {
//   //   if (!deleteDialog.item) return;

//   //   setDeleteDialog((prev) => ({ ...prev, loading: true }));

//   //   try {
//   //     const item = deleteDialog.item;
      
//   //     let agencyIdValue: string;
//   //     if (typeof item.agencyId === 'object' && item.agencyId !== null && '_id' in item.agencyId) {
//   //       agencyIdValue = (item.agencyId as any)._id;
//   //     } else {
//   //       agencyIdValue = item.agencyId as string;
//   //     }

//   //     let cityIdValue: string;
//   //     if (typeof item.cityId === 'object' && item.cityId !== null && '_id' in item.cityId) {
//   //       cityIdValue = (item.cityId as any)._id;
//   //     } else {
//   //       cityIdValue = item.cityId as string;
//   //     }

//   //     let stateIdValue: string;
//   //     if (typeof item.stateId === 'object' && item.stateId !== null && '_id' in item.stateId) {
//   //       stateIdValue = (item.stateId as any)._id;
//   //     } else {
//   //       stateIdValue = item.stateId as string;
//   //     }

//   //     const updatedSupportPerson = await updateResource(
//   //       "/support-person",
//   //       item._id as string,
//   //       {
//   //         agencyId: agencyIdValue,
//   //         supportPersonName: item.supportPersonName,
//   //         supportPersonNumber: item.supportPersonNumber,
//   //         cityId: cityIdValue,
//   //         stateId: stateIdValue,
//   //         rating: item.rating,
//   //         isActive: !item.isActive
//   //       }
//   //     );

//   //     setSupportPerson((prev: SupportPerson[] | null) => {
//   //       if (!prev) return [];
//   //       return prev.map((supportPersonItem) =>
//   //         supportPersonItem._id === item._id
//   //           ? { ...supportPersonItem, isActive: updatedSupportPerson.isActive }
//   //           : supportPersonItem
//   //       );
//   //     });

//   //     showSnackbar(
//   //       `Support Person ${updatedSupportPerson.isActive ? "enabled" : "disabled"} successfully`,
//   //       "success"
//   //     );
//   //     setDeleteDialog({ open: false, item: null, loading: false });
//   //   } catch (error) {
//   //     console.error("Error toggling Support Person status:", error);
//   //     showSnackbar(
//   //       `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} Support Person`,
//   //       "error"
//   //     );
//   //     setDeleteDialog((prev) => ({ ...prev, loading: false }));
//   //   }
//   // };


//     const handleSoftDelete = (item: SupportPerson) => {
//     setDeleteDialog({ 
//       open: true, 
//       item, 
//       loading: false,
//       deleteType: 'soft'
//     });
//   };

//   // Hard Delete handler
//   const handleHardDelete = (item: SupportPerson) => {
//     if (!user || !['admin', 'manager'].includes(user.role)) {
//       showSnackbar("You don't have permission to permanently delete Support Person", "error");
//       return;
//     }
//     setDeleteDialog({ 
//       open: true, 
//       item, 
//       loading: false,
//       deleteType: 'hard'
//     });
//   };

//   const confirmDelete = async () => {
//     if (!deleteDialog.item) return;

//     setDeleteDialog((prev) => ({ ...prev, loading: true }));

//     try {
//       if (deleteDialog.deleteType === 'hard') {
//         // Hard delete - permanent removal
//         await deleteResource("/support-person", `${deleteDialog.item._id}/hard-delete`);
        
//         setSupportPerson((prev: SupportPerson[] | null) => {
//           if (!prev) return [];
//           return prev.filter((item) => item._id !== deleteDialog.item!._id);
//         });

//         showSnackbar("Support Person permanently deleted successfully", "success");
//       } else {
//         // Soft delete - toggle active status
//         const item = deleteDialog.item;
        
//         let agencyIdValue: string;
//         if (typeof item.agencyId === 'object' && item.agencyId !== null && '_id' in item.agencyId) {
//           agencyIdValue = (item.agencyId as any)._id;
//         } else {
//           agencyIdValue = item.agencyId as string;
//         }

//         let cityIdValue: string;
//         if (typeof item.cityId === 'object' && item.cityId !== null && '_id' in item.cityId) {
//           cityIdValue = (item.cityId as any)._id;
//         } else {
//           cityIdValue = item.cityId as string;
//         }

//         let stateIdValue: string;
//         if (typeof item.stateId === 'object' && item.stateId !== null && '_id' in item.stateId) {
//           stateIdValue = (item.stateId as any)._id;
//         } else {
//           stateIdValue = item.stateId as string;
//         }

//         const updatedSupportPerson = await updateResource(
//           "/support-person",
//           item._id as string,
//           {
//             agencyId: agencyIdValue,
//             supportPersonName: item.supportPersonName,
//             supportPersonNumber: item.supportPersonNumber,
//             cityId: cityIdValue,
//             stateId: stateIdValue,
          
//             isActive: !item.isActive
//           }
//         );

//         setSupportPerson((prev: SupportPerson[] | null) => {
//           if (!prev) return [];
//           return prev.map((supportPersonItem) =>
//             supportPersonItem._id === item._id
//               ? { ...supportPersonItem, isActive: updatedSupportPerson.isActive }
//               : supportPersonItem
//           );
//         });

//         showSnackbar(
//           `Support Person ${updatedSupportPerson.isActive ? "enabled" : "disabled"} successfully`,
//           "success"
//         );
//       }

//       setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
//     } catch (error) {
//       console.error("Error deleting Support Person:", error);
//       showSnackbar(
//         deleteDialog.deleteType === 'hard' 
//           ? "Failed to delete Support Person permanently" 
//           : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} Support Person`,
//         "error"
//       );
//       setDeleteDialog((prev) => ({ ...prev, loading: false }));
//     }
//   };

//   const showSnackbar = (message: string, severity: "success" | "error") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar((prev) => ({ ...prev, open: false }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       search: "",
//       supportPersonName: "",
//       supportPersonNumber: "",
//       cityId: "",
//       stateId: "",
//       agencyId: "",
//       agencyName: "",
//       createdAt: "",
//     });
//   };

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="400px"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }

//   if (supportPerson === null) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="warning">No Support Person data available</Alert>
//       </Box>
//     );
//   }

//   const tableActions: TableAction<SupportPerson>[] = [
//     { 
//       icon: <Edit size={16} />, 
//       tooltip: "Edit city", 
//       color: "primary", 
//       onClick: handleEdit 
//     },
//     {
//       icon: <VisibilityOffIcon sx={{ fontSize: 16 }} />,
//       tooltip: "Toggle City Status",
//       color: "warning",
//       onClick: handleSoftDelete,
//     },
//   ];

//   // ✅ YEH LINE ADD KARNA THA - if statement ke liye closing bracket
//   if (user && ['admin', 'manager'].includes(user.role)) {
//     tableActions.push({
//       icon: <Trash2 size={16} />,
//       tooltip: "Delete city",
//       color: "error",
//       onClick: handleHardDelete,
//     });
//   }

//   return (
//     <Box
//       sx={{ p: 3 }}
//       className="flex flex-col mb-14 transition-all duration-900 ease-in-out"
//     >
//       {/* Header */}
//       <Box sx={{ mb: 2 }}>
//         <Typography
//           variant="h4"
//           sx={{ fontSize: "1.5rem" }}
//           fontWeight="bold"
//           gutterBottom
//         >
//           Support Person Management
//         </Typography>
//         <Typography
//           variant="body1"
//           sx={{ fontSize: "0.875rem", mt: -1.2 }}
//           color="text.secondary"
//         >
//           Manage your inventory Support Person and stock levels
//         </Typography>
//       </Box>

//       {/* Actions Bar */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//           flexWrap: "wrap",
//           gap: 2,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontSize: "1rem" }} fontWeight="medium">
//           Support Person ({filteredItems.length})
//         </Typography>
//         <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//           <SupportPersonImportExportButtons
//             items={filteredItems}
//             onImportComplete={() => {
//               loadSupportPerson(); // Refresh data after import
//               // Clear reference cache for next import
//               // import('../../services/referenceResolutionService')
//               //   .then(module => module.ReferenceResolutionService.clearCache())
//               //   .catch(console.error);
//             }}
//             isLoading={loading}
//           />
//           <Button
//             variant="outlined"
//             onClick={() => setShowInactive(!showInactive)}
//             color={showInactive ? "primary" : "inherit"}
//           >
//             <span className="text-[0.875rem]">
//               {showInactive ? "Hide Inactive" : "Show Inactive"}
//             </span>
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<Plus size={16} />}
//             onClick={() => navigate("/SupportPersonForm")}
//             sx={{ fontSize: 12, py: 1 }}
//           >
//             <span className="hidden md:block">Add Support Person</span>
//           </Button>
//         </Box>
//       </Box>

//       {/* Filter Dropdowns */}
//       {renderFilterDropdowns()}

//       <GenericFilterPanel
//         filters={filters}
//         onFiltersChange={setFilters}
//         onClearFilters={clearFilters}
//       />

//       {/* Table */}
//       <DynamicTable
//         data={filteredItems || []}
//         columns={columns}
       
// actions={tableActions}
//       />

//       {/* Edit Dialog */}
//       <EditItemDialog
//         open={editDialog.open}
//         onClose={() => setEditDialog({ open: false, item: null })}
//         type="supportPerson"
//         item={editDialog.item}
//         onSuccess={loadSupportPerson}
//       />

//      {/* Delete Confirmation Dialog */}
//       <ConfirmationDialog
//         open={deleteDialog.open}
//         onClose={() =>
//           setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined })
//         }
//         onConfirm={confirmDelete}
//         isLoading={deleteDialog.loading}
//         config={{
//           title: deleteDialog.deleteType === 'hard' 
//             ? "Permanently Delete Support Person" 
//             : deleteDialog.item?.isActive ? "Disable Support Person" : "Enable Support Person",
//           description: deleteDialog.deleteType === 'hard'
//             ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
//             : deleteDialog.item?.isActive
//               ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
//               : "Are you sure you want to enable {itemName}?",
//           variables: { itemName: deleteDialog.item?.supportPersonName || "" },
//           confirmText: deleteDialog.deleteType === 'hard' 
//             ? "Delete Permanently" 
//             : deleteDialog.item?.isActive ? "Disable" : "Enable",
//           loadingText: deleteDialog.deleteType === 'hard'
//             ? "Deleting..."
//             : deleteDialog.item?.isActive ? "Disabling..." : "Enabling...",
//         }}
//         severity={deleteDialog.deleteType === 'hard' || deleteDialog.item?.isActive ? "error" : "success"}
//         actionVariant={deleteDialog.deleteType === 'hard' ? "delete" : "update"}
//       />


//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }


import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Plus, Trash2, Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FilterSupportPerson, SupportPerson, Agency, Ticket } from "../api/types";
import { EditItemDialog } from "../components/common/EditItemDialog";
import { ConfirmationDialog } from "../components/common/DeleteConfirmDialog";
import { deleteResource, getResources, updateResource } from "../api/api";
import { SupportPersonList } from "../components/common/SupportPersonList";
import { SupportPersonImportExportButtons } from "../components/common/SupportPersonImportExportButtons";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../contexts/AuthContext";

// Module-level 5-min cache for tickets (used only to average support-person ratings).
let _ticketsCache: { at: number; data: any[] } | null = null;

export default function SupportPersonPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supportPerson, setSupportPerson] = useState<SupportPerson[] | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSupportPerson>({
    search: "",
    supportPersonName: "",
    supportPersonNumber: "",
    cityId: "",
    stateId: "",
    agencyId: "",
    agencyName: "",
    updatedAt: "",
    createdAt: "",
  });
  const [agency, setAgency] = useState<Agency[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: SupportPerson | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: SupportPerson | null;
    loading: boolean;
    deleteType?: 'soft' | 'hard';
  }>({ open: false, item: null, loading: false });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch agencies, cities, and states for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch agencies
        const agenciesData = await getResources("/agency?showInactive=true");
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        
        // Fetch cities
        const citiesData = await getResources("/cities?showInactive=true");
        setCities(Array.isArray(citiesData) ? citiesData : []);
        
        // Fetch states
        const statesData = await getResources("/states?showInactive=true");
        setStates(Array.isArray(statesData) ? statesData : []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    
    fetchDropdownData();
  }, []);

  const loadSupportPerson = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources(
        `/support-person?showInactive=${showInactive}&populate=true`
      );
      setSupportPerson(Array.isArray(response) ? response : []);
    } catch (err:any) {
      console.error("Error loading Support Person:", err);
      showSnackbar(`Error: ${err.message}`, "error");
      setError(err instanceof Error ? err.message : "Failed to load Support Person ");
      setSupportPerson([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      // Cache tickets for 5 min so revisiting this page doesn't refetch them
      // (only needed here to average each support person's ratings).
      const now = Date.now();
      if (_ticketsCache && now - _ticketsCache.at < 5 * 60 * 1000) {
        setTickets(_ticketsCache.data);
        return;
      }
      const ticketsResponse = await getResources("/ticket?populate=true");
      const data = Array.isArray(ticketsResponse) ? ticketsResponse : [];
      _ticketsCache = { at: now, data };
      setTickets(data);
    } catch (err) {
      console.error("Error loading tickets:", err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadSupportPerson(),
          loadTickets()
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [showInactive]);

  // Optimized version - pehle se hi calculate kar lein
  const supportPersonsWithRatings = useMemo(() => {
    if (!supportPerson || !tickets) return [];
    
    return supportPerson.map(person => {
      // Us support person ke saare tickets find karein
      const personTickets = tickets.filter(ticket => {
        const ticketSupportPersonId = typeof ticket.supportPersonId === "object" 
          ? (ticket.supportPersonId as any)?._id 
          : ticket.supportPersonId;
        
        return ticketSupportPersonId === person._id && ticket.rating;
      });
      
      let averageRating = 0;
      if (personTickets.length > 0) {
        const totalRating = personTickets.reduce((sum, ticket) => sum + (ticket.rating || 0), 0);
        averageRating = totalRating / personTickets.length;
      }
      
      return {
        ...person,
        averageRating: Math.round(averageRating * 10) / 10,
        ticketCount: personTickets.length
      };
    });
  }, [supportPerson, tickets]);


  const filteredItems = useMemo(() => {
    const safeItems = supportPersonsWithRatings || [];
    
    // Apply filters
    let filtered = safeItems.filter((item) => {
      // Handle populated objects for search and filtering
      const cityName = typeof item.cityId === 'object' && item.cityId !== null 
        ? (item.cityId as any).cityName || ""
        : "";
          
      const stateName = typeof item.stateId === 'object' && item.stateId !== null 
        ? (item.stateId as any).stateName || ""
        : "";

      const agencyName = typeof item.agencyId === 'object' && item.agencyId !== null 
        ? (item.agencyId as any).agencyName || ""
        : "";

      const supportPersonName = item.supportPersonName || "";
      const supportPersonNumber = item.supportPersonNumber || "";
      
      const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";

      // Extract IDs for filtering (handle both string IDs and populated objects)
      const itemCityId = typeof item.cityId === 'object' && item.cityId !== null 
        ? (item.cityId as any)._id 
        : item.cityId;
      
      const itemStateId = typeof item.stateId === 'object' && item.stateId !== null 
        ? (item.stateId as any)._id 
        : item.stateId;
      
      const itemAgencyId = typeof item.agencyId === 'object' && item.agencyId !== null 
        ? (item.agencyId as any)._id 
        : item.agencyId;

      const matchesSearch =
        !filters.search ||
        supportPersonName.toLowerCase().includes(filters.search.toLowerCase()) ||
        supportPersonNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
        stateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        agencyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        createdAt.toLowerCase().includes(filters.search.toLowerCase());

      const matchesSupportPersonName =
        !filters.supportPersonName ||
        supportPersonName.toLowerCase().includes(filters.supportPersonName.toLowerCase());

      const matchesSupportPersonNumber =
        !filters.supportPersonNumber ||
        supportPersonNumber.toLowerCase().includes(filters.supportPersonNumber.toLowerCase());

      const matchesCity = 
        !filters.cityId || 
        itemCityId === filters.cityId;

      const matchesState = 
        !filters.stateId || 
        itemStateId === filters.stateId;

      const matchesAgency =
        !filters.agencyId || 
        itemAgencyId === filters.agencyId;

      const matchesAgencyName =
        !filters.agencyName ||
        agencyName.toLowerCase().includes(filters.agencyName.toLowerCase());

      const matchesCreatedAt =
        !filters.createdAt || 
        createdAt.toLowerCase().includes(filters.createdAt.toLowerCase());

      return (
        matchesSearch &&
        matchesSupportPersonName &&
        matchesSupportPersonNumber &&
        matchesCity &&
        matchesState &&
        matchesAgency &&
        matchesAgencyName &&
        matchesCreatedAt
      );
    });

    return filtered;
  }, [supportPersonsWithRatings, filters]);

  // Active filters, excluding the search box (which lives in the page header).
  const activeFilterCount = [filters.agencyId, filters.cityId, filters.stateId].filter(Boolean).length;

  // Collapsible filter panel matching the standard
  const renderFilterDropdowns = () => (
    <Card sx={{ mb: 2.5, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 1.25, cursor: "pointer",
          borderBottom: filtersOpen ? "1px solid" : "none", borderColor: "divider",
        }}
        onClick={() => setFiltersOpen((o) => !o)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filters</Typography>
          {activeFilterCount > 0 && (
            <Box sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 999, bgcolor: "primary.main", color: "#fff", fontSize: "0.65rem", fontWeight: 700, display: "grid", placeItems: "center" }}>
              {activeFilterCount}
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          {activeFilterCount > 0 && (
            <Button size="small" variant="text" startIcon={<X size={14} />} onClick={clearFilters}>
              Clear
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="toggle filters"
            sx={{ color: filtersOpen ? "primary.main" : "text.secondary", bgcolor: filtersOpen ? "action.selected" : "transparent" }}
          >
            <SlidersHorizontal size={17} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={filtersOpen} timeout={260}>
        <Box
          sx={{
            p: 2,
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          }}
        >
          {/* Agency Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Agency</InputLabel>
            <Select
              value={filters.agencyId || ''}
              label="Agency"
              onChange={(e) => setFilters({ ...filters, agencyId: e.target.value })}
            >
              <MenuItem value="">All Agencies</MenuItem>
              {agencies.map((agency) => (
                <MenuItem key={agency._id} value={agency._id}>
                  {agency.agencyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* City Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              value={filters.cityId || ''}
              label="City"
              onChange={(e) => setFilters({ ...filters, cityId: e.target.value })}
            >
              <MenuItem value="">All Cities</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city._id} value={city._id}>
                  {city.cityName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* State Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={filters.stateId || ''}
              label="State"
              onChange={(e) => setFilters({ ...filters, stateId: e.target.value })}
            >
              <MenuItem value="">All States</MenuItem>
              {states.map((state) => (
                <MenuItem key={state._id} value={state._id}>
                  {state.stateName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Card>
  );

  // ---- lookup maps for name resolution in the card list ----
  const mapBy = (rows: any[]) => new Map(rows.map((r) => [r._id, r]));
  const agencyMap = useMemo(() => mapBy(agencies), [agencies]);
  const cityMap = useMemo(() => mapBy(cities), [cities]);
  const stateMap = useMemo(() => mapBy(states), [states]);
  // personId -> { avg, count } from their rated tickets (computed above).
  const ratingMap = useMemo(() => {
    const m = new Map<string, { avg: number; count: number }>();
    for (const p of supportPersonsWithRatings) {
      m.set(String(p._id), { avg: (p as any).averageRating || 0, count: (p as any).ticketCount || 0 });
    }
    return m;
  }, [supportPersonsWithRatings]);

  const handleEdit = (item: SupportPerson) => {
    setEditDialog({ open: true, item });
  };

  const handleSoftDelete = (item: SupportPerson) => {
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false,
      deleteType: 'soft'
    });
  };

  // Hard Delete handler
  const handleHardDelete = (item: SupportPerson) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      showSnackbar("You don't have permission to permanently delete Support Person", "error");
      return;
    }
    setDeleteDialog({ 
      open: true, 
      item, 
      loading: false,
      deleteType: 'hard'
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteDialog.deleteType === 'hard') {
        // Hard delete - permanent removal
        await deleteResource("/support-person", `${deleteDialog.item._id}/hard-delete`);
        
        setSupportPerson((prev: SupportPerson[] | null) => {
          if (!prev) return [];
          return prev.filter((item) => item._id !== deleteDialog.item!._id);
        });

        showSnackbar("Support Person permanently deleted successfully", "success");
      } else {
        // Soft delete - toggle active status
        const item = deleteDialog.item;
        
        let agencyIdValue: string;
        if (typeof item.agencyId === 'object' && item.agencyId !== null && '_id' in item.agencyId) {
          agencyIdValue = (item.agencyId as any)._id;
        } else {
          agencyIdValue = item.agencyId as string;
        }

        let cityIdValue: string;
        if (typeof item.cityId === 'object' && item.cityId !== null && '_id' in item.cityId) {
          cityIdValue = (item.cityId as any)._id;
        } else {
          cityIdValue = item.cityId as string;
        }

        let stateIdValue: string;
        if (typeof item.stateId === 'object' && item.stateId !== null && '_id' in item.stateId) {
          stateIdValue = (item.stateId as any)._id;
        } else {
          stateIdValue = item.stateId as string;
        }

        const updatedSupportPerson = await updateResource(
          "/support-person",
          item._id as string,
          {
            agencyId: agencyIdValue,
            supportPersonName: item.supportPersonName,
            supportPersonNumber: item.supportPersonNumber,
            cityId: cityIdValue,
            stateId: stateIdValue,
            isActive: !item.isActive
          }
        );

        setSupportPerson((prev: SupportPerson[] | null) => {
          if (!prev) return [];
          return prev.map((supportPersonItem) =>
            supportPersonItem._id === item._id
              ? { ...supportPersonItem, isActive: updatedSupportPerson.isActive }
              : supportPersonItem
          );
        });

        showSnackbar(
          `Support Person ${updatedSupportPerson.isActive ? "enabled" : "disabled"} successfully`,
          "success"
        );
      }

      setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined });
    } catch (error) {
      console.error("Error deleting Support Person:", error);
      showSnackbar(
        deleteDialog.deleteType === 'hard' 
          ? "Failed to delete Support Person permanently" 
          : `Failed to ${deleteDialog.item?.isActive ? "disable" : "enable"} Support Person`,
        "error"
      );
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      supportPersonName: "",
      supportPersonNumber: "",
      cityId: "",
      stateId: "",
      agencyId: "",
      agencyName: "",
      createdAt: "",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (supportPerson === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Support Person data available</Alert>
      </Box>
    );
  }



  return (
    <Box className="flex flex-col">
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}>
          <Box sx={{ width: "3px", borderRadius: "2px", bgcolor: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1.15 }}>Support Persons</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Manage support persons and their ratings
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search support persons…"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: { xs: "100%", sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ opacity: 0.6 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <SupportPersonImportExportButtons
            items={filteredItems}
            onImportComplete={() => {
              loadSupportPerson();
              loadTickets();
            }}
            isLoading={loading}
          />
          <Button
            variant="outlined"
            onClick={() => setShowInactive(!showInactive)}
            color={showInactive ? "primary" : "inherit"}
          >
            <span className="text-[0.875rem]">
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </span>
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/SupportPersonForm")}
          >
            New support person
          </Button>
        </Box>
      </Box>

      {/* Filter Dropdowns */}
      {renderFilterDropdowns()}

      {/* Record list */}
      <SupportPersonList
        records={filteredItems || []}
        agencyMap={agencyMap}
        cityMap={cityMap}
        stateMap={stateMap}
        ratingMap={ratingMap}
        onEdit={handleEdit}
        onDelete={handleSoftDelete}
      />

      {/* Edit Dialog */}
      <EditItemDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, item: null })}
        type="supportPerson"
        item={editDialog.item}
        onSuccess={() => {
          loadSupportPerson();
          loadTickets();
        }}
      />

     {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, item: null, loading: false, deleteType: undefined })
        }
        onConfirm={confirmDelete}
        isLoading={deleteDialog.loading}
        config={{
          title: deleteDialog.deleteType === 'hard' 
            ? "Permanently Delete Support Person" 
            : deleteDialog.item?.isActive ? "Disable Support Person" : "Enable Support Person",
          description: deleteDialog.deleteType === 'hard'
            ? "Are you sure you want to permanently delete {itemName}? This action cannot be undone and will remove all associated data."
            : deleteDialog.item?.isActive
              ? "Are you sure you want to disable {itemName}? You can enable it later if needed."
              : "Are you sure you want to enable {itemName}?",
          variables: { itemName: deleteDialog.item?.supportPersonName || "" },
          confirmText: deleteDialog.deleteType === 'hard' 
            ? "Delete Permanently" 
            : deleteDialog.item?.isActive ? "Disable" : "Enable",
          loadingText: deleteDialog.deleteType === 'hard'
            ? "Deleting..."
            : deleteDialog.item?.isActive ? "Disabling..." : "Enabling...",
        }}
        severity={deleteDialog.deleteType === 'hard' || deleteDialog.item?.isActive ? "error" : "success"}
        actionVariant={deleteDialog.deleteType === 'hard' ? "delete" : "update"}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}