"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Locale, getTranslation } from "./translations";

interface LanguageContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLanguage: (lang: Locale) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  dir: "ltr",
  t: (key) => key,
  setLanguage: async () => {},
  isLoading: true,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch language from server settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("bysarou-lang");
    if (saved === "en" || saved === "fr" || saved === "ar") {
      setLocale(saved as Locale);
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.language && ["en", "fr", "ar"].includes(data.language)) {
          setLocale(data.language as Locale);
          localStorage.setItem("bysarou-lang", data.language);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Apply dir attribute and lang to <html> whenever locale changes
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const t = useCallback(
    (key: string): string => getTranslation(locale, key),
    [locale]
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  const setLanguage = useCallback(async (lang: Locale) => {
    // Update UI immediately
    setLocale(lang);
    localStorage.setItem("bysarou-lang", lang);

    // Persist to server
    try {
      const res = await fetch("/api/settings");
      const current = await res.json();
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, language: lang }),
      });
    } catch (err) {
      console.error("Failed to persist language:", err);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, dir, t, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
