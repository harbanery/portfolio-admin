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
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { modalBodyProps } from "@/helpers/modal";
import { asAppError } from "@/helpers/error";
import { useLocale } from "@/components/locale/LocaleProvider";
import { skillsOptions } from "@/helpers/skills";
import { FormLayout } from "@/models/form";
import * as XLSX from "xlsx";

export type CertificationStatus = "ACTIVE" | "NONACTIVE";

export type CertificationCategory =
  | "CERTIFICATION"
  | "COMPETENCY"
  | "ACADEMIC"
  | "TRAINING";

/** Kategori certification yang didukung. */
const CATEGORY_OPTIONS: CertificationCategory[] = [
  "CERTIFICATION",
  "COMPETENCY",
  "ACADEMIC",
  "TRAINING",
];

/** Default kategori certification. */
const DEFAULT_CATEGORY: CertificationCategory = "CERTIFICATION";

interface CertificationItem {
  id: number;
  title: string;
  issuer: string;
  category?: CertificationCategory | string;
  issue_date: string;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  skills: string[];
  status: CertificationStatus;
}

/** Kolom template XLS untuk import/export certifications. */
const XLS_COLUMNS = [
  "title",
  "issuer",
  "category",
  "issue_date",
  "expiry_date",
  "credential_id",
  "credential_url",
  "skills",
];

interface CertificationFormValues {
  title: string;
  issuer: string;
  category?: CertificationCategory;
  issue_date?: dayjs.Dayjs;
  expiry_date?: dayjs.Dayjs;
  credential_id?: string | null;
  credential_url?: string | null;
  skills?: string[];
}

const PlusIcon = loadAntdIcon("PlusOutlined");
const EditIcon = loadAntdIcon("EditOutlined");
const DeleteIcon = loadAntdIcon("DeleteOutlined");
const LinkIcon = loadAntdIcon("LinkOutlined");
const CheckIcon = loadAntdIcon("CheckOutlined");
const StopIcon = loadAntdIcon("StopOutlined");
const DownloadIcon = loadAntdIcon("DownloadOutlined");
const UploadIcon = loadAntdIcon("UploadOutlined");

