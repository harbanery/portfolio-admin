"use client";

import { Layout, Typography } from "antd";
import { useLocale } from "@/components/locale/LocaleProvider";

const { Footer } = Layout;
const { Text } = Typography;

const FooterLayout: React.FC = () => {
  const { t } = useLocale();
  return (
    <Footer
      style={{
        textAlign: "center",
        paddingBlock: 12,
        paddingInline: 16,
      }}
    >
      <Text type="secondary">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </Text>
    </Footer>
  );
};

export default FooterLayout;
