"use client";

import { Card, Col, Row, Statistic, Table, Typography, Tag, Empty } from "antd";
import { loadAntdIcon } from "@/components/custom/icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLocale } from "@/components/locale/LocaleProvider";
import dayjs from "dayjs";

const UserOutlined = loadAntdIcon("UserOutlined");
const ProjectOutlined = loadAntdIcon("ProjectOutlined");
const CheckCircleOutlined = loadAntdIcon("CheckCircleOutlined");
const ClockCircleOutlined = loadAntdIcon("ClockCircleOutlined");
const HistoryOutlined = loadAntdIcon("HistoryOutlined");
const SafetyCertificateOutlined = loadAntdIcon("SafetyCertificateOutlined");
const ReadOutlined = loadAntdIcon("ReadOutlined");
const FileTextOutlined = loadAntdIcon("FileTextOutlined");

import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const COLORS = {
  ACTIVE: "#52c41a",
  NONACTIVE: "#faad14",
};

interface DashboardStats {
  personalCount: number;
  totalProjectsCount: number;
  activeProjectsCount: number;
  totalExperiencesCount: number;
  activeExperiencesCount: number;
  totalCertificationsCount: number;
  totalEducationsCount: number;
  totalCvsCount: number;
}

interface DashboardAnalytics {
  statusDistribution: {
    ACTIVE: number;
    NONACTIVE: number;
  };
  monthlyData: Array<{
    month: string;
    count: number;
  }>;
}

interface RecentProject {
  id: number;
  title: string;
  role: string;
  status: string;
  createdAt: Date | string;
}

interface DashboardData {
  stats: DashboardStats;
  analytics: DashboardAnalytics;
  recentProjects: RecentProject[];
}

const DashboardDecorator = ({ data }: { data: DashboardData | null }) => {
  const { t } = useLocale();
  const stats = data?.stats;
  const statusDistribution = data?.analytics?.statusDistribution || {
    ACTIVE: 0,
    NONACTIVE: 0,
  };
  const monthlyData = data?.analytics?.monthlyData || [];

  const pieData = [
    { name: t("common.active"), value: statusDistribution.ACTIVE, color: COLORS.ACTIVE },
    {
      name: t("common.inactive"),
      value: statusDistribution.NONACTIVE,
      color: COLORS.NONACTIVE,
    },
  ];

  const statCards = [
    {
      title: t("dashboard.stat.personal"),
      value: stats?.personalCount || 0,
      prefix: <UserOutlined />,
      color: "#1890ff",
    },
    {
      title: t("dashboard.stat.projectsActive"),
      value: stats?.activeProjectsCount || 0,
      prefix: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: t("dashboard.stat.projectsTotal"),
      value: stats?.totalProjectsCount || 0,
      prefix: <ProjectOutlined />,
      color: "#722ed1",
    },
    {
      title: t("dashboard.stat.experiences"),
      value: stats?.totalExperiencesCount || 0,
      prefix: <HistoryOutlined />,
      color: "#13c2c2",
    },
    {
      title: t("dashboard.stat.certifications"),
      value: stats?.totalCertificationsCount || 0,
      prefix: <SafetyCertificateOutlined />,
      color: "#fa8c16",
    },
    {
      title: t("dashboard.stat.educations"),
      value: stats?.totalEducationsCount || 0,
      prefix: <ReadOutlined />,
      color: "#eb2f96",
    },
    {
      title: t("dashboard.stat.cv"),
      value: stats?.totalCvsCount || 0,
      prefix: <FileTextOutlined />,
      color: "#2f54eb",
    },
    {
      title: t("common.inactive") + " - " + t("menu.projects"),
      value: (stats?.totalProjectsCount || 0) - (stats?.activeProjectsCount || 0),
      prefix: <ClockCircleOutlined />,
      color: "#faad14",
    },
  ];

  const recentColumns: ColumnsType<RecentProject> = [
    {
      title: t("col.title"),
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: t("col.role"),
      dataIndex: "role",
      key: "role",
      responsive: ["sm"],
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "warning"}>
          {status === "ACTIVE" ? t("common.active") : t("common.inactive")}
        </Tag>
      ),
    },
    {
      title: t("common.created"),
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["md"],
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
  ];

  return (
    <div className="p-0 sm:p-4 space-y-6">
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={12} sm={12} lg={6} key={card.title}>
            <Card
              variant="borderless"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                styles={{
                  content: { color: card.color }
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<Title level={4}>{t("dashboard.chart.activity")}</Title>}
            variant="borderless"
            className="shadow-sm"
          >
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#1890ff"
                    name={t("dashboard.chart.activityBar")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Title level={4}>{t("dashboard.chart.status")}</Title>}
            variant="borderless"
            className="shadow-sm"
          >
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4}>{t("dashboard.recent")}</Title>}
        variant="borderless"
        className="shadow-sm"
      >
        {data?.recentProjects?.length ? (
          <Table
            columns={recentColumns}
            dataSource={data.recentProjects}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty description={t("dashboard.empty")} />
        )}
      </Card>
    </div>
  );
};

export default DashboardDecorator;
