"use client";

import FormAdmin from "@/components/admin/form";
import { loadAntdIcon } from "@/components/custom/icon";
import { App, Button, Card, Form } from "antd";
import { useEffect, useState } from "react";
import LoaderPage from "@/components/admin/loader";
import { asAppError } from "@/helpers/error";
import { getImagesArray } from "@/helpers/image";
import { useLocale } from "@/components/locale/LocaleProvider";
import { skillsOptions } from "@/helpers/skills";
import { menuContactType } from "@/helpers/menu";
import { FormLayout } from "@/models/form";

interface PersonalItem {
  id: number;
  name: string;
  about?: string | null;
  skills: string[];
  contacts?: Array<{ type: string; value: string }> | null;
  PersonalImage: Array<{ id: number; url: string }>;
}

interface PersonalFormValues {
  name: string;
  about?: string | null;
  skills?: string[];
  contacts?: Array<{ type: string; value: string }>;
  images?: unknown;
}

const SaveIcon = loadAntdIcon("SaveOutlined");

const PersonalDecorator = ({ formLayout }: { formLayout: FormLayout[] }) => {
  const { t } = useLocale();

  const [form] = Form.useForm<PersonalFormValues>();
  const { notification, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existing, setExisting] = useState<PersonalItem | null>(null);

  const options = {
    skills: skillsOptions,
    contacts: menuContactType.map((c) => ({
      label: t(`option.contact.${c.value}`),
      value: c.value,
    })),
  };

  const fetchPersonal = async () => {
    try {
      const response = await fetch("/api/personal");
      const result = await response.json();
      if (result.success && result.data) {
        const personal = result.data as PersonalItem;
        setExisting(personal);
        form.setFieldsValue({
          name: personal.name,
          about: personal.about,
          skills: personal.skills,
          contacts: personal.contacts ?? undefined,
          images: personal.PersonalImage?.map((img) => ({
            url: img.url,
            thumbUrl: img.url,
            status: "done",
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching personal:", error);
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

  const handleSave = () => {
    modal.confirm({
      title: t("notif.confirmSave"),
      okText: t("common.yes"),
      cancelText: t("common.no"),
      onOk: async () => {
        setLoading(true);
        try {
          const values = await form.validateFields();
          const imagesArray = await getImagesArray(values.images);

          // Kirim contacts apa adanya; API menyimpan sebagai Json.
          const response = await fetch("/api/personal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              about: values.about,
              skills: values.skills || [],
              contacts: values.contacts || null,
              imageUrls: imagesArray,
            }),
          });
          const result = await response.json();
          if (!result.success) throw new Error(result.error);

          notification.success({
            key: "save-success",
            title: t("notif.success"),
            description: t("notif.saveSuccess", { entity: t("personal.title") }),
            placement: "bottomRight",
          });
          fetchPersonal();
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
                    t("notif.saveFailed", { entity: t("personal.title") }),
                }),
            placement: "bottomRight",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    // Defer via microtask agar setState di dalam fetchPersonal tidak
    // dipanggil sinkron dari effect (pola yang sama dengan admin/form).
    void Promise.resolve().then(fetchPersonal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) return <LoaderPage />;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-col gap-2 w-full sm:max-w-[50%]">
          <h1 className="font-semibold text-2xl sm:text-3xl m-0">
            {t("personal.title")}
          </h1>
          <p className="font-light text-sm leading-tight">
            {t("personal.description")}
          </p>
        </div>

        <Button
          style={{ fontWeight: 600 }}
          icon={<SaveIcon />}
          variant="solid"
          color="geekblue"
          iconPlacement="end"
          size="large"
          loading={loading}
          onClick={handleSave}
        >
          {t("common.save")}
        </Button>
      </div>

      <Card variant="borderless" className="shadow-sm">
        <FormAdmin formProps={{ form }} layout={formLayout} optionList={options} />
      </Card>
    </section>
  );
};

export default PersonalDecorator;
