import { FormProps, SelectProps, FormInstance } from "antd";
import type { NamePath } from "antd/es/form/interface";
import type { DefaultOptionType } from "antd/es/select";
import { Rule } from "antd/es/form";
import { ReactNode } from "react";

export interface FormAdminProps {
  layout: FormLayout[];
  formProps?: FormProps;
  optionList?: Record<string, DefaultOptionType[]>;
  formValue?: unknown;
  customComponent?: Record<string, ReactNode>;
}

export type FormLayout = {
  key?: string;
  title?: string;
  /** Translation key untuk judul section (mis. "personal.section.main"). */
  titleKey?: string;
  hidden?: boolean;
  items: FormLayoutItem[];
};

export type FormLayoutItem = {
  name: string;
  required?: boolean;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  rules?: Rule[];
  isList?: boolean;
  multiple?: boolean;
  accept?: string;
  /** Batas jumlah karakter (dipakai input, textarea, dan editor). */
  maxLength?: number;
  dependencies?: string[];
  /**
   * Sembunyikan field secara kondisional.
   * - `equals`: field disembunyikan ketika nilai `field` sama dengan `equals`.
   * - `notEquals`: field disembunyikan ketika nilai `field` tidak sama dengan `notEquals`.
   */
  hiddenWhen?: {
    field: string;
    equals?: string | boolean | number;
    notEquals?: string | boolean | number;
  };
};

export interface FieldProps {
  key?: string;
  name: NamePath;
  value?: unknown;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  rules?: Rule[];
  select?: SelectProps;
  accept?: string;
  uploadHint?: { hint: string; subHint: string };
  formInstance?: FormInstance;
}
