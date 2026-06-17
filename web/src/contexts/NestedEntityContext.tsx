import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type EntityType =
  | 'state'
  | 'city'
  | 'agency'
  | 'reseller'
  | 'party'
  | 'store'
  | 'supportPerson'
  | 'assignedTo';

interface DialogState {
  id: string;
  entityType: EntityType;
  zIndex: number;
  onSuccess?: (createdEntity: any) => void;
}

interface NestedEntityContextType {
  dialogStack: DialogState[];
  openDialog: (entityType: EntityType, onSuccess?: (createdEntity: any) => void) => string;
  closeDialog: (dialogId: string) => void;
  closeTopDialog: () => void;
  getTopDialogZIndex: () => number;
  isDialogOpen: (entityType: EntityType) => boolean;
  refreshCallbacks: Map<string, () => void>;
  registerRefreshCallback: (key: string, callback: () => void) => void;
  unregisterRefreshCallback: (key: string) => void;
  triggerRefresh: (key: string) => void;
}

const NestedEntityContext = createContext<NestedEntityContextType | undefined>(undefined);

const BASE_Z_INDEX = 1300; // MUI Dialog default z-index
const Z_INDEX_INCREMENT = 10;

let dialogIdCounter = 0;

export const NestedEntityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogStack, setDialogStack] = useState<DialogState[]>([]);
  const [refreshCallbacks] = useState<Map<string, () => void>>(new Map());

  const generateDialogId = useCallback(() => {
    dialogIdCounter += 1;
    return `dialog-${dialogIdCounter}-${Date.now()}`;
  }, []);

  const openDialog = useCallback((entityType: EntityType, onSuccess?: (createdEntity: any) => void): string => {
    const dialogId = generateDialogId();
    const newZIndex = BASE_Z_INDEX + (dialogStack.length * Z_INDEX_INCREMENT);
    
    setDialogStack(prev => [
      ...prev,
      {
        id: dialogId,
        entityType,
        zIndex: newZIndex,
        onSuccess,
      }
    ]);

    return dialogId;
  }, [dialogStack.length, generateDialogId]);

  const closeDialog = useCallback((dialogId: string) => {
    setDialogStack(prev => prev.filter(dialog => dialog.id !== dialogId));
  }, []);

  const closeTopDialog = useCallback(() => {
    setDialogStack(prev => prev.slice(0, -1));
  }, []);

  const getTopDialogZIndex = useCallback(() => {
    if (dialogStack.length === 0) {
      return BASE_Z_INDEX;
    }
    return BASE_Z_INDEX + (dialogStack.length * Z_INDEX_INCREMENT);
  }, [dialogStack.length]);

  const isDialogOpen = useCallback((entityType: EntityType) => {
    return dialogStack.some(dialog => dialog.entityType === entityType);
  }, [dialogStack]);

  const registerRefreshCallback = useCallback((key: string, callback: () => void) => {
    refreshCallbacks.set(key, callback);
  }, [refreshCallbacks]);

  const unregisterRefreshCallback = useCallback((key: string) => {
    refreshCallbacks.delete(key);
  }, [refreshCallbacks]);

  const triggerRefresh = useCallback((key: string) => {
    const callback = refreshCallbacks.get(key);
    if (callback) {
      callback();
    }
  }, [refreshCallbacks]);

  return (
    <NestedEntityContext.Provider
      value={{
        dialogStack,
        openDialog,
        closeDialog,
        closeTopDialog,
        getTopDialogZIndex,
        isDialogOpen,
        refreshCallbacks,
        registerRefreshCallback,
        unregisterRefreshCallback,
        triggerRefresh,
      }}
    >
      {children}
    </NestedEntityContext.Provider>
  );
};

export const useNestedEntity = (): NestedEntityContextType => {
  const context = useContext(NestedEntityContext);
  if (!context) {
    throw new Error('useNestedEntity must be used within a NestedEntityProvider');
  }
  return context;
};

export default NestedEntityContext;
