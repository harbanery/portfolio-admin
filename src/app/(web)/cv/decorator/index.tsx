"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import {
  App,
  Button,
  Form,
  Modal,
  Card,
  Tag,
  Empty,
  Typography,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LoaderPage from "@/components/admin/loader";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/interfaces/form";

export type CvStatus = "ACTIVE" | "NONACTIVE";

interface CvItem {
  id: number;
  name: string;
  file_url: string;
  description?: string | null;
  is_primary: boolean;
  status: CvStatus;
  createdAt: string;
}

const CvDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();
  const PlusIcon = loadAntdIcon("PlusOutlined");
  const EditIcon = loadAntdIcon("EditOutlined");
  const DeleteIcon = loadAntdIcon("DeleteOutlined");
  const LinkIcon = loadAntdIcon("LinkOutlined");
  const CheckIcon = loadAntdIcon("CheckOutlined");
  const StopIcon = loadAntdIcon("StopOutlined");
  const StarIcon = loadAntdIcon("StarOutlined");

  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<CvItem[]>([]);
  const [editingItem, setEditingItem] = useState<CvItem | null>(null);

  const fetchCvs = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/cv");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data as CvItem[]);
      }
    } catch (error) {
      console.error("Error fetching cvs:", error);
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

  const toPayload = (values: Record<string, any>) => ({
    name: values.name,
    fileUrl: values.file_url,
    description: values.description,
    isPrimary: values.is_primary ?? false,
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: CvItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      file_url: item.file_url,
      description: item.description,
      is_primary: item.is_primary,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = toPayload(values);
      const response = await fetch(
        editingItem ? `/api/cv/${editingItem.id}` : "/api/cv",
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
        description: t("notif.saveSuccess", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchCvs();
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
                t("notif.saveFailed", { entity: t("cv.title") }),
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
      const response = await fetch(`/api/cv/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchCvs();
      notification.success({
        key: "delete-success",
        message: t("notif.success"),
        description: t("notif.deleteSuccess", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "delete-error",
        message: t("notif.error"),
        description:
          error?.message ||
          t("notif.deleteFailed", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: CvStatus) => {
    const newStatus: CvStatus = currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchCvs();
      notification.success({
        key: "toggle-status-success",
        message: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("cv.title"),
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
          t("notif.toggleFailed", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleTogglePrimary = async (id: number) => {
    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchCvs();
      notification.success({
        key: "primary-success",
        message: t("notif.success"),
        description: t("common.primary") + " updated",
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "primary-error",
        message: t("notif.error"),
        description: error?.message || "Failed to update primary CV",
        placement: "bottomRight",
      });
    }
  };

  useEffect(() => {
    fetchCvs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("cv.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("cv.description")}
          </p>
        </div>

        <Button
          style={{ fontWeight: 600 }}
          icon={<PlusIcon />}
          variant="solid"
          color="geekblue"
          iconPosition="end"
          size="large"
          onClick={handleAdd}
        >
          {t("cv.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <Empty description={t("cv.empty")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                hoverable
                onClick={() => handleEdit(item)}
                actions={[
                  <Button
                    key="primary"
                    type="text"
                    icon={<StarIcon />}
                    disabled={item.is_primary}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePrimary(item.id);
                    }}
                  >
                    {t("common.primary")}
                  </Button>,
                  <Button
                    key="toggle"
                    type="text"
                    icon={
                      item.status === "ACTIVE" ? <StopIcon /> : <CheckIcon />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      modal.confirm({
                        title: t("notif.confirmToggle", {
                          action:
                            item.status === "ACTIVE"
                              ? t("common.deactivate")
                              : t("common.activate"),
                          entity: t("cv.title"),
                        }),
                        okText: t("common.yes"),
                        cancelText: t("common.no"),
                        onOk: () => handleToggleStatus(item.id, item.status),
                      });
                    }}
                  >
                    {item.status === "ACTIVE"
                      ? t("common.deactivate")
                      : t("common.activate")}
                  </Button>,
                  <Button
                    key="delete"
                    danger
                    type="text"
                    icon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      modal.confirm({
                        title: t("notif.confirmDelete", {
                          entity: t("cv.title"),
                        }),
                        okText: t("common.yes"),
                        cancelText: t("common.no"),
                        onOk: () => handleDelete(item.id),
                      });
                    }}
                  >
                    {t("common.delete")}
                  </Button>,
                ]}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg m-0 truncate">
                        {item.name}
                      </h3>
                    </div>
                    <Space size={4} wrap>
                      {item.is_primary && (
                        <Tag color="blue">{t("common.primary")}</Tag>
                      )}
                      <Tag color={item.status === "ACTIVE" ? "green" : "red"}>
                        {item.status === "ACTIVE"
                          ? t("common.active")
                          : t("common.inactive")}
                      </Tag>
                    </Space>
                  </div>

                  {item.description && (
                    <Typography.Text
                      type="secondary"
                      className="line-clamp-2"
                      style={{ margin: 0 }}
                    >
                      {item.description}
                    </Typography.Text>
                  )}

                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm flex items-center gap-1 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon /> {t("col.file")}
                  </a>

                  <Typography.Text type="secondary" className="text-xs">
                    {dayjs(item.createdAt).format("DD MMM YYYY")}
                  </Typography.Text>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editingItem ? t("cv.detail") : t("cv.add")}
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
        width={600}
        styles={{
          body: { paddingBlock: "10px" },
        }}
      >
        <FormAdmin formProps={{ form }} layout={formLayout} />
      </Modal>
    </section>
  );
};

export default CvDecorator;
