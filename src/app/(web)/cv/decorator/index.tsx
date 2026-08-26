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
import { modalBodyProps } from "@/helpers/modal";
import { asAppError } from "@/helpers/error";
import { getImagesArray, type UploadFileLike } from "@/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/models/form";

export type CvStatus = "ACTIVE" | "NONACTIVE";
export type CvFileType = "URL" | "UPLOAD";

interface CvItem {
  id: number;
  name: string;
  file_type: CvFileType;
  file_url: string;
  file_storage_path?: string | null;
  description?: string | null;
  is_primary: boolean;
  status: CvStatus;
  createdAt: string;
}

interface CvFormValues {
  name: string;
  file_upload?: UploadFileLike[];
  description?: string | null;
  is_primary?: boolean;
}

const PlusIcon = loadAntdIcon("PlusOutlined");
const DeleteIcon = loadAntdIcon("DeleteOutlined");
const LinkIcon = loadAntdIcon("LinkOutlined");
const CheckIcon = loadAntdIcon("CheckOutlined");
const StopIcon = loadAntdIcon("StopOutlined");
const StarIcon = loadAntdIcon("StarOutlined");
const DownloadIcon = loadAntdIcon("DownloadOutlined");

const CvDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();

  const [form] = Form.useForm<CvFormValues>();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<CvItem[]>([]);
  const [editingItem, setEditingItem] = useState<CvItem | null>(null);

  const fetchCvs = async () => {
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
        title: t("notif.error"),
        description: t("notif.fetchFailed"),
        placement: "bottomRight",
      });
    } finally {
      setFetching(false);
    }
  };

  const toPayload = async (values: CvFormValues) => {
    // Tipe file kini selalu UPLOAD: URL file berasal dari hasil upload.
    let fileUrl: string | null = null;
    let fileStoragePath: string | null = null;
    if (Array.isArray(values.file_upload)) {
      const uploaded = await getImagesArray(values.file_upload);
      fileUrl = uploaded[0] ?? null;
      fileStoragePath = values.file_upload[0]?.storagePath ?? null;
    }

    return {
      name: values.name,
      fileType: "UPLOAD" as const,
      fileUrl,
      fileStoragePath,
      description: values.description,
      isPrimary: values.is_primary ?? false,
    };
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: CvItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      file_upload: item.file_url
        ? [
            {
              uid: "-1",
              name: item.file_url.split("/").pop() || "file",
              status: "done",
              url: item.file_url,
            },
          ]
        : undefined,
      description: item.description,
      is_primary: item.is_primary,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = await toPayload(values);
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
        title: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchCvs();
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "save-error",
        title: err.errorFields
          ? t("notif.validationError")
          : t("notif.error"),
        ...(err.errorFields
          ? {}
          : {
              description:
                err.message ||
                t("notif.saveFailed", { entity: t("cv.title") }),
            }),
        placement: "bottomRight",
      });
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
        title: t("notif.success"),
        description: t("notif.deleteSuccess", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "delete-error",
        title: t("notif.error"),
        description:
          err.message ||
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
        title: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("cv.title"),
          status:
            newStatus === "ACTIVE" ? t("common.active") : t("common.inactive"),
        }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "toggle-status-error",
        title: t("notif.error"),
        description:
          err.message ||
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
        title: t("notif.success"),
        description: t("notif.primaryUpdated", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "primary-error",
        title: t("notif.error"),
        description:
          err.message ||
          t("notif.primaryUpdateFailed", { entity: t("cv.title") }),
        placement: "bottomRight",
      });
    }
  };

  /** URL proxy file (melewati blokir delivery PDF Cloudinary). */
  const buildProxyUrl = (item: CvItem, download: boolean): string => {
    const params = new URLSearchParams({ url: item.file_url });
    if (download) params.set("download", "1");
    const name = item.name?.trim();
    if (name) params.set("name", `${name}`);
    return `/api/file?${params.toString()}`;
  };

  /** Buka file CV di tab baru (PDF dirender browser via proxy). */
  const handleOpenFile = (item: CvItem) => {
    window.open(buildProxyUrl(item, false), "_blank", "noopener,noreferrer");
  };

  /** Unduh file CV (Content-Disposition attachment via proxy). */
  const handleDownloadFile = (item: CvItem) => {
    const link = document.createElement("a");
    link.href = buildProxyUrl(item, true);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Defer via microtask agar setState di dalam fetchCvs tidak dipanggil
    // sinkron dari effect (pola yang sama dengan admin/form).
    void Promise.resolve().then(fetchCvs);
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
          iconPlacement="end"
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

                  <Space size={4} wrap>
                    <Button
                      type="text"
                      size="small"
                      className="!px-1"
                      icon={<LinkIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile(item);
                      }}
                    >
                      {t("common.viewFile")}
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      className="!px-1"
                      icon={<DownloadIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(item);
                      }}
                    >
                      {t("common.download")}
                    </Button>
                  </Space>

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
        {...modalBodyProps()}
      >
        <FormAdmin formProps={{ form }} layout={formLayout} uploadFolder="cv" />
      </Modal>
    </section>
  );
};

export default CvDecorator;
