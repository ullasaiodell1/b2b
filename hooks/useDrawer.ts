import {
  closeDrawer, drawerItems, isDrawerOpen, openDrawer, reorderDrawerItems, resetDrawerItems,
  subscribeToDrawer, toggleDrawer, toggleItemVisibility, updateDrawerItems
} from '@/components/custom/DrawerState';
import { useEffect, useState } from 'react';

export function useDrawer() {
  const [isOpen, setIsOpen] = useState(isDrawerOpen);
  const [items, setItems] = useState(drawerItems);

  useEffect(() => {
    return subscribeToDrawer(() => {
      setIsOpen(isDrawerOpen);
      setItems([...drawerItems]);
    });
  }, []);

  return {
    isOpen,
    items,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    updateDrawerItems,
    toggleItemVisibility,
    reorderDrawerItems,
    resetDrawerItems,
  };
}
