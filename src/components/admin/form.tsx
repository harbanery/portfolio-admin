"use client";

import { ReactNode } from "react";
import { loadAntdIcon } from "@/components/custom/icon";
import Editor from "@/components/custom/editor";
import {
  Form,
  Input,
  Select,
  SelectProps,
  Tag,
  Upload,
  Button,
  FormProps,
  Space,
  Switch,
} from "antd";
import DatePicker from "antd/es/date-picker";
import { InboxOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocale } from "@/components/locale/LocaleProvider";
import {
  FieldProps,
  FormAdminProps,
  FormLayout,
  FormLayoutItem,
} from "@/interfaces/form";

const GetComponent = (
  type?: string,
  name?: any,
  value?: any,
  placeholder?: string,
  disabled?: boolean,
  Icon?: ReactNode,
  select?: SelectProps,
  uploadHint?: { hint: string; subHint: string },
  formInstance?: import("antd").FormInstance,
) => {
  let templatePlaceholder;
  switch (type) {
    case "input":
    case "textarea":
    case "editor":
      templatePlaceholder = placeholder ?? (name && "Enter " + name);
      break;
    case "select":
    case "select_multiple":
      templatePlaceholder = placeholder ?? (name && "Select " + name);
      break;
    default:
      templatePlaceholder = placeholder;
  }

  const optionRender: SelectProps["optionRender"] = (option) => {
    const { data } = option;

    return (
      <div className="flex items-center justify-stretch gap-3 font-semibold">
        {data?.Icon && <data.Icon color={data.color ?? "default"} />}
        {data.label}
      </div>
    );
  };

  const tagRender: SelectProps["tagRender"] = (props) => {
    const selected = select?.options?.find(
      (item) => item.value === props.value,
    );

    return (
      <Tag
        {...props}
        color={selected?.color ?? "default"}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          fontWeight: 600,
        }}
      >
        {selected?.Icon && <selected.Icon />}
        {props.label}
      </Tag>
    );
  };

  const labelRender: SelectProps["labelRender"] = (props) => {
    const selected = select?.options?.find(
      (item) => item.value === props.value,
    );

    return (
      <div className="flex items-center justify-stretch gap-3 font-semibold">
        {selected?.Icon && (
          <selected.Icon color={selected.color ?? "default"} />
        )}
        {selected?.label}
      </div>
    );
  };

  switch (type) {
    case "input":
      return (
        <Input
          prefix={Icon}
          placeholder={templatePlaceholder}
          disabled={disabled}
        />
      );
    case "password":
      return (
        <Input.Password
          prefix={Icon}
          placeholder={templatePlaceholder}
          disabled={disabled}
        />
      );
    case "textarea":
      return (
        <Input.TextArea
          placeholder={templatePlaceholder}
          disabled={disabled}
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      );
    case "select":
      return (
        <Select
          prefix={Icon}
          placeholder={templatePlaceholder}
          disabled={disabled}
          options={select?.options}
          optionRender={optionRender}
          labelRender={labelRender}
          allowClear
        />
      );
    case "select_multiple":
      return (
        <Select
          mode="multiple"
          allowClear
          prefix={Icon}
          placeholder={templatePlaceholder}
          disabled={disabled}
          options={select?.options}
          optionRender={optionRender}
          tagRender={tagRender}
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
                {
                  uid: info.file.uid,
                  name: info.file.name,
                  status: "done",
                  url,
                  storagePath,
                },
              ]);
            }
          }}
          onRemove={async (file) => {
            const path = (file as any).storagePath ?? file.response?.data?.storagePath;
            if (path) {
              try {
                await fetch(
                  `/api/upload?path=${encodeURIComponent(path)}`,
                  { method: "DELETE" },
                );
              } catch (e) {
                console.error("Error deleting image:", e);
              }
            }
          }}
        >
          {value && typeof value === "string" ? (
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full max-h-[200px] object-contain rounded-md"
            />
          ) : (
            <>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
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
          multiple={true}
          listType="picture-card"
          accept="image/*"
          action="/api/upload"
          beforeUpload={(file) => {
            if (file.size > 2 * 1024 * 1024) return false;
            return true;
          }}
          onRemove={async (file) => {
            const path = (file as any).storagePath ?? file.response?.data?.storagePath;
            if (path) {
              try {
                await fetch(
                  `/api/upload?path=${encodeURIComponent(path)}`,
                  { method: "DELETE" },
                );
              } catch (e) {
                console.error("Error deleting image:", e);
              }
            }
          }}
        >
          <div>
            <PlusOutlined />
          </div>
        </Upload>
      );
    case "switch":
      return <Switch disabled={disabled} />;
    case "editor":
      return <Editor placeholder={templatePlaceholder} disabled={disabled} />;
    case "date":
      return (
        <DatePicker
          disabled={disabled}
          style={{ width: "100%" }}
          placeholder={templatePlaceholder}
        />
      );
    case "date_range":
      return (
        <DatePicker.RangePicker disabled={disabled} style={{ width: "100%" }} />
      );
    default:
      return null;
  }
};

