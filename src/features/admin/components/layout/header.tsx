"use client";

import { useState } from "react";
import { Breadcrumb, Button, Grid, Layout, Space, App as AntdApp } from "antd";
import { LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { loadAntdIcon } from "@/features/admin/components/ui/icon";
import { menuAdminConfig } from "@/features/admin/utils/menu";
import ThemeToggle from "@/components/ui/theme/ThemeToggle";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import RealtimeClock from "@/features/admin/components/ui/clock";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useThemeMode } from "@/components/ui/theme/ThemeProvider";

const { Header } = Layout;

const HeaderLayout: React.FC<{
  onMobileMenuClick?: () => void;
}> = ({ onMobileMenuClick }) => {
  const { t } = useLocale();
  const { mode, hydrated } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();
  const { message } = AntdApp.useApp();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      message.error(t("auth.logoutFailed"));
      setLoggingOut(false);
    }
  };

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const isDark = hydrated && mode === "dark";

  const breadcrumbItems = menuAdminConfig
    ?.filter((item) => item.link === pathname)
    ?.map((item) => {
      const Icon = loadAntdIcon(item.icon);
      return {
        title: (
          <div className="flex gap-1 items-center">
            <Icon />
            <span className="px-1">{t(`menu.${item.key}`)}</span>
          </div>
        ),
      };
    });

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingBlock: 12,
        paddingInline: isMobile ? 16 : 24,
        height: "auto",
        lineHeight: "normal",
        backgroundColor: isDark ? "#141414" : "#ffffff",
        borderBottom: "1px solid rgba(128, 128, 128, 0.12)",
      }}
    >
      {isMobile ? (
        <Space size="small">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMobileMenuClick}
            aria-label={t("header.toggleSider")}
          />
          <Breadcrumb style={{ fontWeight: 600 }} items={breadcrumbItems} />
        </Space>
      ) : (
        <Breadcrumb style={{ fontWeight: 600 }} items={breadcrumbItems} />
      )}
      <Space size="middle">
        <LanguageToggle />
        <ThemeToggle />
        <RealtimeClock />
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          loading={loggingOut}
          aria-label={t("auth.logout")}
          title={t("auth.logout")}
        />
      </Space>
    </Header>
  );
};

export default HeaderLayout;
