"use client";

import { Layout } from "antd";
import { useState } from "react";
import SiderLayout from "./sider";
import HeaderLayout from "./header";
import ContentLayout from "./content";
import Footer from "@/components/footer";

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

        <Footer />
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
