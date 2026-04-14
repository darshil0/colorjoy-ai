import { useState, useEffect } from "react";
import { SavedConfig } from "../types";

export function useFavorites() {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("colorjoy_favorites");
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const saveConfig = (childName: string, theme: string) => {
    if (!childName || !theme) return;
    const newConfig: SavedConfig = {
      id: crypto.randomUUID(),
      childName,
      theme,
      createdAt: new Date().toISOString()
    };
    const updated = [newConfig, ...savedConfigs];
    setSavedConfigs(updated);
    localStorage.setItem("colorjoy_favorites", JSON.stringify(updated));
  };

  const deleteConfig = (id: string) => {
    const updated = savedConfigs.filter(c => c.id !== id);
    setSavedConfigs(updated);
    localStorage.setItem("colorjoy_favorites", JSON.stringify(updated));
  };

  return { savedConfigs, saveConfig, deleteConfig };
}
