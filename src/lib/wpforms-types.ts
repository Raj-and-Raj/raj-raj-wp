// Shape of a WPForms form as read from its rendered WordPress markup. Shared
// by the server loader and the client renderer.

export type WpFormOption = { label: string; value: string; selected?: boolean };

export type WpFormInput = {
  /** WPForms input name, e.g. `wpforms[fields][0][first]`. */
  name: string;
  kind:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "url"
    | "date"
    | "textarea"
    | "select"
    | "hidden";
  /** Sub-label for multi-part fields (e.g. "First", "Last"). */
  label?: string;
  placeholder?: string;
  required: boolean;
  multiple?: boolean;
  options?: WpFormOption[];
  defaultValue?: string;
};

export type WpFormField = {
  id: string;
  /** WPForms field type: name, email, phone, textarea, select, radio, ... */
  type: string;
  label: string;
  hideLabel: boolean;
  description?: string;
  required: boolean;
  width: "full" | "half" | "third" | "two-thirds";
  inputs: WpFormInput[];
  choices?: {
    kind: "radio" | "checkbox";
    name: string;
    options: WpFormOption[];
  };
  /** Content of HTML / section-divider fields. */
  html?: string;
};

export type WpForm = {
  formId: string;
  fields: WpFormField[];
  submitText: string;
  submittingText: string;
  /** Spam-protection features this site can't fill in (reCAPTCHA etc.). */
  unsupported: string[];
};

export type WpFormSubmitResult =
  | { ok: true; confirmationHtml?: string; redirectUrl?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
