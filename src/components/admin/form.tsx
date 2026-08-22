"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import Editor from "@/components/custom/editor";
import {
  Form,
  Input,
  Select,
  SelectProps,
  Upload,
  Button,
  FormProps,
  Space,
  Switch,
} from "antd";
import type { NamePath } from "antd/es/form/interface";
import DatePicker from "antd/es/date-picker";
import { InboxOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocale } from "@/components/locale/LocaleProvider";
import { UploadFileLike } from "@/helpers/image";
import {
  FormAdminProps,
  FormLayout,
  FormLayoutItem,
} from "@/models/form";

/* ------------------------------------------------------------------ */
/*  Icon cache – preload once, then render from cache without hooks     */
/* ------------------------------------------------------------------ */

type IconComponent = React.ComponentType<{
  style?: React.CSSProperties;
  className?: string;
}>;

const antdIconCache: Record<string, IconComponent | null> = {};

async function ensureIcon(iconName: string): Promise<void> {
  if (antdIconCache[iconName]) return;
  try {
    const mod = (await import("@ant-design/icons")) as unknown as Record<
      string,
      IconComponent | undefined
    >;
    antdIconCache[iconName] = mod[iconName] ?? null;
  } catch {
    antdIconCache[iconName] = null;
  }
}

function getCachedIcon(iconName: string): IconComponent | null {
  return antdIconCache[iconName] ?? null;
}

/** Collect unique icon names from a layout config */
function collectIconNames(layout: FormLayout[]): string[] {
  const names = new Set<string>();
  for (const section of layout) {
    if (section.hidden) continue;
    for (const item of section.items) {
      if (item.icon) names.add(item.icon);
    }
  }
  return Array.from(names);
}

/** Ambil storagePath dari file hasil upload antd (lokal atau response). */
function getStoragePath(file: unknown): string | null {
  if (!file || typeof file !== "object") return null;
  const f = file as UploadFileLike;
  return f.storagePath ?? f.response?.data?.storagePath ?? null;
}

/* ------------------------------------------------------------------ */
/*  Field render helper – returns JSX, NOT a component                  */
/* ------------------------------------------------------------------ */

interface RenderFieldParams {
  type?: string;
  name?: NamePath;
  value?: unknown;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  select?: SelectProps;
  accept?: string;
  uploadHint?: { hint: string; subHint: string };
  formInstance?: import("antd").FormInstance;
}

