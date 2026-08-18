"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import {
  App,
  Button,
  Form,
  Modal,
  Table,
  Tag,
  Typography,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LoaderPage from "@/components/admin/loader";
import { getImageString } from "@/utils/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { skillsOptions } from "@/utils/helpers/skills";
import { FormLayout } from "@/interfaces/form";

export type CertificationStatus = "ACTIVE" | "NONACTIVE";

interface CertificationItem {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  image?: string | null;
  skills: string[];
  status: CertificationStatus;
}

const CertificationDecorator = ({
  formLayout,
}: {
  formLayout: FormLayout[];
}) => {
  const { t } = useLocale();
  const PlusIcon = loadAntdIcon("PlusOutlined");
  const EditIcon = loadAntdIcon("EditOutlined");
  const DeleteIcon = loadAntdIcon("DeleteOutlined");
  const LinkIcon = loadAntdIcon("LinkOutlined");
  const CheckIcon = loadAntdIcon("CheckOutlined");
  const StopIcon = loadAntdIcon("StopOutlined");

  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(null);

  const fetchCertifications = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/certifications");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data as CertificationItem[]);
      }
    } catch (error) {
      console.error("Error fetching certifications:", error);
      notification.error({
        key: "fetch-error",
        message: t("notif.error"),
        description: t("notif.fetchFailed"),
        placement: "bottomRight",
      });
    } finally {
      setFetching(false);
    }
  };

  const toPayload = async (values: Record<string, any>) => {
    const imageString = await getImageString(values.image);
    return {
      title: values.title,
      issuer: values.issuer,
      issueDate: values.issue_date?.toISOString(),
      expiryDate: values.expiry_date?.toISOString() ?? null,
      credentialId: values.credential_id,
      credentialUrl: values.credential_url,
      image: imageString || null,
      skills: values.skills || [],
    };
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: CertificationItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      issuer: item.issuer,
      issue_date: item.issue_date ? dayjs(item.issue_date) : undefined,
      expiry_date: item.expiry_date ? dayjs(item.expiry_date) : undefined,
      credential_id: item.credential_id,
      credential_url: item.credential_url,
      image: item.image
        ? [{ url: item.image, thumbUrl: item.image, status: "done" }]
        : undefined,
      skills: item.skills,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = await toPayload(values);
      const response = await fetch(
        editingItem ? `/api/certifications/${editingItem.id}` : "/api/certifications",
        {
          method: editingItem ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "save-success",
        message: t("notif.success"),
        description: t("notif.saveSuccess", {
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchCertifications();
      return Promise.resolve();
    } catch (error: any) {
      notification.error({
        key: "save-error",
        message: error?.errorFields
          ? t("notif.validationError")
          : t("notif.error"),
        ...(error?.errorFields
          ? {}
          : {
              description:
                error?.message ||
                t("notif.saveFailed", { entity: t("certifications.title") }),
            }),
        placement: "bottomRight",
      });
      return Promise.reject();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchCertifications();
      notification.success({
        key: "delete-success",
        message: t("notif.success"),
        description: t("notif.deleteSuccess", {
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "delete-error",
        message: t("notif.error"),
        description:
          error?.message ||
          t("notif.deleteFailed", { entity: t("certifications.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: CertificationStatus,
  ) => {
    const newStatus: CertificationStatus =
      currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchCertifications();
      notification.success({
        key: "toggle-status-success",
        message: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("certifications.title"),
          status:
            newStatus === "ACTIVE" ? t("common.active") : t("common.inactive"),
        }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "toggle-status-error",
        message: t("notif.error"),
        description:
          error?.message ||
          t("notif.toggleFailed", { entity: t("certifications.title") }),
        placement: "bottomRight",
      });
    }
  };

  const columns: ColumnsType<CertificationItem> = [
    {
      title: t("col.title"),
      dataIndex: "title",
      key: "title",
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          {record.credential_url && (
            <a
              href={record.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-xs flex items-center gap-1"
            >
              <LinkIcon /> {t("common.openLink")}
            </a>
          )}
        </Space>
      ),
    },
    {
      title: t("col.issuer"),
      dataIndex: "issuer",
      key: "issuer",
      responsive: ["sm"],
    },
    {
      title: t("col.issueDate"),
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: t("col.expiryDate"),
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD MMM YYYY") : t("common.noExpiry"),
      responsive: ["md"],
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? t("common.active") : t("common.inactive")}
        </Tag>
      ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            type="text"
            icon={<EditIcon />}
            onClick={() => handleEdit(record)}
          >
            {t("common.edit")}
          </Button>
          <Button
            size="small"
            type="text"
            icon={record.status === "ACTIVE" ? <StopIcon /> : <CheckIcon />}
            onClick={() =>
              modal.confirm({
                title: t("notif.confirmToggle", {
                  action:
                    record.status === "ACTIVE"
                      ? t("common.deactivate")
                      : t("common.activate"),
                  entity: t("certifications.title"),
                }),
                okText: t("common.yes"),
                cancelText: t("common.no"),
                onOk: () => handleToggleStatus(record.id, record.status),
              })
            }
          >
            {record.status === "ACTIVE"
              ? t("common.deactivate")
              : t("common.activate")}
          </Button>
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteIcon />}
            onClick={() =>
              modal.confirm({
                title: t("notif.confirmDelete", {
                  entity: t("certifications.title"),
                }),
                okText: t("common.yes"),
                cancelText: t("common.no"),
                onOk: () => handleDelete(record.id),
              })
            }
          >
            {t("common.delete")}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchCertifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("certifications.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("certifications.description")}
          </p>
        </div>

        <Button
          style={{ fontWeight: 600 }}
          icon={<PlusIcon />}
          variant="solid"
          color="geekblue"
          iconPlacement="end"
          size="large"
          onClick={handleAdd}
        >
          {t("certifications.add")}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={fetching}
        size="middle"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title={
          editingItem
            ? t("certifications.detail")
            : t("certifications.add")
        }
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          form.resetFields();
          setEditingItem(null);
          setIsModalOpen(false);
        }}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={loading}
        width={700}
        styles={{
          body: {
            paddingBlock: "10px",
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
      >
        <FormAdmin
          formProps={{ form }}
          layout={formLayout}
          optionList={{ skills: skillsOptions }}
        />
      </Modal>
    </section>
  );
};

export default CertificationDecorator;
