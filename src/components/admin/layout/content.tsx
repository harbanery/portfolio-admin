"use client";

import { Layout } from "antd";

const { Content } = Layout;

const ContentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Content
      style={{
        padding: "16px",
        background: "none",
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
      }}
      className="responsive-content"
    >
      {children}
    </Content>
  );
};

export default ContentLayout;
