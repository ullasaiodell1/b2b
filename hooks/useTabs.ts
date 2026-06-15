import { ALL_TAB_MODULES, configuredTabs, dynamicTabId, resetTabs, setDynamicTab, subscribeToTabs, updateConfiguredTabs } from '@/components/TabState';
import { useEffect, useState } from 'react';

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
