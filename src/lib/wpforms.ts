import { parse, type HTMLElement } from "node-html-parser";
import type {
  WpForm,
  WpFormField,
  WpFormInput,
  WpFormOption,
  WpFormSubmitResult,
} from "@/lib/wpforms-types";

const wordpressUrl = (
  process.env.WORDPRESS_URL ||
  process.env.WOOCOMMERCE_URL ||
  ""
).trim();

/** Forms the site renders, keyed by a site-side name. */
const FORM_SOURCES = {
  business: {
    // WordPress page (slug or full URL) that embeds the WPForms form.
    page: process.env.WPFORMS_BUSINESS_PAGE?.trim() || "business-enquiry",
    // WPForms form ID (Business enquiry form in wp-admin).
    formId: process.env.WPFORMS_BUSINESS_FORM_ID?.trim() || "500",
  },
} as const;

export type FormKey = keyof typeof FORM_SOURCES;

export function isFormKey(value: string): value is FormKey {
  return Object.prototype.hasOwnProperty.call(FORM_SOURCES, value);
}

type LoadedForm = {
  form: WpForm;
  /** Values WPForms expects back on submit (not sent to the browser). */
  hidden: Record<string, string>;
  ajaxUrl: string;
  pageUrl: string;
};

// ---------------------------------------------------------------------------
// Loading

