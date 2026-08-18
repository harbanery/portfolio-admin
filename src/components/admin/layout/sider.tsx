"use client";

import { Button, Drawer, Grid, Layout, Menu, type MenuProps } from "antd";
import { useEffect, useState } from "react";
import { menuAdminConfig } from "@/utils/helpers/menu";
import { loadAntdIcon } from "@/components/custom/icon";
import { useLocale } from "@/components/locale/LocaleProvider";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

interface SiderLayoutProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SiderLayout: React.FC<SiderLayoutProps> = ({
  mobileOpen,
  onMobileClose,
}) => {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  const filteredMenu = menuAdminConfig?.filter((item) => item.active);

  const menuItems: MenuItem[] = filteredMenu?.map((item) => {
    const Icon = loadAntdIcon(item.icon);
    return {
      key: item.key,
      icon: <Icon />,
      label: t(`menu.${item.key}`),
    };
  });

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const toggleMenu = ({ key }: { key: string }) => {
    const linkTarget = filteredMenu.find((item) => item.key === key)?.link;
    if (!linkTarget) return;
    setSelectedKey([key]);
    router.replace(linkTarget);
    onMobileClose();
  };

  useEffect(() => {
    const key = filteredMenu.find((item) => pathname === item.link)?.key;
    setSelectedKey(key ? [key] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Mobile: drawer menu dikontrol dari layout induk.
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        size="default"
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          selectedKeys={selectedKey}
          mode="inline"
          items={menuItems}
          onClick={toggleMenu}
          style={{ borderInlineEnd: "none" }}
        />
      </Drawer>
    );
  }

  // Desktop/tablet: collapsible inline sider.
  return (
    <Sider
      collapsed={collapsed}
      width={200}
      collapsedWidth={64}
      theme="light"
      className="admin-sider"
      style={{
        borderRight: "1px solid rgba(128, 128, 128, 0.12)",
      }}
      trigger={
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{ width: "100%" }}
          aria-label={t("header.toggleSider")}
        />
      }
    >
      <Menu
        selectedKeys={selectedKey}
        mode="inline"
        inlineCollapsed={collapsed}
        items={menuItems}
        onClick={toggleMenu}
      />
    </Sider>
  );
};

export default SiderLayout;
