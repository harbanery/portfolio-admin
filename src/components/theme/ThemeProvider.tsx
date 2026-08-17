"use client";

import { App, ConfigProvider, theme } from "antd";
import idID from "antd/locale/id_ID";
import enUS from "antd/locale/en_US";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useLocale } from "@/components/locale/LocaleProvider";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  hydrated: boolean;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  hydrated: false,
  toggle: () => {},
  setMode: () => {},
});

const STORAGE_KEY = "admin-portfolio:theme";

let clientMode: ThemeMode = "light";
let clientHydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getModeSnapshot(): ThemeMode {
  return clientMode;
}

function getHydratedSnapshot(): boolean {
  return clientHydrated;
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

function getServerHydrated(): boolean {
  return false;
}

function readPersistedMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyMode(next: ThemeMode): void {
  clientMode = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore
  }
  const root = document.documentElement;
  if (next === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  emit();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getModeSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydrated);
  const { locale } = useLocale();

  useEffect(() => {
    const lang = locale === "id" ? "id" : "en";
    dayjs.locale(lang);
    document.documentElement.lang = lang;
  }, [locale]);

  useEffect(() => {
    const persisted = readPersistedMode();
    if (persisted !== clientMode) {
      applyMode(persisted);
    } else {
      const root = document.documentElement;
      if (persisted === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }
    clientHydrated = true;
    emit();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    applyMode(next);
  }, []);

  const toggle = useCallback(() => {
    applyMode(clientMode === "light" ? "dark" : "light");
  }, []);

  const isDark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, hydrated, toggle, setMode }}>
      <ConfigProvider
        locale={locale === "id" ? idID : enUS}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: "#4f46e5",
            borderRadius: 10,
            fontFamily:
              "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
            ...(isDark
              ? {}
              : {
                  colorTextSecondary: "#595959",
                  colorTextTertiary: "#6b7280",
                }),
          },
          components: {
            Statistic: {
              titleFontSize: 14,
              ...(isDark ? {} : { contentFontSize: 24 }),
            },
            Tabs: {
              ...(isDark ? {} : { itemActiveColor: "#4f46e5" }),
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  return useContext(ThemeContext);
}
