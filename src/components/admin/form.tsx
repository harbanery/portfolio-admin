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
import DatePicker from "antd/es/date-picker";
import { InboxOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocale } from "@/components/locale/LocaleProvider";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import {
  FormAdminProps,
  FormLayout,
  FormLayoutItem,
} from "@/models/form";

/* ------------------------------------------------------------------ */
/*  Icon cache – preload once, then render from cache without hooks     */
/* ------------------------------------------------------------------ */

const antdIconCache: Record<string, React.ComponentType<any> | null> = {};

async function ensureIcon(iconName: string): Promise<void> {
  if (antdIconCache[iconName]) return;
  try {
    const mod = await import("@ant-design/icons");
    antdIconCache[iconName] =
      (mod as any)[iconName] ?? null;
  } catch {
    antdIconCache[iconName] = null;
  }
}

function getCachedIcon(iconName: string): React.ComponentType<any> | null {
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

/* ------------------------------------------------------------------ */
/*  Field render helper – returns JSX, NOT a component                  */
/* ------------------------------------------------------------------ */

interface RenderFieldParams {
  type?: string;
  name?: any;
  value?: any;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  select?: SelectProps;
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
          name={name}
          disabled={disabled}
          multiple={false}
          maxCount={1}
          accept="image/*"
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
            const path =
              (file as any).storagePath ?? file.response?.data?.storagePath;
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
    case "image_upload":
      return (
        <Upload
          name={name}
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
            const path =
              (file as any).storagePath ?? file.response?.data?.storagePath;
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
  formValue,
  customComponent,
}: FormAdminProps) => {
  const { t } = useLocale();
  const { mode, hydrated } = useThemeMode();
  const isDark = hydrated && mode === "dark";
  const [iconsReady, setIconsReady] = useState(false);

  const form = Form.useFormInstance();

  /* Preload all icons needed by the layout so renderField can use the cache */
  useEffect(() => {
    let cancelled = false;
    const iconNames = collectIconNames(layout);
    if (iconNames.length === 0) {
      setIconsReady(true);
      return;
    }
    Promise.all(iconNames.map(ensureIcon)).then(() => {
      if (!cancelled) setIconsReady(true);
    });
    return () => { cancelled = true; };
  }, [layout]);

  /* Re-render after icons are ready */
  useEffect(() => {
    if (iconsReady) {
      // Trigger re-render so cached icons appear in fields
    }
  }, [iconsReady]);

  const renderContactList = useCallback(
    (item: FormLayoutItem, fp: FormProps, dark: boolean) => {
      const contactOptions: Array<{ label: string; value: string }> =
        (optionList?.[item.name] as Array<{ label: string; value: string }>) ?? [];
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
                return renderContactList(item, formProps as FormProps, isDark);
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
              if (item.type === "image_upload" || item.type === "upload") {
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
                      select: { options: optionList?.[item.name] },
                      uploadHint: {
                        hint: t("upload.hint"),
                        subHint: t("upload.subHint"),
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

              /* ---- standard field ---- */
              return (
                <Form.Item
                  key={item.name}
                  name={item.name}
                  label={item.label ?? t(`form.${item.name}`)}
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
    >
      {renderForm(layout)}
    </Form>
  );
};

export default FormAdmin;
