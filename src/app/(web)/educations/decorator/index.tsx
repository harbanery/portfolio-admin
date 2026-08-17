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
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LoaderPage from "@/components/admin/loader";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/interfaces/form";

export type EducationStatus = "ACTIVE" | "NONACTIVE";

interface EducationItem {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string | null;
  grade?: string | null;
  description?: string | null;
  status: EducationStatus;
}

const EducationDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();
  const PlusIcon = loadAntdIcon("PlusOutlined");
  const EditIcon = loadAntdIcon("EditOutlined");
  const DeleteIcon = loadAntdIcon("DeleteOutlined");
  const CheckIcon = loadAntdIcon("CheckOutlined");
  const StopIcon = loadAntdIcon("StopOutlined");

  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<EducationItem[]>([]);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);

  const fetchEducations = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/educations");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data as EducationItem[]);
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
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

  const toPayload = (values: Record<string, any>) => {
    const [start, end] = values.period || [];
    return {
      school: values.school,
      degree: values.degree,
      field: values.field,
      startDate: start?.toISOString(),
      endDate: end?.toISOString() ?? null,
      grade: values.grade,
      description: values.description,
    };
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: EducationItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      school: item.school,
      degree: item.degree,
      field: item.field,
      grade: item.grade,
      description: item.description,
      period: [
        item.start_date ? dayjs(item.start_date) : undefined,
        item.end_date ? dayjs(item.end_date) : undefined,
      ].filter(Boolean),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = toPayload(values);
      const response = await fetch(
        editingItem ? `/api/educations/${editingItem.id}` : "/api/educations",
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
        description: t("notif.saveSuccess", { entity: t("educations.title") }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchEducations();
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
                t("notif.saveFailed", { entity: t("educations.title") }),
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
      const response = await fetch(`/api/educations/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchEducations();
      notification.success({
        key: "delete-success",
        message: t("notif.success"),
        description: t("notif.deleteSuccess", { entity: t("educations.title") }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "delete-error",
        message: t("notif.error"),
        description:
          error?.message ||
          t("notif.deleteFailed", { entity: t("educations.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: EducationStatus,
  ) => {
    const newStatus: EducationStatus =
      currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/educations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchEducations();
      notification.success({
        key: "toggle-status-success",
        message: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("educations.title"),
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
          t("notif.toggleFailed", { entity: t("educations.title") }),
        placement: "bottomRight",
      });
    }
  };

  const formatPeriod = (item: EducationItem) => {
    const start = dayjs(item.start_date).format("MMM YYYY");
    const end = item.end_date ? dayjs(item.end_date).format("MMM YYYY") : "-";
    return `${start} - ${end}`;
  };

  useEffect(() => {
    fetchEducations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("educations.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("educations.description")}
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
          {t("educations.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <Empty description={t("educations.empty")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                hoverable
                onClick={() => handleEdit(item)}
                actions={[
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
                          entity: t("educations.title"),
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
                          entity: t("educations.title"),
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
                        {item.school}
                      </h3>
                      <p className="text-sm text-gray-500 m-0">
                        {item.degree} - {item.field}
                      </p>
                    </div>
                    <Tag color={item.status === "ACTIVE" ? "green" : "red"}>
                      {item.status === "ACTIVE"
                        ? t("common.active")
                        : t("common.inactive")}
                    </Tag>
                  </div>

                  <Typography.Text type="secondary">
                    {formatPeriod(item)}
                  </Typography.Text>

                  {item.grade && (
                    <Typography.Text>
                      {t("form.grade")}: {item.grade}
                    </Typography.Text>
                  )}

                  {item.description && (
                    <p
                      className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 text-justify m-0"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={
          editingItem ? t("educations.detail") : t("educations.add")
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
        <FormAdmin formProps={{ form }} layout={formLayout} />
      </Modal>
    </section>
  );
};

export default EducationDecorator;
