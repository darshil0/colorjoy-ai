import { useState, useEffect } from "react";
import { SavedConfig } from "../types";
import { toast } from "sonner";

export function useFavorites() {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("colorjoy_favorites");
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites");
      }
    }
  }, []);

  const saveToLocalStorage = (configs: SavedConfig[]) => {
    localStorage.setItem("colorjoy_favorites", JSON.stringify(configs));
    setSavedConfigs(configs);
  };

  const saveConfig = (childName: string, theme: string) => {
    if (!childName || !theme) return;
    
    const newConfig: SavedConfig = {
      id: Math.random().toString(36).substr(2, 9),
      childName,
      theme,
      timestamp: Date.now(),
    };
    
    const updated = [newConfig, ...savedConfigs].slice(0, 10);
    saveToLocalStorage(updated);
    toast.success("Theme saved to favorites!");
  };

  const deleteConfig = (id: string) => {
    const updated = savedConfigs.filter(c => c.id !== id);
    saveToLocalStorage(updated);
    toast.info("Removed from favorites");
  };

  return {
    savedConfigs,
    saveConfig,
    deleteConfig
  };
}
