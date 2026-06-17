import React from "react";
import { Dialog, DialogTitle, IconButton, Box } from "@mui/material";
import { X } from "lucide-react";
import type {
  Agency,
  AssignedTo,
  City,
  DeliveryStatus,
  InstallationStatus,
  IssueType,
  Item,
  ItemGroup,
  ItemStockRecord,
  LogisticsProviderCategory,
  Party,
  Reseller,
  ResolutionStatus,
  State,
  StockIn,
  StockInCategory,
  StockOut,
  StockOutCategory,
  Store,
  SupportPerson,
  Ticket,
  TicketStatus,
  User,
  Warehouse,
} from "../../api/types";
import ItemForm from "../form/ItemForm";
import ResellerForm from "../form/ResellerForm";
import PartyForm from "../form/PartyForm";
import StockInCategoryForm from "../form/StockInCategoryForm";
import WarehouseForm from "../form/Warehouse";
import ItemGroupForm from "../form/ItemGroupForm";

import StoreForm from "../form/StoreForm";
import LogisticsProviderCategoryForm from "../form/LogisticsProviderCategoryForm";
import ItemStockRecordForm from "../form/ItemStockRecordForm";
import StockOutForm from "../form/StockOutForm";
import DeliveryStatusForm from "../form/DeliveryStatusForm";
import InstallationStatusForm from "../form/InstallationStatusForm";
import { StockInForm } from "../form/StockInManagementForm";
import StockOutCategoryForm from "../form/StockOutCategoryForm";
import AgencyForm from "../form/AgencyForm";
import IssueTypeForm from "../form/IssueTypeForm";
import ResolutionStatusForm from "../form/ResolutionStatusForm";
import SupportPersonForm from "../form/SupportPersonForm";
import AssignedToForm from "../form/AssignedToForm";
import TicketStatusForm from "../form/TicketStatusForm";
import { TicketForm } from "../form/TicketForm";
import StateForm from "../form/StateForm";
import CityForm, { type CityFormData } from "../form/CityForm";
import UserForm from "../form/UserForm";

interface EditItemDialogProps {
  open: boolean;
  onClose: () => void;
  item:
    | Item
    | ItemGroup
    | Reseller
    | Party
    | State
    | SupportPerson
    | AssignedTo
    | StockInCategory
    | StockOutCategory
    | Warehouse
    | City
    | StockIn
    | Ticket
    | Store
    | LogisticsProviderCategory
    | ItemStockRecord
    | Agency
    | DeliveryStatus
    | TicketStatus
    | IssueType
    | ResolutionStatus
    | InstallationStatus
    | StockOut
    | User
    | null;
  type:
    | "item"
    | "itemGroup"
    | "reseller"
    | "party"
    | "state"
    | "supportPerson"
    | "assignedTo"
    | "stockInCategory"
    | "stockOutCategory"
    | "warehouse"
    | "city"
    | "stockIn"
    | "ticket"
    | "store"
    | "logisticsProviderCategory"
    | "itemStockRecord"
    | "agency"
    | "deliveryStatus"
    | "ticketStatus"
    | "issueType"
    | "resolutionStatus"
    | "installationStatus"
    | "stockOut"
    | "user"
    | null;
  onSuccess: () => void;
}

