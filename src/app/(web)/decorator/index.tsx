"use client";

import { Card, Col, Row, Statistic } from "antd";
import { loadAntdIcon } from "@/components/custom/icon";
import { useLocale } from "@/components/locale/LocaleProvider";

const ProjectOutlined = loadAntdIcon("ProjectOutlined");
const HistoryOutlined = loadAntdIcon("HistoryOutlined");
const SafetyCertificateOutlined = loadAntdIcon("SafetyCertificateOutlined");
const ReadOutlined = loadAntdIcon("ReadOutlined");
const BookOutlined = loadAntdIcon("BookOutlined");
const FileTextOutlined = loadAntdIcon("FileTextOutlined");

interface DashboardStats {
  activeProjectsCount: number;
  activeExperiencesCount: number;
  activeCertificationsCount: number;
  activeEducationsCount: number;
  activePublicationsCount: number;
  activeCvsCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
}

const DashboardDecorator = ({ data }: { data: DashboardData | null }) => {
  const { t } = useLocale();
  const stats = data?.stats;

  // Summary card: hanya entitas utama, semuanya dihitung dari data ACTIVE.
  const statCards = [
    {
      title: t("dashboard.stat.projectsActive"),
      value: stats?.activeProjectsCount || 0,
      prefix: <ProjectOutlined />,
      color: "#722ed1",
    },
    {
      title: t("dashboard.stat.experiences"),
      value: stats?.activeExperiencesCount || 0,
      prefix: <HistoryOutlined />,
      color: "#13c2c2",
    },
    {
      title: t("dashboard.stat.certifications"),
      value: stats?.activeCertificationsCount || 0,
      prefix: <SafetyCertificateOutlined />,
      color: "#fa8c16",
    },
    {
      title: t("dashboard.stat.educations"),
      value: stats?.activeEducationsCount || 0,
      prefix: <ReadOutlined />,
      color: "#eb2f96",
    },
    {
      title: t("dashboard.stat.publications"),
      value: stats?.activePublicationsCount || 0,
      prefix: <BookOutlined />,
      color: "#a0d911",
    },
    {
      title: t("dashboard.stat.cv"),
      value: stats?.activeCvsCount || 0,
      prefix: <FileTextOutlined />,
      color: "#2f54eb",
    },
  ];

  return (
    <div className="p-0 sm:p-4 space-y-6">
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={12} sm={12} lg={8} key={card.title}>
            <Card
              variant="borderless"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                styles={{
                  content: { color: card.color },
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardDecorator;
