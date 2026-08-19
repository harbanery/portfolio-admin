"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import { App, Button, Form, Modal, Card, Tag, Empty, Typography } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LoaderPage from "@/components/admin/loader";
import { modalBodyProps } from "@/helpers/modal";
import { getImagesArray } from "@/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/models/form";

export type ExperienceStatus = "ACTIVE" | "NONACTIVE";

interface ExperienceItem {
  id: number;
  job_title: string;
  company_name: string;
  description?: string | null;
  images: string[];
  start_date: string;
  end_date?: string | null;
  is_present: boolean;
  status: ExperienceStatus;
}

const ExperienceDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();
  const PlusIcon = loadAntdIcon("PlusOutlined");
  const EditIcon = loadAntdIcon("EditOutlined");
  const SaveIcon = loadAntdIcon("SaveOutlined");
  const DeleteIcon = loadAntdIcon("DeleteOutlined");
  const CheckIcon = loadAntdIcon("CheckOutlined");
  const StopIcon = loadAntdIcon("StopOutlined");

  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const dataDetail = Form.useWatch([], detailForm);
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExperienceItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchExperiences = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/experiences");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data as ExperienceItem[]);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      notification.error({
        key: "fetch-error",
        title: t("notif.error"),
        description: t("notif.fetchFailed"),
        placement: "bottomRight",
      });
    } finally {
      setFetching(false);
    }
  };

  const toPayload = async (values: Record<string, any>) => {
    const imagesArray = await getImagesArray(values.images);
    const [start, end] = values.period || [];
    return {
      job_title: values.job_title,
      company_name: values.company_name,
      description: values.description,
      images: imagesArray,
      start_date: start?.toISOString(),
      end_date: values.is_present ? null : end?.toISOString(),
      is_present: values.is_present ?? false,
    };
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = await toPayload(values);
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "save-success",
        title: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("experiences.title") }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchExperiences();
    } catch (error: any) {
      notification.error({
        key: "save-error",
        title: error?.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(error?.errorFields
          ? {}
          : {
              description:
                error?.message ||
                t("notif.saveFailed", { entity: t("experiences.title") }),
            }),
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchExperiences();
      notification.success({
        key: "delete-success",
        title: t("notif.success"),
        description: t("notif.deleteSuccess", {
          entity: t("experiences.title"),
        }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "delete-error",
        title: t("notif.error"),
        description:
          error?.message ||
          t("notif.deleteFailed", { entity: t("experiences.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: ExperienceStatus,
  ) => {
    const newStatus: ExperienceStatus =
      currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchExperiences();
      notification.success({
        key: "toggle-status-success",
        title: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("experiences.title"),
          status:
            newStatus === "ACTIVE" ? t("common.active") : t("common.inactive"),
        }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "toggle-status-error",
        title: t("notif.error"),
        description:
          error?.message ||
          t("notif.toggleFailed", { entity: t("experiences.title") }),
        placement: "bottomRight",
      });
    }
  };

  const formatPeriod = (item: ExperienceItem) => {
    const start = dayjs(item.start_date).format("MMM YYYY");
    const end = item.is_present
      ? t("common.present")
      : item.end_date
        ? dayjs(item.end_date).format("MMM YYYY")
        : "-";
    return `${start} - ${end}`;
  };

  const handleOpenDetail = (item: ExperienceItem) => {
    setSelectedItem(item);
    setDetailFields(item);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  const setDetailFields = (item: Partial<ExperienceItem>) => {
    detailForm.setFieldsValue({
      job_title: item.job_title,
      company_name: item.company_name,
      description: item.description,
      images: item.images?.map((url) => ({ url, thumbUrl: url, status: "done" })),
      period: item.start_date
        ? [
            dayjs(item.start_date),
            ...(item.end_date ? [dayjs(item.end_date)] : []),
          ]
        : undefined,
      is_present: item.is_present ?? false,
    });
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
    setIsEditMode(false);
    detailForm.resetFields();
  };

  const handleEditToggle = () => {
    if (isEditMode && selectedItem) {
      setDetailFields(selectedItem);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const values = await detailForm.validateFields();
      const payload = await toPayload(values);
      const response = await fetch(`/api/experiences/${selectedItem!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "edit-success",
        title: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("experiences.title") }),
        placement: "bottomRight",
      });
      setIsEditMode(false);
      fetchExperiences();
    } catch (error: any) {
      notification.error({
        key: "edit-error",
        title: error?.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(error?.errorFields
          ? {}
          : {
              description:
                error?.message ||
                t("notif.saveFailed", { entity: t("experiences.title") }),
            }),
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("experiences.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("experiences.description")}
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
          {t("experiences.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <Empty description={t("experiences.empty")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                hoverable
                onClick={() => handleOpenDetail(item)}
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
                          entity: t("experiences.title"),
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
                          entity: t("experiences.title"),
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
                        {item.job_title}
                      </h3>
                      <p className="text-sm text-gray-500 m-0">
                        {item.company_name}
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
        title={t("experiences.add")}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={loading}
        width={700}
        {...modalBodyProps()}
      >
        <FormAdmin formProps={{ form }} layout={formLayout} />
      </Modal>

      <Modal
        title={
          <div className="flex justify-between items-center pr-8">
            <span>{t("experiences.detail")}</span>
            <div className="flex gap-2">
              {isEditMode && (
                <Button
                  variant="filled"
                  color="default"
                  size="small"
                  onClick={handleEditToggle}
                >
                  {t("common.cancel")}
                </Button>
              )}
              <Button
                style={{ fontWeight: 600 }}
                icon={isEditMode ? <SaveIcon /> : <EditIcon />}
                variant="solid"
                color={isEditMode ? "volcano" : "geekblue"}
                iconPlacement="end"
                size="small"
                onClick={
                  isEditMode
                    ? () =>
                        modal.confirm({
                          title: t("notif.confirmSave"),
                          okText: t("common.yes"),
                          cancelText: t("common.no"),
                          okButtonProps: {
                            style: { fontWeight: 600 },
                            variant: "solid",
                            color: "primary",
                          },
                          cancelButtonProps: {
                            variant: "filled",
                            color: "default",
                          },
                          onOk: handleSaveEdit,
                        })
                    : handleEditToggle
                }
              >
                {isEditMode ? t("common.save") : t("common.edit")}
              </Button>
            </div>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={700}
        {...modalBodyProps()}
      >
        <FormAdmin
          formProps={{ form: detailForm, disabled: !isEditMode }}
          layout={formLayout}
          formValue={dataDetail}
        />
      </Modal>
    </section>
  );
};

export default ExperienceDecorator;