export const EditItemDialog: React.FC<EditItemDialogProps> = ({
  open,
  onClose,
  item,
  type,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const renderForm = () => {
    switch (type) {
      case "item":
        return (
          <ItemForm
            itemData={item as Item | null}
            onSuccess={handleSuccess}
            isEditMode={!!item} // Pass edit mode flag
          />
        );
      case "itemGroup":
        return (
          <ItemGroupForm
            itemGroupData={item as ItemGroup | null}
            onSuccess={handleSuccess}
          />
        );
      case "reseller":
        return (
          <ResellerForm
            resellerData={item as Reseller | null}
            onSuccess={handleSuccess}
          />
        );
      case "party":
        return (
          <PartyForm partyData={item as Party | null} onSuccess={handleSuccess} />
        );
      case "city":
        const cityItem = item as City;
        if (!cityItem) {
          return <CityForm cityData={null} onSuccess={handleSuccess} />;
        }

        const formData: CityFormData = {
          _id: cityItem._id,
          cityId: cityItem.cityId,
          cityName: cityItem.cityName,
          stateId:
            typeof cityItem.stateId === "string"
              ? cityItem.stateId
              : (cityItem.stateId as any)?._id || "",
          inActive: !cityItem.isActive,
        };

        return <CityForm cityData={formData} onSuccess={handleSuccess} />;
case "user":
  return (
    <UserForm
      userData={item as User | null}
      onSuccess={handleSuccess}
      isEditMode={!!item}
    />
  );
      case "supportPerson":
  
        return (
          <SupportPersonForm
            supportPersonData={item as SupportPerson | null}
            onSuccess={handleSuccess}
          />
        );
      case "assignedTo":
        return (
          <AssignedToForm
            assignedToData={item as AssignedTo | null}
            onSuccess={handleSuccess}
          />
        );
      case "stockInCategory":
        return (
          <StockInCategoryForm
            stockInCategoryData={item as StockInCategory | null}
            onSuccess={handleSuccess}
          />
        );
      case "stockOutCategory":
        return (
          <StockOutCategoryForm
            stockOutCategoryData={item as StockOutCategory | null}
            onSuccess={handleSuccess}
          />
        );
      case "warehouse":
        return (
          <WarehouseForm
            warehouseData={item as Warehouse | null}
            onSuccess={handleSuccess}
          />
        );
      case "state":
        return (
          <StateForm
            stateData={item as State | null}
            onSuccess={handleSuccess}
          />
        );
      case "stockIn":
        return (
          <StockInForm
            stockInData={item as StockIn | null}
            onSuccess={handleSuccess}
            // isEditMode={!!item}
          />
        );
      case "ticket":
        return (
          <TicketForm
            ticketData={item as Ticket | null}
            onSuccess={handleSuccess}
            isEditMode={!!item} // This was missing - now passing the edit mode flag
          />
        );
      case "stockOut":
        return (
          <StockOutForm
            stockOutData={item as StockOut | null}
            onSuccess={handleSuccess}
            isEditMode={!!item} // This was missing - now passing the edit mode flag
          />
        );
      case "store":
        return (
          <StoreForm
            storeData={item as Store | null}
            onSuccess={handleSuccess}
          />
        );
      case "logisticsProviderCategory":
        return (
          <LogisticsProviderCategoryForm
            logisticsProviderCategoryData={
              item as LogisticsProviderCategory | null
            }
            onSuccess={handleSuccess}
          />
        );
      case "itemStockRecord":
        return (
          <ItemStockRecordForm
            itemStockRecordData={item as ItemStockRecord | null}
            onSuccess={handleSuccess}
          />
        );
      case "deliveryStatus":
        return (
          <DeliveryStatusForm
            deliveryStatusData={item as DeliveryStatus | null}
            onSuccess={handleSuccess}
          />
        );
      case "ticketStatus":
        return (
          <TicketStatusForm
            ticketStatusData={item as TicketStatus | null}
            onSuccess={handleSuccess}
          />
        );
      case "agency":
        return (
          <AgencyForm
            agencyData={item as Agency | null}
            onSuccess={handleSuccess}
          />
        );
      case "issueType":
        return (
          <IssueTypeForm
            issueTypeData={item as IssueType | null}
            onSuccess={handleSuccess}
          />
        );
      case "resolutionStatus": {
        return (
          <ResolutionStatusForm
            resolutionStatusData={item as ResolutionStatus | null}
            onSuccess={handleSuccess}
          />
        );
      }
      case "installationStatus": {
        return (
          <InstallationStatusForm
            installationStatusData={item as InstallationStatus | null}
            onSuccess={handleSuccess}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 1.5 }}>
        <Box display="flex" alignItems="center" justifyContent="end">
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Forms are built for full-page (bordered panel + outside header/actions).
          Inside a dialog, flatten the inner panel chrome so content aligns to the edges. */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pb: 3,
          "& form": { paddingBottom: 0 },
          "& .MuiPaper-root": {
            border: "none",
            boxShadow: "none",
            padding: 0,
            backgroundColor: "transparent",
          },
        }}
      >
        {renderForm()}
      </Box>
    </Dialog>
  );
};
