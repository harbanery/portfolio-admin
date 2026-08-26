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
import { menuContactType, menuOpenToRoles } from "@/helpers/menu";
import { FormLayout } from "@/models/form";

const AVAILABILITY_OPTIONS = [
  "AVAILABLE",
  "ONLY_FREELANCE",
  "NOT_AVAILABLE",
] as const;

/** Tingkat kemampuan bahasa yang didukung. */
const LANGUAGE_LEVEL_OPTIONS = ["NATIVE", "PROFESSIONAL", "LIMITED"] as const;

interface PersonalItem {
  id: number;
  name: string;
  about?: string | null;
  availability?: string;
  open_to?: string[];
  skills: string[];
  priority_skills?: string[];
  languages?: Array<{ name: string; level: string }> | null;
  contacts?: Array<{ type: string; value: string }> | null;
  PersonalImage: Array<{ id: number; url: string }>;
}

interface PersonalFormValues {
  name: string;
  about?: string | null;
  availability?: string;
  open_to?: string[];
  skills?: string[];
  priority_skills?: string[];
  languages?: Array<{ name: string; level: string }>;
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

  // Pantau nilai skills agar opsi priority_skills hanya berisi skill
  // yang sudah dipilih (bukan seluruh master skills).
  // Catatan: nilai watch ini HANYA untuk menghitung opsi (derived state).
  // Sinkronisasi nilai priority_skills dilakukan lewat onValuesChange
  // agar tidak pernah terpicu oleh form.setFieldsValue saat fetch data
  // (penyebab nilai prioritas terhapus di production).
  const selectedSkills = Form.useWatch("skills", form) ?? [];

  /**
   * Buang prioritas yang skill-nya sudah tidak dipilih lagi.
   * Hanya dipanggil dari onValuesChange (interaksi user), bukan dari
   * perubahan store akibat setFieldsValue.
   */
  const syncPrioritySkills = (skills: string[] | undefined) => {
    const current = form.getFieldValue("priority_skills");
    if (!Array.isArray(current) || current.length === 0) return;
    const next = Array.isArray(skills)
      ? current.filter((p) => skills.includes(p))
      : [];
    if (next.length !== current.length) {
      form.setFieldValue("priority_skills", next);
    }
  };

  const options = {
    skills: skillsOptions,
    // Hanya skill terpilih yang bisa dijadikan prioritas.
    priority_skills: skillsOptions.filter((opt) =>
      selectedSkills.includes(String(opt.value)),
    ),
    availability: AVAILABILITY_OPTIONS.map((v) => ({
      label: t(`option.availability.${v}`),
      value: v,
    })),
    open_to: menuOpenToRoles.map((role) => ({
      label: role,
      value: role,
    })),
    languages: LANGUAGE_LEVEL_OPTIONS.map((v) => ({
      label: t(`option.language.level.${v}`),
      value: v,
    })),
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
        form.setFieldsValue({
          name: personal.name,
          about: personal.about,
          availability: personal.availability ?? "AVAILABLE",
          open_to: personal.open_to ?? [],
          skills: personal.skills,
          priority_skills: personal.priority_skills ?? [],
          languages: personal.languages ?? undefined,
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

          // Pengaman: pastikan prioritas hanya berisi skill terpilih.
          const prioritySkills = (values.priority_skills ?? []).filter(
            (p) => (values.skills ?? []).includes(p),
          );

          // Kirim contacts apa adanya; API menyimpan sebagai Json.
          const response = await fetch("/api/personal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              about: values.about,
              availability: values.availability || "AVAILABLE",
              openTo: values.open_to || [],
              skills: values.skills || [],
              prioritySkills,
              languages: values.languages || null,
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
        <FormAdmin
          formProps={{
            form,
            initialValues: { availability: "AVAILABLE" },
            onValuesChange: (changed) => {
              // Hanya interaksi user (deselect skill) yang memicu
              // pembersihan priority_skills — setFieldsValue saat fetch
              // tidak pernah masuk ke sini.
              if ("skills" in changed) syncPrioritySkills(changed.skills);
            },
          }}
          layout={formLayout}
          optionList={options}
          uploadFolder="personal"
        />
      </Card>
    </section>
  );
};

export default PersonalDecorator;
