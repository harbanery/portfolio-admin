"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import { App, Button, Form, Modal, Card, Tag, Empty, Image } from "antd";
import { useEffect, useState } from "react";
import LoaderPage from "@/components/admin/loader";
import { modalBodyProps } from "@/helpers/modal";
import { asAppError } from "@/helpers/error";
import { menuProjectType, menuRole } from "@/helpers/menu";
import { skillsOptions } from "@/helpers/skills";
import { getGithubRepoName } from "@/helpers";
import { getImageString, getImagesArray } from "@/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/models/form";
import dayjs from "dayjs";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { HolderOutlined } from "@ant-design/icons";

export type ProjectStatus = "ACTIVE" | "NONACTIVE";

interface ProjectItem {
  id: number;
  title: string;
  subtitle?: string;
  project_type?: string;
  company_name?: string | null;
  client_name?: string | null;
  role: string;
  skills: string[];
  image: string;
  images?: string[];
  repo_links: string[];
  web_link: string | null;
  description?: string | null;
  api_documentation?: string | null;
  features?: string[];
  highlights?: string[];
  challenges?: string | null;
  solutions?: string | null;
  story?: string | null;
  outcomes?: string[];
  start_date?: string | null;
  is_ongoing: boolean;
  end_date?: string | null;
  order: number;
  status: ProjectStatus;
}

interface ProjectFormValues {
  title: string;
  subtitle?: string | null;
  project_type?: string;
  company_name?: string | null;
  client_name?: string | null;
  role: string;
  image?: unknown;
  images?: unknown;
  description?: string | null;
  api_documentation?: string | null;
  features?: string[];
  highlights?: string[];
  challenges?: string | null;
  solutions?: string | null;
  story?: string | null;
  outcomes?: string[];
  skills?: string[];
  repo_links?: string[];
  web_link?: string | null;
  start_date?: dayjs.Dayjs;
  is_ongoing?: boolean;
  end_date?: dayjs.Dayjs;
}

/**
 * Wrapper div sortable (dnd-kit) dengan drag handle terpisah dari kartu.
 * Handle diposisikan absolute di pojok kanan atas; klik pada kartu tetap
 * membuka modal karena handle memiliki listeners sendiri.
 */
const SortableItem: React.FC<{
  id: number;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        type="button"
        aria-label="Drag to reorder"
        className="drag-handle absolute right-2 top-2 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-sm transition-colors hover:text-gray-800 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-400"
        {...attributes}
        {...listeners}
      >
        <HolderOutlined />
      </button>
      {children}
    </div>
  );
};

const PlusIcon = loadAntdIcon("PlusOutlined");
const GithubIcon = loadAntdIcon("GithubOutlined");
const LinkIcon = loadAntdIcon("LinkOutlined");
const DeleteIcon = loadAntdIcon("DeleteOutlined");
const CheckIcon = loadAntdIcon("CheckOutlined");
const StopIcon = loadAntdIcon("StopOutlined");

const ProjectDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();

  const [form] = Form.useForm<ProjectFormValues>();
  const [detailForm] = Form.useForm<ProjectFormValues>();
  const dataDetail = Form.useWatch([], detailForm);
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [companyOptions, setCompanyOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const result = await response.json();
      if (result.success && result.data) {
        setProjectItems(result.data as ProjectItem[]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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

  /**
   * Opsi nama perusahaan untuk project internal, diambil dari data
   * educations (school) dan experiences (company_name).
   */
  const fetchCompanyOptions = async () => {
    try {
      const [eduRes, expRes] = await Promise.all([
        fetch("/api/educations"),
        fetch("/api/experiences"),
      ]);
      const [edu, exp] = await Promise.all([eduRes.json(), expRes.json()]);
      const names = new Set<string>();
      if (edu?.success && Array.isArray(edu.data)) {
        edu.data.forEach((e: { school?: string }) => {
          if (e.school) names.add(e.school);
        });
      }
      if (exp?.success && Array.isArray(exp.data)) {
        exp.data.forEach((e: { company_name?: string }) => {
          if (e.company_name) names.add(e.company_name);
        });
      }
      setCompanyOptions(
        Array.from(names)
          .sort((a, b) => a.localeCompare(b))
          .map((n) => ({ label: n, value: n })),
      );
    } catch (error) {
      console.error("Error fetching company options:", error);
    }
  };

  const handleAddProject = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projectItems.findIndex((i) => i.id === active.id);
    const newIndex = projectItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(projectItems, oldIndex, newIndex);
    setProjectItems(reordered);

    try {
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((item, idx) => ({ id: item.id, order: idx })),
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "reorder-error",
        title: t("notif.error"),
        description:
          err.message ||
          t("notif.reorderFailed", { entity: t("projects.title") }),
        placement: "bottomRight",
      });
      fetchProjects();
    }
  };

  const toPayload = async (values: ProjectFormValues) => {
    const imageString = await getImageString(values.image);
    const imagesArray = await getImagesArray(values.images);
    return {
      title: values.title,
      subtitle: values.subtitle,
      projectType: values.project_type,
      companyName:
        values.project_type === "internal" ? values.company_name : null,
      clientName: values.project_type === "client" ? values.client_name : null,
      role: values.role,
      image: imageString,
      images: imagesArray,
      description: values.description,
      apiDocumentation: values.api_documentation,
      features: values.features,
      highlights: values.highlights,
      challenges: values.challenges,
      solutions: values.solutions,
      story: values.story,
      outcomes: values.outcomes,
      skills: values.skills,
      repoLinks: values.repo_links || [],
      webLink: values.web_link,
      startDate: values.start_date ? values.start_date.toISOString() : null,
      isOngoing: values.is_ongoing ?? true,
      endDate: values.is_ongoing === false && values.end_date
        ? values.end_date.toISOString()
        : null,
    };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const payload = await toPayload(values);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "save-success",
        title: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });

      setIsModalOpen(false);
      form.resetFields();
      fetchProjects();
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
                t("notif.saveFailed", { entity: t("projects.title") }),
            }),
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchProjects();
      notification.success({
        key: "delete-success",
        title: t("notif.success"),
        description: t("notif.deleteSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "delete-error",
        title: t("notif.error"),
        description:
          err.message ||
          t("notif.deleteFailed", { entity: t("projects.title") }),
        placement: "bottomRight",
      });
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: ProjectStatus,
  ) => {
    const newStatus: ProjectStatus =
      currentStatus === "ACTIVE" ? "NONACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      fetchProjects();
      notification.success({
        key: "toggle-status-success",
        title: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("projects.title"),
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
          t("notif.toggleFailed", { entity: t("projects.title") }),
        placement: "bottomRight",
      });
    }
  };

  const options = {
    skills: skillsOptions,
    role: menuRole.map((r) => ({
      label: t(`option.role.${r.value}`),
      value: r.value,
    })),
    project_type: menuProjectType.map((p) => ({
      label: t(`option.project.${p.value}`),
      value: p.value,
    })),
    company_name: companyOptions,
  };

  const getRoleLabel = (role: string) => {
    return options.role.find((r) => r.value === role)?.label || role;
  };

  /** Format periode "MMM YYYY - MMM YYYY" dari tanggal dibuat/terlibat. */
  const formatPeriod = (item: ProjectItem) => {
    if (!item.start_date) return null;
    const start = dayjs(item.start_date).format("MMM YYYY");
    const end = item.is_ongoing
      ? t("common.present")
      : item.end_date
        ? dayjs(item.end_date).format("MMM YYYY")
        : "-";
    return `${start} - ${end}`;
  };

  const setDetailFields = (item: ProjectItem) => {
    /* Pastikan nilai company yang tersimpan tetap muncul di opsi select. */
    if (
      item.company_name &&
      !companyOptions.some((o) => o.value === item.company_name)
    ) {
      setCompanyOptions((prev) =>
        prev.some((o) => o.value === item.company_name)
          ? prev
          : [
              ...prev,
              { label: item.company_name!, value: item.company_name! },
            ].sort((a, b) => a.label.localeCompare(b.label)),
      );
    }

    detailForm.setFieldsValue({
      title: item.title,
      subtitle: item.subtitle,
      project_type: item.project_type,
      company_name: item.company_name,
      client_name: item.client_name,
      role: item.role,
      image: item.image
        ? [{ url: item.image, thumbUrl: item.image, status: "done" }]
        : undefined,
      images: item.images?.map((url: string) => ({
        url,
        thumbUrl: url,
        status: "done",
      })),
      description: item.description,
      api_documentation: item.api_documentation,
      features: item.features,
      highlights: item.highlights,
      challenges: item.challenges,
      solutions: item.solutions,
      story: item.story,
      outcomes: item.outcomes,
      skills: item.skills,
      repo_links: item.repo_links,
      web_link: item.web_link,
      start_date: item.start_date ? dayjs(item.start_date) : undefined,
      is_ongoing: item.is_ongoing ?? true,
      end_date: item.end_date ? dayjs(item.end_date) : undefined,
    });
  };

  const handleOpenDetail = (item: ProjectItem) => {
    setSelectedItem(item);
    setDetailFields(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
    detailForm.resetFields();
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const values = await detailForm.validateFields();
      const payload = await toPayload(values);
      const response = await fetch(`/api/projects/${selectedItem!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "edit-success",
        title: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });

      fetchProjects();
      handleCloseDetail();
    } catch (error) {
      const err = asAppError(error);
      notification.error({
        key: "edit-error",
        title: err.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(err.errorFields
          ? {}
          : {
              description:
                err.message ||
                t("notif.saveFailed", { entity: t("projects.title") }),
            }),
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer via microtask agar setState di dalam fetch tidak dipanggil
    // sinkron dari effect (pola yang sama dengan admin/form).
    void Promise.resolve().then(fetchProjects);
    void Promise.resolve().then(fetchCompanyOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("projects.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("projects.description")}
          </p>
        </div>

        <Button
          style={{ fontWeight: 600 }}
          icon={<PlusIcon />}
          variant="solid"
          color="geekblue"
          iconPlacement="end"
          size="large"
          onClick={handleAddProject}
        >
          {t("projects.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {projectItems.length === 0 ? (
          <Empty description={t("projects.empty")} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projectItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectItems.map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <Card
                      hoverable
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleOpenDetail(item)}
                      actions={[
                        <Button
                          key="toggle"
                          type="text"
                          icon={
                            item.status === "ACTIVE" ? (
                              <StopIcon />
                            ) : (
                              <CheckIcon />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            modal.confirm({
                              title: t("notif.confirmToggle", {
                                action:
                                  item.status === "ACTIVE"
                                    ? t("common.deactivate")
                                    : t("common.activate"),
                                entity: t("projects.title"),
                              }),
                              okText: t("common.yes"),
                              cancelText: t("common.no"),
                              onOk: () =>
                                handleToggleStatus(item.id, item.status),
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
                                entity: t("projects.title"),
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
                          <div className="min-w-0 flex-1 pr-8">
                            <h3 className="font-semibold text-lg m-0 truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                              <span>{getRoleLabel(item.role)}</span>
                              {(item.company_name || item.client_name) && (
                                <span className="truncate">
                                  {" - "}
                                  {item.company_name || item.client_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Tag
                              color={item.status === "ACTIVE" ? "green" : "red"}
                            >
                              {item.status === "ACTIVE"
                                ? t("common.active")
                                : t("common.inactive")}
                            </Tag>
                            {formatPeriod(item) && (
                              <Tag className="m-0">{formatPeriod(item)}</Tag>
                            )}
                          </div>
                        </div>

                        <div
                          className="aspect-video w-full overflow-hidden rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.image ? (
                            <Image
                              preview={{
                                actionsRender: () => [],
                              }}
                              src={item.image}
                              alt={item.title}
                              className="!h-full !w-full !object-cover"
                            />
                          ) : (
                            <div className="flex aspect-video h-full w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
                              <span className="text-sm text-gray-400">
                                {t("common.noImage")}
                              </span>
                            </div>
                          )}
                        </div>

                        {item.skills && item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.skills.map((skill) => (
                              <Tag key={skill} className="m-0">
                                {skill}
                              </Tag>
                            ))}
                          </div>
                        )}

                        {(item.web_link ||
                          (item.repo_links && item.repo_links.length > 0)) && (
                          <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
                            {item.web_link && (
                              <a
                                onClick={(e) => e.stopPropagation()}
                                href={item.web_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                              >
                                <LinkIcon /> {t("common.website")}
                              </a>
                            )}
                            {item.repo_links?.map((link, idx) => (
                              <a
                                key={idx + 1}
                                onClick={(e) => e.stopPropagation()}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                              >
                                <GithubIcon />{" "}
                                {getGithubRepoName(link) || link}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal
        title={t("projects.add")}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancelModal}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={loading}
        width={700}
        {...modalBodyProps()}
      >
        <FormAdmin
          formProps={{
            form,
            initialValues: { project_type: "personal", is_ongoing: true },
          }}
          layout={formLayout}
          optionList={options}
          uploadFolder="projects"
        />
      </Modal>

      <Modal
        title={t("projects.detail")}
        open={isDetailModalOpen}
        onOk={handleSaveEdit}
        onCancel={handleCloseDetail}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={loading}
        width={700}
        {...modalBodyProps()}
      >
        <FormAdmin
          formProps={{ form: detailForm }}
          layout={formLayout}
          optionList={options}
          formValue={dataDetail}
          uploadFolder="projects"
        />
      </Modal>
    </section>
  );
};

export default ProjectDecorator;
