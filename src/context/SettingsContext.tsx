"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface SiteSettings {
  whatsappNumber: string;
  /** Customer-care address. */
  contactEmail: string;
  /** Display form, e.g. "+91 77368 30303"; `tel:` strips the spacing. */
  contactPhone: string;
  /** One-line postal address. Empty until the studio supplies it. */
  addressLine: string;
  instagramUrl: string;
}

// Matches the backend's SiteSettings defaults, so the first paint before the
// request lands shows the same values it will settle on.
const defaultSettings: SiteSettings = {
  whatsappNumber: "917736830303",
  contactEmail: "belovi2026@gmail.com",
  contactPhone: "",
  addressLine: "",
  instagramUrl: "https://www.instagram.com/belovi.in/",
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : "http://localhost:5000";

        const res = await axios.get(`${baseUrl}/api/v1/site-settings`, { params: { t: Date.now() } });
        if (res.data?.success && res.data?.data) {
          // Merged over the defaults so a settings document saved before a field
          // existed can't leave that field `undefined` in the consumers.
          setSettings({ ...defaultSettings, ...res.data.data });
        }
      } catch (error) {
        console.error("Failed to fetch site settings", error);
      }
    };

    fetchSettings();

    // Refetch when the user switches back to this tab (e.g., after changing settings in the admin panel)
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