const getFieldDecorator = (props: FieldProps) => {
  const {
    name,
    label,
    value,
    type,
    placeholder,
    disabled,
    icon,
    rules,
    select,
    uploadHint,
  } = props;

  const Icon = loadAntdIcon(icon as string);
  const renderIcon = icon ? <Icon style={{ marginRight: "4px" }} /> : null;
  const component = GetComponent(
    type,
    label,
    value,
    placeholder,
    disabled,
    renderIcon,
    select,
    uploadHint,
    props.formInstance,
  );

  return {
    name,
    label,
    rules,
    style: label ? undefined : { margin: "8px 0 24px", padding: 0 },
    children: component,
  };
};

const FormAdmin = ({
  layout,
  optionList,
  formProps,
  formValue,
  customComponent,
}: FormAdminProps) => {
  const { t } = useLocale();

  const renderContactList = (item: FormLayoutItem, formProps: FormProps) => {
    const contactOptions: Array<{ label: string; value: string }> =
      (optionList?.[item.name] as Array<{ label: string; value: string }>) || [];
    const form = formProps.form;

    return (
      <Form.List key={item.name} name={item.name}>
        {(fields, { add, remove }) => {
          const usedTypes = fields
            .map((f) => form?.getFieldValue([item.name, f.name, "type"]))
            .filter(Boolean);

          return (
            <div className="flex flex-col gap-2">
              <label>{t(`form.${item.name}`)}</label>
              {fields.map(({ key, name, ...restField }) => {
                const currentType = form?.getFieldValue([
                  item.name,
                  name,
                  "type",
                ]);
                const availableOptions = contactOptions.filter(
                  (opt) =>
                    !usedTypes.includes(opt.value) || currentType === opt.value,
                );

                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row gap-2 sm:items-center"
                  >
                    <Space.Compact
                      key={key}
                      style={{ width: "100%", flex: 1 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        rules={[
                          {
                            required: true,
                            message: t("common.contactType"),
                          },
                        ]}
                        className="mb-0"
                        style={{
                          marginBottom: 0,
                          width: "160px",
                          flex: "none",
                        }}
                      >
                        {GetComponent(
                          "select",
                          [name, "type"],
                          formValue?.[item.name]?.[name]?.type,
                          `Select contact`,
                          item.disabled,
                          undefined,
                          {
                            options: availableOptions,
                          },
                        )}
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        rules={[
                          {
                            required: true,
                            message: t("common.contactValue"),
                          },
                        ]}
                        className="mb-0"
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        {GetComponent(
                          "input",
                          [name, "value"],
                          formValue?.[item.name]?.[name]?.value,
                          `Enter contact`,
                          item.disabled,
                        )}
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
                  formProps.disabled ||
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
  };

  const renderForm = (layout: FormLayout[]) =>
    layout.map((form: FormLayout) => {
      const sectionTitle = form.titleKey ? t(form.titleKey) : form.title;
      return (
        <div key={sectionTitle?.toLowerCase() ?? form.key}>
          <h2
            hidden={!sectionTitle}
            className="font-semibold text-xl py-1 m-0"
          >
            {sectionTitle}
          </h2>
          <hr
            hidden={!sectionTitle}
            className="py-1 border-neutral-500/50"
          />
          {form.items.map((item: FormLayoutItem) => {
          if (item.type === "contact_list") {
            return renderContactList(item, formProps as FormProps);
          }

          if (item.isList) {
            const Icon = loadAntdIcon(item.icon as string);
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
                          {GetComponent(
                            item.type,
                            item.name,
                            formValue?.[item.name]?.[name],
                            undefined,
                            item.disabled,
                            item.icon ? (
                              <Icon style={{ marginRight: "4px" }} />
                            ) : undefined,
                            {
                              options: optionList?.[item.name],
                            },
                          )}
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

          if (item.type === "image_upload" || item.type === "upload") {
            return (
              <Form.Item
                key={item.name}
                name={item.name}
                label={item.label ?? t(`form.${item.name}`)}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                {GetComponent(
                  item.type,
                  item.name,
                  formValue?.[item.name],
                  item.placeholder,
                  item.disabled,
                  undefined,
                  {
                    options: optionList?.[item.name],
                  },
                  {
                    hint: t("upload.hint"),
                    subHint: t("upload.subHint"),
                  },
                )}
              </Form.Item>
            );
          }

          // Handle custom component
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

          return (
            <Form.Item
              key={item.name}
              {...getFieldDecorator({
                name: item.name,
                label: item.label ?? t(`form.${item.name}`),
                value: formValue?.[item.name],
                type: item.type,
                placeholder: item.placeholder,
                icon: item.icon,
                disabled: formProps?.disabled || item.disabled,
                rules: item.required
                  ? [
                      ...(item.rules ?? []),
                      {
                        required: true,
                        message: t("validation.required", {
                          field: item.label ?? t(`form.${item.name}`),
                        }),
                      },
                    ]
                  : item.rules,
                select: {
                  options: optionList?.[item.name],
                },
                uploadHint: {
                  hint: t("upload.hint"),
                  subHint: t("upload.subHint"),
                },
                formInstance: formProps?.form,
              })}
            />
          );
        })}
        </div>
      );
    });

  return (
    <Form
      autoComplete="off"
      {...formProps}
      layout={formProps?.layout ?? "vertical"}
    >
      {renderForm(layout)}
    </Form>
  );
};

export default FormAdmin;
