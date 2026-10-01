"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WpForm as WpFormSchema,
  WpFormField,
  WpFormInput,
  WpFormSubmitResult,
} from "@/lib/wpforms-types";

type Values = Record<string, string | string[]>;

const WIDTH_CLASS: Record<WpFormField["width"], string> = {
  full: "md:col-span-6",
  half: "md:col-span-3",
  third: "md:col-span-2",
  "two-thirds": "md:col-span-4",
};

const controlClass =
  "w-full rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]/70 transition focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initialValues(form: WpFormSchema): Values {
  const values: Values = {};
  form.fields.forEach((field) => {
    field.inputs.forEach((input) => {
      if (input.kind === "select") {
        const selected = input.options?.filter((o) => o.selected).map((o) => o.value) ?? [];
        values[input.name] = input.multiple ? selected : (selected[0] ?? "");
      } else {
        values[input.name] = input.defaultValue ?? "";
      }
    });
    if (field.choices) {
      const checked = field.choices.options.filter((o) => o.selected).map((o) => o.value);
      values[field.choices.name] =
        field.choices.kind === "checkbox" ? checked : (checked[0] ?? "");
    }
  });
  return values;
}

function validate(form: WpFormSchema, values: Values) {
  const errors: Record<string, string> = {};
  form.fields.forEach((field) => {
    for (const input of field.inputs) {
      const value = values[input.name];
      const empty = Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim();
      if (input.required && empty) {
        errors[field.id] = "This field is required.";
        return;
      }
      if (input.kind === "email" && !empty && !EMAIL_RE.test(String(value))) {
        errors[field.id] = "Please enter a valid email address.";
        return;
      }
    }
    if (field.choices && field.required) {
      const value = values[field.choices.name];
      if (Array.isArray(value) ? value.length === 0 : !value) {
        errors[field.id] = "Please make a selection.";
      }
    }
  });
  return errors;
}

