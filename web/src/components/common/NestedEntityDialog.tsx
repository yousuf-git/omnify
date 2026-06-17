import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useNestedEntity, type EntityType } from '../../contexts/NestedEntityContext';

// Import all the forms
import StateForm from '../form/StateForm';
import CityForm from '../form/CityForm';
import AgencyForm from '../form/AgencyForm';
import ResellerForm from '../form/ResellerForm';
import PartyForm from '../form/PartyForm';
import StoreForm from '../form/StoreForm';
import SupportPersonForm from '../form/SupportPersonForm';
import AssignedToForm from '../form/AssignedToForm';

interface EntityDialogProps {
  dialogId: string;
  entityType: EntityType;
  zIndex: number;
  onSuccess?: (createdEntity: any) => void;
}

const EntityDialog: React.FC<EntityDialogProps> = ({
  dialogId,
  entityType,
  zIndex,
  onSuccess,
}) => {
  const { closeDialog, triggerRefresh } = useNestedEntity();

  const handleSuccess = () => {
    // Trigger refresh for any parent forms that registered callbacks
    triggerRefresh('cities');
    triggerRefresh('states');
    triggerRefresh('agencies');
    triggerRefresh('resellers');
    triggerRefresh('parties');
    triggerRefresh('stores');
    triggerRefresh('supportPersons');
    triggerRefresh('assignedToList');
    
    // Call the specific onSuccess callback if provided
    if (onSuccess) {
      onSuccess(null); // The form will handle the actual data
    }
    
    // Close this dialog
    closeDialog(dialogId);
  };

  const handleClose = () => {
    closeDialog(dialogId);
  };

  // Z-index for dropdown poppers (higher than dialog)
  const popperZIndex = zIndex + 1;

  const renderForm = () => {
    switch (entityType) {
      case 'state':
        return <StateForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'city':
        return <CityForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'agency':
        return <AgencyForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'reseller':
        return <ResellerForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'party':
        return <PartyForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'store':
        return <StoreForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'supportPerson':
        return <SupportPersonForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      case 'assignedTo':
        return <AssignedToForm onSuccess={handleSuccess} dialogZIndex={popperZIndex} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        zIndex,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }}
    >
      {/* No title here — the rendered form owns its header (title+subtitle). Just a close button. */}
      <DialogTitle sx={{ p: 0 }}>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 1,
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
      </DialogContent>
    </Dialog>
  );
};

// Container component that renders all open dialogs
export const NestedEntityDialogContainer: React.FC = () => {
  const { dialogStack } = useNestedEntity();

  return (
    <>
      {dialogStack.map((dialog) => (
        <EntityDialog
          key={dialog.id}
          dialogId={dialog.id}
          entityType={dialog.entityType}
          zIndex={dialog.zIndex}
          onSuccess={dialog.onSuccess}
        />
      ))}
    </>
  );
};

export default EntityDialog;