async function fetchPageHtml(page: string) {
  // A full URL is scraped directly; a slug is read through the REST API,
  // whose rendered content includes the form's shortcode output.
  if (/^https?:\/\//.test(page)) {
    const res = await fetch(page, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RajAndRajSite/1.0)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Form page returned ${res.status}`);
    return { html: await res.text(), pageUrl: page };
  }

  if (!wordpressUrl) throw new Error("Missing WORDPRESS_URL");
  const params = new URLSearchParams({ slug: page, _fields: "link,content" });
  const res = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`WordPress pages API returned ${res.status}`);
  const pages = (await res.json()) as Array<{
    link?: string;
    content?: { rendered?: string };
  }>;
  const found = pages[0];
  if (!found?.content?.rendered) {
    throw new Error(`WordPress page "${page}" not found`);
  }
  return {
    html: found.content.rendered,
    pageUrl: found.link || `${wordpressUrl}/${page}/`,
  };
}

/**
 * Reads a WPForms form from the WordPress page that embeds it. Labels,
 * placeholders, required flags, choices and button text all come from the
 * form builder in wp-admin. Returns null when the form can't be loaded.
 */
export async function loadWpForm(key: FormKey): Promise<LoadedForm | null> {
  const source = FORM_SOURCES[key];
  try {
    const { html, pageUrl } = await fetchPageHtml(source.page);
    const root = parse(html);
    const formEl = source.formId
      ? root.querySelector(`form#wpforms-form-${source.formId}`)
      : root.querySelector("form.wpforms-form");
    if (!formEl) throw new Error(`No WPForms form on "${source.page}"`);

    const parsed = parseWpForm(formEl);
    if (parsed.form.unsupported.length) {
      console.warn(
        `[wpforms:${key}] Form ${parsed.form.formId} uses ${parsed.form.unsupported.join(", ")}, ` +
          "which blocks submissions from this site. Disable it in WPForms → form → Settings → Spam Protection and Security."
      );
    }
    return {
      ...parsed,
      ajaxUrl: new URL("/wp-admin/admin-ajax.php", pageUrl).toString(),
      pageUrl,
    };
  } catch (error) {
    console.warn(`[wpforms:${key}]`, error instanceof Error ? error.message : error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parsing

function text(el: HTMLElement | null | undefined) {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function fieldLabel(container: HTMLElement) {
  const label =
    container.querySelector(".wpforms-field-label") ??
    container.querySelector("legend");
  if (!label) return { label: "", hideLabel: true };
  const clone = parse(label.toString());
  clone.querySelectorAll(".wpforms-required-label").forEach((n) => n.remove());
  return {
    label: text(clone),
    hideLabel: label.classList.contains("wpforms-label-hide"),
  };
}

function widthOf(container: HTMLElement): WpFormField["width"] {
  const cls = container.classList;
  if (cls.contains("wpforms-one-half")) return "half";
  if (cls.contains("wpforms-one-third")) return "third";
  if (cls.contains("wpforms-two-thirds")) return "two-thirds";
  return "full";
}

function isRequired(el: HTMLElement) {
  return (
    el.hasAttribute("required") ||
    el.classList.contains("wpforms-field-required")
  );
}

function sublabelFor(container: HTMLElement, input: HTMLElement) {
  const id = input.getAttribute("id");
  const byFor = id
    ? container.querySelector(`label.wpforms-field-sublabel[for="${id}"]`)
    : null;
  if (byFor) return text(byFor);
  const block = input.closest(".wpforms-field-row-block");
  return block ? text(block.querySelector(".wpforms-field-sublabel")) : "";
}

function inputKind(el: HTMLElement): WpFormInput["kind"] | null {
  const tag = el.tagName.toLowerCase();
  if (tag === "textarea") return "textarea";
  if (tag === "select") return "select";
  const type = (el.getAttribute("type") || "text").toLowerCase();
  if (["text", "email", "tel", "number", "url", "date", "hidden"].includes(type)) {
    return type as WpFormInput["kind"];
  }
  return null;
}

function parseField(container: HTMLElement): WpFormField | null {
  const id = container.getAttribute("data-field-id") ?? "";
  const typeClass = container.classList.value.find(
    (c) => c.startsWith("wpforms-field-") && c !== "wpforms-field-hidden"
  );
  const type = typeClass?.replace("wpforms-field-", "") ?? "text";
  const { label, hideLabel } = fieldLabel(container);
  const description =
    text(container.querySelector(".wpforms-field-description")) || undefined;

  const base = {
    id,
    type,
    label,
    hideLabel,
    description,
    width: widthOf(container),
  };

  if (type === "html" || type === "divider" || type === "content") {
    const body =
      type === "divider"
        ? container.toString()
        : (container.querySelector(".wpforms-field-html, .wpforms-field-content-preview, div") ?? container)
            .innerHTML;
    return {
      ...base,
      label: type === "divider" ? text(container.querySelector("h3")) : label,
      required: false,
      inputs: [],
      html: type === "divider" ? description : body,
    };
  }

  const choiceInputs = container.querySelectorAll(
    'input[type="radio"], input[type="checkbox"]'
  );
  if (choiceInputs.length) {
    const kind =
      choiceInputs[0].getAttribute("type") === "checkbox" ? "checkbox" : "radio";
    const options: WpFormOption[] = choiceInputs.map((input) => {
      const li = input.closest("li");
      const optionLabel =
        text(li?.querySelector("label")) ||
        text(container.querySelector(`label[for="${input.getAttribute("id")}"]`));
      return {
        label: optionLabel || input.getAttribute("value") || "",
        value: input.getAttribute("value") ?? "",
        selected: input.hasAttribute("checked"),
      };
    });
    return {
      ...base,
      required: choiceInputs.some(isRequired) || container.querySelector(".wpforms-required-label") !== null,
      inputs: [],
      choices: {
        kind,
        name: (choiceInputs[0].getAttribute("name") ?? "").replace(/\[\]$/, ""),
        options,
      },
    };
  }

  const inputs: WpFormInput[] = [];
  container
    .querySelectorAll("input, textarea, select")
    .forEach((el) => {
      const name = el.getAttribute("name");
      const kind = inputKind(el);
      if (!name || !kind || !name.startsWith("wpforms[fields]")) return;
      const input: WpFormInput = {
        name,
        kind,
        label: sublabelFor(container, el) || undefined,
        placeholder: el.getAttribute("placeholder") || undefined,
        required: isRequired(el),
        defaultValue:
          kind === "textarea" ? el.textContent || undefined : el.getAttribute("value") || undefined,
      };
      if (kind === "select") {
        input.multiple = el.hasAttribute("multiple");
        const options = el.querySelectorAll("option");
        const placeholderOption = options.find(
          (o) => o.classList.contains("placeholder") || (o.getAttribute("value") ?? "") === ""
        );
        if (placeholderOption && !input.placeholder) {
          input.placeholder = text(placeholderOption) || undefined;
        }
        input.options = options
          .filter((o) => o !== placeholderOption)
          .map((o) => ({
            label: text(o),
            value: o.getAttribute("value") ?? text(o),
            selected: o.hasAttribute("selected"),
          }));
      }
      inputs.push(input);
    });

  if (!inputs.length) return null;
  return {
    ...base,
    required:
      inputs.some((i) => i.required) ||
      container.querySelector(".wpforms-required-label") !== null,
    inputs,
  };
}

function parseWpForm(formEl: HTMLElement): Omit<LoadedForm, "ajaxUrl" | "pageUrl"> {
  const formId =
    formEl.getAttribute("data-formid") ??
    formEl.querySelector('input[name="wpforms[id]"]')?.getAttribute("value") ??
    "";

  const fields = formEl
    .querySelectorAll(".wpforms-field-container .wpforms-field, .wpforms-field-container > .wpforms-field")
    .filter((el, index, all) => all.indexOf(el) === index)
    .map(parseField)
    .filter((field): field is WpFormField => field !== null);

  const hidden: Record<string, string> = {};
  formEl
    .querySelectorAll('.wpforms-submit-container input[type="hidden"], input[type="hidden"][name^="wpforms["]')
    .forEach((el) => {
      const name = el.getAttribute("name");
      if (name && !name.startsWith("wpforms[fields]")) {
        hidden[name] = el.getAttribute("value") ?? "";
      }
    });
  hidden["wpforms[id]"] = formId;
  const token = formEl.getAttribute("data-token");
  if (token) hidden["wpforms[token]"] = token;

  const button = formEl.querySelector("button.wpforms-submit, .wpforms-submit");
  const unsupported: string[] = [];
  const markup = formEl.toString();
  if (
    /g-recaptcha|wpforms-recaptcha-container/.test(markup) ||
    "wpforms[recaptcha]" in hidden
  ) {
    unsupported.push("reCAPTCHA");
  }
  if (/h-captcha/.test(markup)) unsupported.push("hCaptcha");
  if (/cf-turnstile/.test(markup)) unsupported.push("Turnstile");

  return {
    form: {
      formId,
      fields,
      submitText:
        button?.getAttribute("data-submit-text") || text(button) || "Submit",
      submittingText: button?.getAttribute("data-alt-text") || "Sending...",
      unsupported,
    },
    hidden,
  };
}

// ---------------------------------------------------------------------------
// Submitting

function allowedNames(form: WpForm) {
  const names = new Map<string, { multiple: boolean }>();
  form.fields.forEach((field) => {
    field.inputs.forEach((input) =>
      names.set(input.name, { multiple: Boolean(input.multiple) })
    );
    if (field.choices) {
      names.set(field.choices.name, {
        multiple: field.choices.kind === "checkbox",
      });
    }
  });
  return names;
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Sends a submission to WPForms, which stores the entry and runs its notifications. */
export async function submitWpForm(
  key: FormKey,
  values: Record<string, string | string[]>,
  meta: { startedAt?: number; userAgent?: string; ip?: string }
): Promise<WpFormSubmitResult> {
  const loaded = await loadWpForm(key);
  if (!loaded) {
    return { ok: false, message: "This form is temporarily unavailable." };
  }

  const names = allowedNames(loaded.form);
  const body = new FormData();
  body.append("action", "wpforms_submit");
  Object.entries(loaded.hidden).forEach(([name, value]) =>
    body.append(name, value)
  );
  Object.entries(values).forEach(([name, value]) => {
    const spec = names.get(name);
    if (!spec) return; // ignore anything that isn't a field of this form
    const list = (Array.isArray(value) ? value : [value])
      .map((v) => String(v).slice(0, 5000))
      .filter((v) => v !== "");
    if (spec.multiple) {
      list.forEach((v) => body.append(`${name}[]`, v));
    } else if (list[0] !== undefined) {
      body.append(name, list[0]);
    }
  });
  const now = Math.floor(Date.now() / 1000);
  const started = meta.startedAt ? Math.floor(meta.startedAt / 1000) : now - 30;
  body.append("wpforms[start_timestamp]", String(started));
  body.append("wpforms[end_timestamp]", String(now));
  body.append("page_url", loaded.pageUrl);

  let res: Response;
  try {
    res = await fetch(loaded.ajaxUrl, {
      method: "POST",
      body,
      headers: {
        Referer: loaded.pageUrl,
        ...(meta.userAgent ? { "User-Agent": meta.userAgent } : {}),
        ...(meta.ip ? { "X-Forwarded-For": meta.ip } : {}),
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Couldn't reach the server. Please try again." };
  }

  const raw = await res.text();
  let data: {
    success?: boolean;
    data?: {
      confirmation?: string;
      redirect_url?: string;
      errors?: {
        general?: Record<string, string> | string;
        field?: Record<string, string | Record<string, string>>;
      };
    };
  } | null = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (data?.success) {
    return {
      ok: true,
      confirmationHtml: data.data?.confirmation,
      redirectUrl: data.data?.redirect_url,
    };
  }

  const fieldErrors: Record<string, string> = {};
  // Keys are field ids ("0") or input names ("wpforms[fields][0][first]").
  Object.entries(data?.data?.errors?.field ?? {}).forEach(([key, error]) => {
    const fieldId = key.match(/^wpforms\[fields\]\[([^\]]+)\]/)?.[1] ?? key;
    const message =
      typeof error === "string" ? error : Object.values(error).filter(Boolean)[0];
    if (message && !fieldErrors[fieldId]) fieldErrors[fieldId] = stripTags(message);
  });
  const general = data?.data?.errors?.general;
  const generalText =
    typeof general === "string"
      ? general
      : general
        ? Object.values(general).join(" ")
        : "";

  return {
    ok: false,
    message:
      stripTags(generalText) ||
      (Object.keys(fieldErrors).length
        ? "Please check the highlighted fields."
        : "We couldn't send your enquiry. Please try again."),
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
  };
}