export function WpForm({
  formKey,
  form,
  className,
}: {
  formKey: string;
  form: WpFormSchema;
  className?: string;
}) {
  const [values, setValues] = useState<Values>(() => initialValues(form));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);

  const setValue = (name: string, value: string | string[], fieldId: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const found = validate(form, values);
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage("Please check the highlighted fields.");
      document
        .getElementById(`wpf-${formKey}-${Object.keys(found)[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${formKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values,
          startedAt: startedAt.current,
          website: honeypot.current?.value ?? "",
        }),
      });
      const result = (await res.json().catch(() => null)) as WpFormSubmitResult | null;
      if (!result) throw new Error();
      if (result.ok) {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        setConfirmation(
          result.confirmationHtml ||
            "<p>Thank you! We've received your enquiry and will get back to you shortly.</p>",
        );
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation !== null) {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center",
          className,
        )}
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        {/* Confirmation message is written by the site admin in WPForms. */}
        <div
          className="wpf-confirmation mt-4 max-w-md text-sm leading-relaxed text-emerald-900 [&_p]:mt-2 [&_p:first-child]:mt-0 [&_p:first-child]:text-lg [&_p:first-child]:font-semibold"
          dangerouslySetInnerHTML={{ __html: confirmation }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
        {form.fields.map((field) => (
          <FieldBlock
            key={field.id}
            formKey={formKey}
            field={field}
            values={values}
            error={errors[field.id]}
            onChange={setValue}
          />
        ))}
      </div>

      {/* Honeypot for bots; hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message ? (
        <div
          role="alert"
          className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(221,51,51,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {form.submittingText}
          </>
        ) : (
          <>
            {form.submitText} <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

function FieldBlock({
  formKey,
  field,
  values,
  error,
  onChange,
}: {
  formKey: string;
  field: WpFormField;
  values: Values;
  error?: string;
  onChange: (name: string, value: string | string[], fieldId: string) => void;
}) {
  const domId = `wpf-${formKey}-${field.id}`;
  const visibleInputs = field.inputs.filter((input) => input.kind !== "hidden");

  if (field.html !== undefined || (!visibleInputs.length && !field.choices)) {
    if (!field.html && !field.label) return null;
    return (
      <div className={cn("col-span-1", WIDTH_CLASS[field.width])}>
        {field.label ? (
          <h3 className="text-base font-semibold text-[color:var(--ink)]">{field.label}</h3>
        ) : null}
        {field.html ? (
          <div
            className="mt-1 text-sm text-[color:var(--muted)]"
            dangerouslySetInnerHTML={{ __html: field.html }}
          />
        ) : null}
      </div>
    );
  }

  const multiPart = visibleInputs.length > 1;
  const labelText = field.label || visibleInputs[0]?.placeholder || "";

  return (
    <div id={domId} className={cn("col-span-1", WIDTH_CLASS[field.width])}>
      {field.choices || multiPart ? (
        <p className={cn("mb-1.5 text-sm font-medium text-[color:var(--ink)]", field.hideLabel && "sr-only")}>
          {labelText}
          {field.required ? <span className="ml-0.5 text-[color:var(--brand)]">*</span> : null}
        </p>
      ) : (
        <label
          htmlFor={`${domId}-0`}
          className={cn("mb-1.5 block text-sm font-medium text-[color:var(--ink)]", field.hideLabel && "sr-only")}
        >
          {labelText}
          {field.required ? <span className="ml-0.5 text-[color:var(--brand)]">*</span> : null}
        </label>
      )}

      {field.choices ? (
        <div className="flex flex-wrap gap-2" role={field.choices.kind === "radio" ? "radiogroup" : "group"}>
          {field.choices.options.map((option) => {
            const name = field.choices!.name;
            const current = values[name];
            const checked = Array.isArray(current)
              ? current.includes(option.value)
              : current === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition",
                  checked
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--ink)]"
                    : "border-black/10 bg-white text-[color:var(--muted)] hover:border-black/25",
                )}
              >
                <input
                  type={field.choices!.kind}
                  name={name}
                  value={option.value}
                  checked={checked}
                  className="accent-[color:var(--brand)]"
                  onChange={(event) => {
                    if (field.choices!.kind === "checkbox") {
                      const list = Array.isArray(current) ? current : [];
                      onChange(
                        name,
                        event.target.checked
                          ? [...list, option.value]
                          : list.filter((v) => v !== option.value),
                        field.id,
                      );
                    } else {
                      onChange(name, option.value, field.id);
                    }
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : (
        <div className={cn(multiPart && "grid gap-3 sm:grid-cols-2")}>
          {visibleInputs.map((input, index) => (
            <div key={input.name}>
              <Control
                id={`${domId}-${index}`}
                input={input}
                value={values[input.name]}
                invalid={Boolean(error)}
                ariaLabel={multiPart ? `${labelText} ${input.label ?? ""}`.trim() : undefined}
                onChange={(value) => onChange(input.name, value, field.id)}
              />
              {multiPart && input.label ? (
                <span className="mt-1 block text-xs text-[color:var(--muted)]">{input.label}</span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {field.description ? (
        <p className="mt-1.5 text-xs text-[color:var(--muted)]">{field.description}</p>
      ) : null}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function Control({
  id,
  input,
  value,
  invalid,
  ariaLabel,
  onChange,
}: {
  id: string;
  input: WpFormInput;
  value: string | string[] | undefined;
  invalid: boolean;
  ariaLabel?: string;
  onChange: (value: string | string[]) => void;
}) {
  const className = cn(controlClass, invalid && "border-red-300 focus:border-red-400 focus:ring-red-100");
  const common = {
    id,
    "aria-label": ariaLabel,
    "aria-invalid": invalid || undefined,
    required: input.required,
    className,
  };

  if (input.kind === "textarea") {
    return (
      <textarea
        {...common}
        rows={5}
        placeholder={input.placeholder}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={cn(className, "resize-y")}
      />
    );
  }

  if (input.kind === "select") {
    if (input.multiple) {
      return (
        <select
          {...common}
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={(event) =>
            onChange(Array.from(event.target.selectedOptions).map((o) => o.value))
          }
        >
          {input.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <select
        {...common}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled={input.required}>
          {input.placeholder || "Select an option"}
        </option>
        {input.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const autoComplete =
    input.kind === "email"
      ? "email"
      : input.kind === "tel"
        ? "tel"
        : /\[first\]$/.test(input.name)
          ? "given-name"
          : /\[last\]$/.test(input.name)
            ? "family-name"
            : undefined;

  return (
    <input
      {...common}
      type={input.kind}
      inputMode={input.kind === "tel" ? "tel" : undefined}
      autoComplete={autoComplete}
      placeholder={input.placeholder}
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