function renderField(params: RenderFieldParams): ReactNode {
  const {
    type,
    name,
    value,
    placeholder,
    disabled,
    icon,
    select,
    accept,
    uploadHint,
    formInstance,
  } = params;

  let tpl: string | undefined;
  switch (type) {
    case "input":
    case "textarea":
    case "editor":
      tpl = placeholder ?? (name && `Enter ${name}`);
      break;
    case "select":
    case "select_multiple":
      tpl = placeholder ?? (name && `Select ${name}`);
      break;
    default:
      tpl = placeholder;
  }

  /* Resolve icon prefix from cache (no hooks) */
  const IconComp = icon ? getCachedIcon(icon) : null;
  const prefixNode = IconComp ? <IconComp style={{ marginRight: 4 }} /> : null;

  switch (type) {
    case "input":
      return <Input prefix={prefixNode} placeholder={tpl} disabled={disabled} />;
    case "number":
      return <Input type="number" prefix={prefixNode} placeholder={tpl} disabled={disabled} />;
    case "password":
      return <Input.Password prefix={prefixNode} placeholder={tpl} disabled={disabled} />;
    case "textarea":
      return (
        <Input.TextArea placeholder={tpl} disabled={disabled} autoSize={{ minRows: 3, maxRows: 6 }} />
      );
    case "select":
      return (
        <Select prefix={prefixNode} placeholder={tpl} disabled={disabled} options={select?.options} allowClear />
      );
    case "select_multiple":
      return (
        <Select
          mode="multiple"
          allowClear
          prefix={prefixNode}
          placeholder={tpl}
          disabled={disabled}
          options={select?.options}
        />
      );
    case "upload":
      return (
        <Upload.Dragger
          name={typeof name === "string" ? name : undefined}
          disabled={disabled}
          multiple={false}
          maxCount={1}
          accept={accept ?? "image/*"}
          listType="picture"
          action="/api/upload"
          beforeUpload={(file) => {
            if (file.size > 2 * 1024 * 1024) return false;
            return true;
          }}
          onChange={(info) => {
            if (info.file.status === "done" && info.file.response?.success) {
              const url = info.file.response.data.url;
              const storagePath = info.file.response.data.storagePath;
              formInstance?.setFieldValue(name, [
                { uid: info.file.uid, name: info.file.name, status: "done", url, storagePath },
              ]);
            }
          }}
          onRemove={async (file) => {
            const path = getStoragePath(file);
            if (path) {
              try {
                await fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" });
              } catch (e) {
                console.error("Error deleting image:", e);
              }
            }
          }}
        >
          {value && typeof value === "string" ? (
            <img src={value} alt="Uploaded" className="w-full h-full max-h-50 object-contain rounded-md" />
          ) : (
            <>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">{uploadHint?.hint}</p>
              <p className="ant-upload-hint">{uploadHint?.subHint}</p>
            </>
          )}
        </Upload.Dragger>
      );
    case "file_upload":
      return (
        <Upload.Dragger
          name={typeof name === "string" ? name : undefined}
          disabled={disabled}
          multiple={false}
          maxCount={1}
          accept={accept ?? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
          action="/api/upload"
          beforeUpload={(file) => {
            if (file.size > 10 * 1024 * 1024) return false;
            return true;
          }}
          onChange={(info) => {
            if (info.file.status === "done" && info.file.response?.success) {
              const url = info.file.response.data.url;
              const storagePath = info.file.response.data.storagePath;
              formInstance?.setFieldValue(name, [
                { uid: info.file.uid, name: info.file.name, status: "done", url, storagePath },
              ]);
            }
          }}
          onRemove={async (file) => {
            const path = getStoragePath(file);
            if (path) {
              try {
                await fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" });
              } catch (e) {
                console.error("Error deleting file:", e);
              }
            }
          }}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">{uploadHint?.hint}</p>
          <p className="ant-upload-hint">{uploadHint?.subHint}</p>
        </Upload.Dragger>
      );
    case "image_upload":
      return (
        <Upload
          name={typeof name === "string" ? name : undefined}
          disabled={disabled}
          multiple
          listType="picture-card"
          accept="image/*"
          action="/api/upload"
          beforeUpload={(file) => {
            if (file.size > 2 * 1024 * 1024) return false;
            return true;
          }}
          onRemove={async (file) => {
            const path = getStoragePath(file);
            if (path) {
              try {
                await fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" });
              } catch (e) {
                console.error("Error deleting image:", e);
              }
            }
          }}
        >
          <div><PlusOutlined /></div>
        </Upload>
      );
    case "switch":
      return <Switch disabled={disabled} />;
    case "editor":
      return <Editor placeholder={tpl} disabled={disabled} />;
    case "date":
      return <DatePicker disabled={disabled} style={{ width: "100%" }} placeholder={tpl} />;
    case "month":
      return <DatePicker picker="month" disabled={disabled} style={{ width: "100%" }} placeholder={tpl} />;
    case "date_range":
      return <DatePicker.RangePicker disabled={disabled} style={{ width: "100%" }} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  FormAdmin component                                                */
/* ------------------------------------------------------------------ */


const FormAdmin = ({
  layout,
  optionList,
  formProps,
  customComponent,
}: FormAdminProps) => {
  const { t } = useLocale();
  /* State hanya untuk memicu re-render setelah ikon selesai dimuat. */
  const [, setIconsReady] = useState(false);

  const form = Form.useFormInstance();

  /* Preload all icons needed by the layout so renderField can use the cache.
     Promise.all selalu async (termasuk untuk daftar kosong) sehingga
     setState tidak pernah dipanggil sinkron dalam effect. */
  useEffect(() => {
    let cancelled = false;
    const iconNames = collectIconNames(layout);
    Promise.all(iconNames.map(ensureIcon)).then(() => {
      if (!cancelled) setIconsReady(true);
    });
    return () => { cancelled = true; };
  }, [layout]);

  const renderContactList = useCallback(
    (item: FormLayoutItem, fp: FormProps) => {
      const contactOptions: Array<{ label: string; value: string }> =
        (optionList?.[item.name] as unknown as Array<
          { label: string; value: string }
        >) ?? [];
      const f = fp.form;

      return (
        <Form.List key={item.name} name={item.name}>
          {(fields, { add, remove }) => {
            const usedTypes = fields
              .map((fi) => f?.getFieldValue([item.name, fi.name, "type"]))
              .filter(Boolean);

            return (
              <div className="flex flex-col gap-2">
                <label>{t(`form.${item.name}`)}</label>
                {fields.map(({ key, name, ...restField }) => {
                  const currentType = f?.getFieldValue([item.name, name, "type"]);
                  const availableOptions = contactOptions.filter(
                    (opt) => !usedTypes.includes(opt.value) || currentType === opt.value,
                  );

                  return (
                    <div key={key} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Space.Compact style={{ width: "100%", flex: 1 }}>
                        <Form.Item
                          {...restField}
                          name={[name, "type"]}
                          rules={[{ required: true, message: t("common.contactType") }]}
                          className="mb-0"
                          style={{ marginBottom: 0, width: "160px", flex: "none" }}
                        >
                          {renderField({
                            type: "select",
                            name,
                            placeholder: "Select contact",
                            disabled: item.disabled,
                            select: { options: availableOptions },
                          })}
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          rules={[{ required: true, message: t("common.contactValue") }]}
                          className="mb-0"
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          {renderField({
                            type: "input",
                            name,
                            placeholder: "Enter contact",
                            disabled: item.disabled,
                          })}
                        </Form.Item>
                      </Space.Compact>

                      <Button
                        danger
                        disabled={item.disabled}
                        onClick={() => remove(name)}
                        icon={<DeleteOutlined />}
                      />
                    </div>
                  );
                })}
                <Button
                  type="dashed"
                  disabled={
                    item.disabled ||
                    fp.disabled ||
                    usedTypes.length >= contactOptions.length
                  }
                  onClick={() => add({ value: "" })}
                  icon={<PlusOutlined />}
                  block
                  style={{ margin: "0 0 24px" }}
                >
                  {usedTypes.length >= contactOptions.length
                    ? t("common.allContactsAdded")
                    : t("common.addContact")}
                </Button>
              </div>
            );
          }}
        </Form.List>
      );
    },
    [optionList, t],
  );

  /** Render daftar bahasa (nama + tingkat kemampuan), mirip contact_list. */
  const renderLanguageList = useCallback(
    (item: FormLayoutItem, fp: FormProps) => {
      const proficiencyOptions: Array<{ label: string; value: string }> =
        (optionList?.[item.name] as unknown as Array<
          { label: string; value: string }
        >) ?? [];

      return (
        <Form.List key={item.name} name={item.name}>
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-2">
              <label>{t(`form.${item.name}`)}</label>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row gap-2 sm:items-center"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: t("common.languageName") },
                    ]}
                    className="mb-0"
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    {renderField({
                      type: "input",
                      name,
                      placeholder: t("common.languageName"),
                      disabled: item.disabled,
                    })}
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "level"]}
                    rules={[
                      { required: true, message: t("common.languageLevel") },
                    ]}
                    className="mb-0"
                    style={{ marginBottom: 0, width: "200px", flex: "none" }}
                  >
                    {renderField({
                      type: "select",
                      name,
                      placeholder: t("common.languageLevel"),
                      disabled: item.disabled,
                      select: { options: proficiencyOptions },
                    })}
                  </Form.Item>
                  <Button
                    danger
                    disabled={item.disabled}
                    onClick={() => remove(name)}
                    icon={<DeleteOutlined />}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                disabled={item.disabled || fp.disabled}
                onClick={() => add({ level: "PROFESSIONAL" })}
                icon={<PlusOutlined />}
                block
                style={{ margin: "0 0 24px" }}
              >
                {t("common.addLanguage")}
              </Button>
            </div>
          )}
        </Form.List>
      );
    },
    [optionList, t],
  );

  /** Render item form standar (dipakai langsung atau dalam wrapper kondisional). */
  const renderStandardField = useCallback(
    (item: FormLayoutItem) => (
      <Form.Item
        name={item.name}
        label={item.label ?? t(`form.${item.name}`)}
        /* Switch menggunakan prop `checked`, bukan `value`. */
        valuePropName={item.type === "switch" ? "checked" : undefined}
        rules={
          item.required
            ? [
                ...(item.rules ?? []),
                {
                  required: true,
                  message: t("validation.required", {
                    field: item.label ?? t(`form.${item.name}`),
                  }),
                },
              ]
            : item.rules
        }
      >
        {renderField({
          type: item.type,
          name: item.name,
          placeholder: item.placeholder,
          icon: item.icon,
          disabled: (formProps as FormProps)?.disabled || item.disabled,
          select: { options: optionList?.[item.name] },
          uploadHint: {
            hint: t("upload.hint"),
            subHint: t("upload.subHint"),
          },
          formInstance: (formProps as FormProps)?.form,
        })}
      </Form.Item>
    ),
    [t, optionList, formProps],
  );

  const renderForm = (formLayout: FormLayout[]) =>
    formLayout
      .filter((section) => !section.hidden)
      .map((section) => {
        const sectionTitle = section.titleKey ? t(section.titleKey) : section.title;
        return (
          <div key={sectionTitle?.toLowerCase() ?? section.key}>
            <h2 hidden={!sectionTitle} className="font-semibold text-xl py-1 m-0">
              {sectionTitle}
            </h2>
            <hr hidden={!sectionTitle} className="py-1 border-neutral-500/50" />
            {section.items.map((item: FormLayoutItem) => {
              /* ---- contact list ---- */
              if (item.type === "contact_list") {
                return renderContactList(item, formProps as FormProps);
              }

              /* ---- language list ---- */
              if (item.type === "language_list") {
                return renderLanguageList(item, formProps as FormProps);
              }

              /* ---- repeatable list ---- */
              if (item.isList) {
                return (
                  <Form.List key={item.name} name={item.name}>
                    {(fields, { add, remove }) => (
                      <div className="flex flex-col gap-2">
                        <label>{item.label ?? t(`form.${item.name}`)}</label>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} className="flex gap-2">
                            <Form.Item
                              {...restField}
                              name={name}
                              rules={[
                                {
                                  required: item.required,
                                  message: t("validation.required", {
                                    field: item.label ?? t(`form.${item.name}`),
                                  }),
                                },
                              ]}
                              className="!mb-0 flex-1"
                            >
                              {renderField({
                                type: item.type,
                                name: item.name,
                                icon: item.icon,
                                disabled: item.disabled,
                                select: { options: optionList?.[item.name] },
                              })}
                            </Form.Item>
                            <Button
                              danger
                              disabled={item.disabled}
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                            />
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          disabled={item.disabled}
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          block
                          style={{ margin: "0 0 24px" }}
                        >
                          {t("common.addField", {
                            field: item.label ?? t(`form.${item.name}`),
                          })}
                        </Button>
                      </div>
                    )}
                  </Form.List>
                );
              }

              /* ---- upload fields ---- */
              if (
                item.type === "image_upload" ||
                item.type === "upload" ||
                item.type === "file_upload"
              ) {
                const isFileUpload = item.type === "file_upload";
                return (
                  <Form.Item
                    key={item.name}
                    name={item.name}
                    label={item.label ?? t(`form.${item.name}`)}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) return e;
                      return e?.fileList;
                    }}
                  >
                    {renderField({
                      type: item.type,
                      name: item.name,
                      placeholder: item.placeholder,
                      disabled: item.disabled,
                      accept: item.accept,
                      select: { options: optionList?.[item.name] },
                      uploadHint: {
                        hint: t(
                          isFileUpload ? "upload.fileHint" : "upload.hint",
                        ),
                        subHint: t(
                          isFileUpload ? "upload.fileSubHint" : "upload.subHint",
                        ),
                      },
                    })}
                  </Form.Item>
                );
              }

              /* ---- custom component ---- */
              if (customComponent && customComponent[item.name]) {
                return (
                  <Form.Item
                    key={item.name}
                    name={item.name}
                    label={item.label ?? t(`form.${item.name}`)}
                  >
                    {customComponent[item.name]}
                  </Form.Item>
                );
              }

              /* ---- conditional field (hiddenWhen) ---- */
              if (item.hiddenWhen) {
                const cond = item.hiddenWhen;
                return (
                  <Form.Item
                    key={item.name}
                    noStyle
                    shouldUpdate={(prev, cur) => prev[cond.field] !== cur[cond.field]}
                  >
                    {({ getFieldValue }) => {
                      const val = getFieldValue(cond.field);
                      const hidden =
                        cond.equals !== undefined
                          ? val === cond.equals
                          : val !== cond.notEquals;
                      return hidden ? null : renderStandardField(item);
                    }}
                  </Form.Item>
                );
              }

              /* ---- standard field ---- */
              return (
                <div key={item.name}>{renderStandardField(item)}</div>
              );
            })}
          </div>
        );
      });

  return (
    <Form
      autoComplete="off"
      form={formProps?.form ?? form}
      disabled={(formProps as FormProps)?.disabled}
      layout={(formProps as FormProps)?.layout ?? "vertical"}
      initialValues={(formProps as FormProps)?.initialValues}
    >
      {renderForm(layout)}
    </Form>
  );
};

export default FormAdmin;
