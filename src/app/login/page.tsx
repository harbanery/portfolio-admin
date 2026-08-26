"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, Typography, App as AntdApp } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useLocale } from "@/components/locale/LocaleProvider";
import Image from "next/image";

/** Halaman login admin: password tunggal + sesi 12 jam (cookie httpOnly). */
export default function LoginPage() {
  const { t } = useLocale();
  const { message } = AntdApp.useApp();
  const router = useRouter();

  const [form] = Form.useForm<{ password: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Tombol generate password hanya tampil di mode development
  // (endpoint-nya pun hanya aktif saat NODE_ENV === "development").
  const isDev = process.env.NODE_ENV === "development";

  const handleLogin = async (values: { password: string }) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.password }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        message.success(t("auth.okLogin"));
        router.replace("/");
        router.refresh();
        return;
      }

      // Petakan kode error dari API ke pesan terjemahan.
      switch (result.code) {
        case "BLOCKED":
          message.error(
            t("auth.errBlocked", { minutes: result.minutes ?? 15 }),
          );
          break;
        case "NO_ADMIN":
          message.warning(t("auth.errNoAdmin"));
          break;
        case "INVALID":
          message.error(
            result.remaining > 0
              ? t("auth.errAttempts", { count: result.remaining })
              : t("auth.errInvalid"),
          );
          break;
        default:
          message.error(t("auth.errInvalid"));
      }
    } catch {
      message.error(t("notif.fetchFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePassword = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/auth/generate-password", {
        method: "POST",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        message.success(t("auth.okSent"));
        form.resetFields();
        return;
      }

      switch (result.code) {
        case "COOLDOWN":
          message.warning(
            t("auth.errCooldown", { seconds: result.seconds ?? 60 }),
          );
          break;
        case "SMTP_NOT_CONFIGURED":
          message.warning(t("auth.errSmtp"));
          break;
        case "SEND_FAILED":
          message.error(t("auth.errSend"));
          break;
        default:
          message.error(t("auth.errSend"));
      }
    } catch {
      message.error(t("notif.fetchFailed"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Card
        className="w-full max-w-md shadow-lg"
        styles={{ body: { padding: "32px 28px" } }}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ backgroundColor: "#000000", color: "#fff" }}
          >
            <Image
              src="/logo.png"
              alt="Logo"
              priority
              width={50}
              height={50}
              className="object-contain"
            />
            {/* </div> */}
          </div>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            {t("auth.title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("auth.subtitle")}
          </Typography.Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label={t("auth.password")}
            rules={[
              {
                required: true,
                message: t("validation.required", {
                  field: t("auth.password"),
                }),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ opacity: 0.5 }} />}
              placeholder={t("auth.passwordPlaceholder")}
              size="large"
              autoFocus
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
            >
              {t("auth.signIn")}
            </Button>
          </Form.Item>
        </Form>

        {isDev && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Typography.Paragraph
              type="secondary"
              style={{ fontSize: 13, marginBottom: 12 }}
            >
              {t("auth.devGenerateDesc")}
            </Typography.Paragraph>
            <Button
              icon={<MailOutlined />}
              onClick={handleGeneratePassword}
              loading={generating}
              block
            >
              {t("auth.devGenerate")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