const CertificationDecorator = ({
  formLayout,
}: {
  formLayout: FormLayout[];
}) => {
  const { t } = useLocale();

  const [form] = Form.useForm<CertificationFormValues>();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(
    null,
  );

  const fetchCertifications = async () => {
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
        title: t("notif.error"),
        description: t("notif.fetchFailed"),
        placement: "bottomRight",
      });
    } finally {
      setFetching(false);
    }
  };

  const toPayload = (values: CertificationFormValues) => ({
    title: values.title,
    issuer: values.issuer,
    category: values.category || DEFAULT_CATEGORY,
    issueDate: values.issue_date?.toISOString(),
    expiryDate: values.expiry_date?.toISOString() ?? null,
    credentialId: values.credential_id,
    credentialUrl: values.credential_url,
    skills: values.skills || [],
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: CertificationItem) => {
    setEditingItem(item);
    const rawCategory = String(item.category ?? "").toUpperCase();
    const category = CATEGORY_OPTIONS.includes(
      rawCategory as CertificationCategory,
    )
      ? (rawCategory as CertificationCategory)
      : DEFAULT_CATEGORY;
    form.setFieldsValue({
      title: item.title,
      issuer: item.issuer,
      category,
      issue_date: item.issue_date ? dayjs(item.issue_date) : undefined,
      expiry_date: item.expiry_date ? dayjs(item.expiry_date) : undefined,
      credential_id: item.credential_id,
      credential_url: item.credential_url,
      skills: item.skills,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = toPayload(values);
      const response = await fetch(
        editingItem
          ? `/api/certifications/${editingItem.id}`
          : "/api/certifications",
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
        description: t("notif.saveSuccess", {
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchCertifications();
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "save-error",
        title: err.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(err.errorFields
          ? {}
          : {
              description:
                err.message ||
                t("notif.saveFailed", { entity: t("certifications.title") }),
            }),
        placement: "bottomRight",
      });
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
        title: t("notif.success"),
        description: t("notif.deleteSuccess", {
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "delete-error",
        title: t("notif.error"),
        description:
          err.message ||
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
        title: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("certifications.title"),
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
          t("notif.toggleFailed", { entity: t("certifications.title") }),
        placement: "bottomRight",
      });
    }
  };

  /** Unduh template XLS untuk import massal certifications. */
  const handleDownloadTemplate = () => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet([
        XLS_COLUMNS,
        [
          "AWS Solutions Architect",
          "Amazon Web Services",
          "CERTIFICATION",
          "2024-01",
          "2027-01",
          "AWS-123456",
          "https://aws.amazon.com/verification",
          "aws,cloud",
        ],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Certifications");
      XLSX.writeFile(workbook, "certifications-template.xlsx");
      notification.success({
        key: "template-success",
        title: t("notif.success"),
        description: t("notif.templateDownloaded", {
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "template-error",
        title: t("notif.error"),
        description:
          err.message ||
          t("notif.templateFailed", { entity: t("certifications.title") }),
        placement: "bottomRight",
      });
    }
  };

  /** Import massal certifications dari file XLS/XLSX/CSV. */
  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null,
      });

      if (!rows.length) throw new Error("File is empty");

      const payload = rows.map((row) => {
        const rawCategory = String(row.category ?? "")
          .trim()
          .toUpperCase();
        const category = CATEGORY_OPTIONS.includes(
          rawCategory as CertificationCategory,
        )
          ? (rawCategory as CertificationCategory)
          : DEFAULT_CATEGORY;
        return {
          title: String(row.title ?? "").trim(),
          issuer: String(row.issuer ?? "").trim(),
          category,
          issueDate: row.issue_date
            ? new Date(String(row.issue_date))
            : new Date(),
          expiryDate: row.expiry_date
            ? new Date(String(row.expiry_date))
            : null,
          credentialId: row.credential_id ?? null,
          credentialUrl: row.credential_url ?? null,
          skills: row.skills
            ? String(row.skills)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        };
      });

      const response = await fetch("/api/certifications/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "import-success",
        title: t("notif.success"),
        description: t("notif.importSuccess", {
          count: result.data?.count ?? payload.length,
          entity: t("certifications.title"),
        }),
        placement: "bottomRight",
      });
      fetchCertifications();
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "import-error",
        title: t("notif.error"),
        description:
          err.message ||
          t("notif.importFailed", { entity: t("certifications.title") }),
        placement: "bottomRight",
      });
    } finally {
      setImporting(false);
    }
    return false; // cegah auto upload antd
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
      title: t("col.category"),
      dataIndex: "category",
      key: "category",
      responsive: ["sm"],
      render: (category: string) =>
        category
          ? t(`option.certification.category.${category}`)
          : t(`option.certification.category.${DEFAULT_CATEGORY}`),
    },
    {
      title: t("col.issueDate"),
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date: string) => dayjs(date).format("MMM YYYY"),
    },
    {
      title: t("col.expiryDate"),
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string | null) =>
        date ? dayjs(date).format("MMM YYYY") : t("common.noExpiry"),
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
      fixed: "right",
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
    // Defer via microtask agar setState di dalam fetchCertifications tidak
    // dipanggil sinkron dari effect (pola yang sama dengan admin/form).
    void Promise.resolve().then(fetchCertifications);
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

        <Space wrap>
          <Button
            icon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            loading={importing}
          >
            {t("common.downloadTemplate")}
          </Button>
          <Upload
            accept=".xls,.xlsx,.csv"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => handleImport(file)}
          >
            <Button icon={<UploadIcon />} loading={importing}>
              {t("common.import")}
            </Button>
          </Upload>
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
        </Space>
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
          editingItem ? t("certifications.detail") : t("certifications.add")
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
        {...modalBodyProps()}
      >
        <FormAdmin
          formProps={{
            form,
            initialValues: { category: DEFAULT_CATEGORY },
          }}
          layout={formLayout}
          optionList={{
            skills: skillsOptions,
            category: CATEGORY_OPTIONS.map((c) => ({
              label: t(`option.certification.category.${c}`),
              value: c,
            })),
          }}
        />
      </Modal>
    </section>
  );
};

export default CertificationDecorator;
