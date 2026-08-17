"use client";

import { Layout } from "antd";
import { useState } from "react";
import SiderLayout from "./sider";
import HeaderLayout from "./header";
import FooterLayout from "./footer";
import ContentLayout from "./content";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Layout className="hide-scrollbar" style={{ minHeight: "100vh" }} hasSider>
      <SiderLayout
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
          minHeight: "inherit",
          justifyContent: "space-between",
          position: "relative",
          minWidth: 0,
        }}
      >
        <HeaderLayout onMobileMenuClick={() => setMobileOpen(true)} />
        <ContentLayout>{children}</ContentLayout>
        {/* <FooterLayout /> */}
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
