"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import { App, Button, Form, Modal, Card, Tag, Empty, Image } from "antd";
import { useEffect, useState } from "react";
import LoaderPage from "@/components/admin/loader";
import { menuProjectType, menuRole } from "@/utils/helpers/menu";
import { skillsOptions } from "@/utils/helpers/skills";
import { getGithubRepoName } from "@/utils/helpers";
import { getImageString, getImagesArray } from "@/utils/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { FormLayout } from "@/interfaces/form";
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
  order: number;
  status: ProjectStatus;
}

/** Wrapper div sortable (dnd-kit) dengan drag handle untuk kartu project. */
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
      <Button
        type="text"
        size="small"
        className="drag-handle absolute right-2 top-2 z-10 bg-white/70 dark:bg-black/40 rounded-full shadow-sm"
        icon={<HolderOutlined />}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      />
      {children}
    </div>
  );
};

const ProjectDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();
  const PlusIcon = loadAntdIcon("PlusOutlined");
  const EditIcon = loadAntdIcon("EditOutlined");
  const SaveIcon = loadAntdIcon("SaveOutlined");
  const GithubIcon = loadAntdIcon("GithubOutlined");
  const LinkIcon = loadAntdIcon("LinkOutlined");
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
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchProjects = async () => {
    setFetching(true);
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
        message: t("notif.error"),
        description: t("notif.fetchFailed"),
        placement: "bottomRight",
      });
    } finally {
      setFetching(false);
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
    } catch (error: any) {
      notification.error({
        key: "reorder-error",
        message: t("notif.error"),
        description: error?.message || "Failed to reorder projects",
        placement: "bottomRight",
      });
      fetchProjects();
    }
  };

  const toPayload = async (values: Record<string, any>) => {
    const imageString = await getImageString(values.image);
    const imagesArray = await getImagesArray(values.images);
    return {
      title: values.title,
      subtitle: values.subtitle,
      projectType: values.project_type,
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
        message: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });

      setIsModalOpen(false);
      form.resetFields();
      fetchProjects();
      return Promise.resolve();
    } catch (error: any) {
      notification.error({
        key: "save-error",
        message: error?.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(error?.errorFields
          ? {}
          : {
              description:
                error?.message ||
                t("notif.saveFailed", { entity: t("projects.title") }),
            }),
        placement: "bottomRight",
      });
      return Promise.reject();
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
        message: t("notif.success"),
        description: t("notif.deleteSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });
    } catch (error: any) {
      notification.error({
        key: "delete-error",
        message: t("notif.error"),
        description:
          error?.message || t("notif.deleteFailed", { entity: t("projects.title") }),
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
        message: t("notif.success"),
        description: t("notif.toggleSuccess", {
          entity: t("projects.title"),
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
  };

  const getRoleLabel = (role: string) => {
    return options.role.find((r) => r.value === role)?.label || role;
  };

  const setDetailFields = (item: ProjectItem) => {
    detailForm.setFieldsValue({
      title: item.title,
      subtitle: item.subtitle,
      project_type: item.project_type,
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
    });
  };

  const handleOpenDetail = (item: ProjectItem) => {
    setSelectedItem(item);
    setDetailFields(item);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
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
      const response = await fetch(`/api/projects/${selectedItem!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      notification.success({
        key: "edit-success",
        message: t("notif.success"),
        description: t("notif.saveSuccess", { entity: t("projects.title") }),
        placement: "bottomRight",
      });

      setIsEditMode(false);
      fetchProjects();
      return Promise.resolve();
    } catch (error: any) {
      notification.error({
        key: "edit-error",
        message: error?.errorFields ? t("notif.validationError") : t("notif.error"),
        ...(error?.errorFields
          ? {}
          : {
              description:
                error?.message ||
                t("notif.saveFailed", { entity: t("projects.title") }),
            }),
        placement: "bottomRight",
      });
      return Promise.reject();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center gap-2">
                          <div className="min-w-0 pr-6">
                            <h3 className="font-semibold text-lg m-0 truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 m-0">
                              {getRoleLabel(item.role)}
                            </p>
                          </div>
                          <div>
                            <Tag
                              color={
                                item.status === "ACTIVE" ? "green" : "red"
                              }
                            >
                              {item.status === "ACTIVE"
                                ? t("common.active")
                                : t("common.inactive")}
                            </Tag>
                          </div>
                        </div>

                        {item.image && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Image
                              preview={{
                                toolbarRender: () => [],
                              }}
                              src={item.image}
                              alt={item.title}
                            />
                          </div>
                        )}

                        <div>
                          <p
                            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 text-justify m-0"
                            dangerouslySetInnerHTML={{
                              __html:
                                item.description ??
                                t("col.description") +
                                  " - " +
                                  t("common.optional"),
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap gap-y-1">
                          {item.skills?.map((skill) => (
                            <Tag key={skill}>{skill}</Tag>
                          ))}
                        </div>

                        {item.web_link && (
                          <a
                            onClick={(e) => e.stopPropagation()}
                            href={item.web_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-sm flex items-center gap-1 hover:underline truncate"
                          >
                            <LinkIcon /> {t("common.website")}
                          </a>
                        )}

                        {item.repo_links && item.repo_links.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {item.repo_links.map((link, idx) => (
                              <a
                                key={idx + 1}
                                onClick={(e) => e.stopPropagation()}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-sm flex items-center gap-1 hover:underline truncate"
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
        styles={{
          body: {
            paddingBlock: "10px",
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
      >
        <FormAdmin formProps={{ form }} layout={formLayout} optionList={options} />
      </Modal>

      <Modal
        title={
          <div className="flex justify-between items-center pr-8">
            <span>{t("projects.detail")}</span>
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
        styles={{
          body: {
            paddingBlock: "10px",
            maxHeight: "75vh",
            overflowY: "auto",
          },
        }}
      >
        <FormAdmin
          formProps={{ form: detailForm, disabled: !isEditMode }}
          layout={formLayout}
          optionList={options}
          formValue={dataDetail}
        />
      </Modal>
    </section>
  );
};

export default ProjectDecorator;
