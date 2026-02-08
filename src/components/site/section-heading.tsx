import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-[color:var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
