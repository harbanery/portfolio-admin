"use client";

import { Breadcrumb, Button, Grid, Layout, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";
import { loadAntdIcon } from "@/components/custom/icon";
import { menuAdminConfig } from "@/utils/helpers/menu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageToggle from "@/components/locale/LanguageToggle";
import { useLocale } from "@/components/locale/LocaleProvider";
import { useThemeMode } from "@/components/theme/ThemeProvider";

const { Header } = Layout;

const HeaderLayout: React.FC<{
  onMobileMenuClick?: () => void;
}> = ({ onMobileMenuClick }) => {
  const { t } = useLocale();
  const { mode, hydrated } = useThemeMode();
  const pathname = usePathname();

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
      </Space>
    </Header>
  );
};

export default HeaderLayout;
