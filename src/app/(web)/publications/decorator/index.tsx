"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import { App, Button, Form, Modal, Card, Tag, Empty, Typography } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LoaderPage from "@/components/admin/loader";
import { modalBodyProps } from "@/helpers/modal";
import { asAppError } from "@/helpers/error";
import { menuPublicationType } from "@/helpers/menu";
import { skillsOptions } from "@/helpers/skills";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/models/form";

export type PublicationStatus = "ACTIVE" | "NONACTIVE";
export type PublicationType = "JOURNAL" | "CONFERENCE" | "BOOK" | "PREPRINT" | "OTHER";

interface PublicationItem {
  id: number;
  title: string;
  authors: string[];
  publication_type: PublicationType;
  publisher?: string | null;
  journal_name?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  url?: string | null;
  pdf_url?: string | null;
  scholar_url?: string | null;
  abstract?: string | null;
  publish_date: string;
  citations: number;
  skills: string[];
  status: PublicationStatus;
}

interface PublicationFormValues {
  title: string;
  authors?: string[];
  publication_type?: PublicationType;
  publisher?: string | null;
  journal_name?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  url?: string | null;
  pdf_url?: string | null;
  scholar_url?: string | null;
  abstract?: string | null;
  publish_date?: dayjs.Dayjs;
  citations?: string | number;
  skills?: string[];
}

const PlusIcon = loadAntdIcon("PlusOutlined");
const DeleteIcon = loadAntdIcon("DeleteOutlined");
const CheckIcon = loadAntdIcon("CheckOutlined");
const StopIcon = loadAntdIcon("StopOutlined");
const LinkIcon = loadAntdIcon("LinkOutlined");

const PublicationDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();

  const [form] = Form.useForm<PublicationFormValues>();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<PublicationItem[]>([]);
  const [editingItem, setEditingItem] = useState<PublicationItem | null>(null);

  const publicationTypeOptions = menuPublicationType.map((p) => ({
    label: t(`option.publication.${p.value}`),
    value: p.value,
  }));

  const publicationTypeLabel = (type: PublicationType) =>
    t(`option.publication.${type}`);

  /** Ambil teks polos dari HTML abstrak (untuk clamping yang rapi). */
  const plainAbstract = (html?: string | null) =>
    html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

  const fetchPublications = async () => {
    try {
      const response = await fetch("/api/publications");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data as PublicationItem[]);
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
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

  const toPayload = (values: PublicationFormValues) => ({
    title: values.title,
    authors: values.authors || [],
    publicationType: values.publication_type ?? "JOURNAL",
    publisher: values.publisher,
    journalName: values.journal_name,
    volume: values.volume,
    issue: values.issue,
    pages: values.pages,
    doi: values.doi,
    url: values.url,
    pdfUrl: values.pdf_url,
    scholarUrl: values.scholar_url,
    abstract: values.abstract,
    publishDate: values.publish_date?.toISOString(),
    citations: values.citations ? Number(values.citations) : 0,
    skills: values.skills || [],
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: PublicationItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      authors: item.authors,
      publication_type: item.publication_type,
      publisher: item.publisher,
      journal_name: item.journal_name,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      doi: item.doi,
      url: item.url,
      pdf_url: item.pdf_url,
      scholar_url: item.scholar_url,
      abstract: item.abstract,
      publish_date: item.publish_date ? dayjs(item.publish_date) : undefined,
      citations: item.citations,
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
          ? `/api/publications/${editingItem.id}`
          : "/api/publications",
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
          entity: t("publications.title"),
        }),
        placement: "bottomRight",
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchPublications();
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
                t("notif.saveFailed", { entity: t("publications.title") }),
            }),
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchPublications();
      notification.success({
        key: "delete-success",
        title: t("notif.success"),
        description: t("notif.deleteSuccess", {
          entity: t("publications.title"),
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
          t("notif.deleteFailed", { entity: t("publications.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: PublicationStatus,
  ) => {
    const newStatus: PublicationStatus =
      currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchPublications();
      notification.success({
        key: "toggle-status-success",
        title: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("publications.title"),
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
          t("notif.toggleFailed", { entity: t("publications.title") }),
        placement: "bottomRight",
      });
    }
  };

  useEffect(() => {
    // Defer via microtask agar setState di dalam fetchPublications tidak
    // dipanggil sinkron dari effect (pola yang sama dengan admin/form).
    void Promise.resolve().then(fetchPublications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("publications.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("publications.description")}
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
          {t("publications.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <Empty description={t("publications.empty")} />
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
                          entity: t("publications.title"),
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
                          entity: t("publications.title"),
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
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg m-0 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.journal_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 m-0 truncate">
                          {item.journal_name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Tag color="geekblue">
                        {publicationTypeLabel(item.publication_type)}
                      </Tag>
                      <Tag color={item.status === "ACTIVE" ? "green" : "red"}>
                        {item.status === "ACTIVE"
                          ? t("common.active")
                          : t("common.inactive")}
                      </Tag>
                    </div>
                  </div>

                  <Typography.Text type="secondary" className="text-sm">
                    {dayjs(item.publish_date).format("MMM YYYY")}
                    {item.publisher ? ` - ${item.publisher}` : ""}
                  </Typography.Text>

                  {item.authors && item.authors.length > 0 && (
                    <Typography.Text className="text-sm line-clamp-1">
                      {item.authors.join(", ")}
                    </Typography.Text>
                  )}

                  {item.abstract && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 m-0">
                      {plainAbstract(item.abstract)}
                    </p>
                  )}

                  {((item.doi || item.citations > 0) ||
                    (item.skills && item.skills.length > 0)) && (
                    <div className="flex flex-wrap gap-1 items-center">
                      {item.doi && (
                        <Tag color="blue" className="m-0">
                          DOI: {item.doi}
                        </Tag>
                      )}
                      {item.citations > 0 && (
                        <Tag color="orange" className="m-0">
                          {t("col.citations")}: {item.citations}
                        </Tag>
                      )}
                      {item.skills?.map((skill) => (
                        <Tag key={skill} className="m-0">
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  )}

                  {(item.url || item.pdf_url || item.scholar_url) && (
                    <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon /> {t("col.url")}
                        </a>
                      )}
                      {item.pdf_url && (
                        <a
                          href={item.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon /> PDF
                        </a>
                      )}
                      {item.scholar_url && (
                        <a
                          href={item.scholar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon /> Google Scholar
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={
          editingItem ? t("publications.detail") : t("publications.add")
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
            initialValues: { publication_type: "JOURNAL", citations: 0 },
          }}
          layout={formLayout}
          optionList={{
            publication_type: publicationTypeOptions,
            skills: skillsOptions,
          }}
        />
      </Modal>
    </section>
  );
};

export default PublicationDecorator;
