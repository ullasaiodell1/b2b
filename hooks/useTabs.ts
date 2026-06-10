import { useState, useEffect } from 'react';
import { configuredTabs, dynamicTabId, subscribeToTabs, updateConfiguredTabs, setDynamicTab, resetTabs, ALL_TAB_MODULES } from '@/components/TabState';

export function useTabs() {
  const [tabs, setTabs] = useState<string[]>(configuredTabs);
  const [activeDynamicTab, setActiveDynamicTab] = useState<string | null>(dynamicTabId);

  useEffect(() => {
    return subscribeToTabs(() => {
      setTabs([...configuredTabs]);
      setActiveDynamicTab(dynamicTabId);
    });
  }, []);

  return {
    tabs,
    activeDynamicTab,
    allModules: ALL_TAB_MODULES,
    updateConfiguredTabs,
    setDynamicTab,
    resetTabs,
  };
}
