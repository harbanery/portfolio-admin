"use client";

import { BulbFilled, BulbOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useLocale } from "@/components/locale/LocaleProvider";
import { useThemeMode } from "./ThemeProvider";

export default function ThemeToggle() {
  const { mode, hydrated, toggle } = useThemeMode();
  const { t } = useLocale();
  const isDark = hydrated && mode === "dark";

  return (
    <Tooltip title={isDark ? t("theme.light") : t("theme.dark")}>
      <Button
        type="default"
        icon={isDark ? <BulbFilled /> : <BulbOutlined />}
        onClick={toggle}
        aria-label={isDark ? t("theme.enableLight") : t("theme.enableDark")}
        suppressHydrationWarning
      />
    </Tooltip>
  );
}
