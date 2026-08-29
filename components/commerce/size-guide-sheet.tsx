"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  SIZE_CHART,
  customSizeSummary,
  emptyCustomSize,
  formatLength,
  measurementFields,
  missingRequired,
  type CustomSize,
  type MeasurementField,
  type Unit,
} from "@/lib/size-guide";

type Tab = "chart" | "custom";

type SizeGuideProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: string;
  /** Sizes this product is actually cut in, in the store's own order. */
  availableSizes: string[];
  selectedSize?: string;
  onSelectSize: (size: string) => void;
  custom: CustomSize | null;
  onSaveCustom: (custom: CustomSize) => void;
  onClearCustom: () => void;
  initialTab?: Tab;
};

/**
 * The chart and the made-to-measure form, in one drawer.
 *
 * All of the drawer's own state lives in `SizeGuideBody`, which Radix
 * mounts on open and unmounts on close. That is deliberate: the tab, the
 * unit and the half-typed form seed themselves from props at mount, so
 * there is no effect resynchronising them every time the drawer reopens.
 */
export function SizeGuideSheet(props: SizeGuideProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent
        /* The side-scoped variant is what the primitive sets, so plain
           `sm:max-w-xl` never wins the merge against it. */
        className="flex w-full flex-col gap-0 bg-paper p-0 data-[side=right]:sm:max-w-xl"
        showCloseButton={false}
      >
        <SizeGuideBody {...props} />
      </SheetContent>
    </Sheet>
  );
}

function SizeGuideBody({
  onOpenChange,
  productType,
  availableSizes,
  selectedSize,
  onSelectSize,
  custom,
  onSaveCustom,
  onClearCustom,
  initialTab = "chart",
}: SizeGuideProps) {
  const fields = measurementFields(productType);

  const [tab, setTab] = useState<Tab>(initialTab);
  const [unit, setUnit] = useState<Unit>(custom?.unit ?? "in");
  /* The form is a draft until it is saved: closing the drawer half-way
     through typing must not leave a partial size on the product. */
  const [draft, setDraft] = useState<CustomSize>(custom ?? emptyCustomSize());
  const [showErrors, setShowErrors] = useState(false);

  const missing = missingRequired(draft, fields);

  function save() {
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    onSaveCustom({ ...draft, unit });
    onOpenChange(false);
  }

  const chart = SIZE_CHART.filter((row) => availableSizes.includes(row.size));
  const rows = chart.length ? chart : SIZE_CHART;

  return (
    <>
      <SheetHeader className="flex-row items-center justify-between border-b border-rule px-6 py-5">
        <div>
          <SheetTitle className="statement statement-tight font-normal">
            Size Guide
          </SheetTitle>
          <SheetDescription className="sr-only">
            The house size chart, and a form for your own measurements.
          </SheetDescription>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="label text-ink-mute transition-colors hover:text-ink"
        >
          Close
        </button>
      </SheetHeader>

      <div className="flex border-b border-rule">
        <TabButton active={tab === "chart"} onClick={() => setTab("chart")}>
          House Sizes
        </TabButton>
        <TabButton active={tab === "custom"} onClick={() => setTab("custom")}>
          Made to Measure
        </TabButton>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-rule px-6 py-3">
        {/* Caps at this tracking wrap on a phone and crowd the toggle;
            the tab above already names what is being shown. */}
        <span className="eyebrow hidden sm:block">
          {tab === "chart" ? "Body measurements" : "Your measurements"}
        </span>
        <span className="ml-auto">
          <UnitToggle unit={unit} onChange={setUnit} />
        </span>
      </div>

      {/* Lenis drives the window scroll; without this the wheel over the
            drawer keeps moving the page behind it. */}
      <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-6">
        {tab === "chart" ? (
          <ChartTab
            rows={rows}
            unit={unit}
            fields={fields}
            selectedSize={selectedSize}
            onSelectSize={(size) => {
              onSelectSize(size);
              onOpenChange(false);
            }}
            onCustom={() => setTab("custom")}
          />
        ) : (
          <CustomTab
            fields={fields}
            draft={draft}
            unit={unit}
            showErrors={showErrors}
            onChange={(key, value) =>
              setDraft((d) => ({ ...d, values: { ...d.values, [key]: value } }))
            }
            onNotes={(notes) => setDraft((d) => ({ ...d, notes }))}
          />
        )}
      </div>

      {tab === "custom" ? (
        <div className="border-t border-rule px-6 py-5">
          {showErrors && missing.length ? (
            <p className="mb-3 text-xs text-brand">
              Add {missing.map((f) => f.label.toLowerCase()).join(", ")} — the
              atelier cannot cut without them.
            </p>
          ) : (
            <p className="mb-3 text-xs text-ink-mute">
              Measured on the body, over light clothing. We call before cutting
              if anything reads unusual.
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              /* Same device as the Add to Bag button and the homepage
                 hero CTA: inset hairline, bg-ink giving way to the brand
                 terracotta on hover, tick that extends — one primary-
                 button language across the site rather than a flat
                 black rectangle unique to this drawer. */
              className="label group relative flex flex-1 items-center justify-center gap-3 bg-ink py-4 text-paper transition-colors duration-500 hover:bg-brand"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[4px] border border-paper/25"
              />
              {custom ? "Update Measurements" : "Save Measurements"}
              <span
                aria-hidden
                className="h-px w-5 shrink-0 bg-current transition-all duration-500 group-hover:w-8"
              />
            </button>
            {custom ? (
              <button
                type="button"
                onClick={() => {
                  onClearCustom();
                  onOpenChange(false);
                }}
                className="label border border-rule px-5 text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* -------------------------------------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "label flex-1 border-b-2 py-4 transition-colors",
        active
          ? "border-brand text-ink"
          : "border-transparent text-ink-mute hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function UnitToggle({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) {
  return (
    <div className="flex border border-rule">
      {(["in", "cm"] as Unit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={cn(
            "label px-3 py-1.5 transition-colors",
            unit === u ? "bg-ink text-paper" : "text-ink-mute hover:text-ink",
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

function ChartTab({
  rows,
  unit,
  fields,
  selectedSize,
  onSelectSize,
  onCustom,
}: {
  rows: typeof SIZE_CHART;
  unit: Unit;
  fields: MeasurementField[];
  selectedSize?: string;
  onSelectSize: (size: string) => void;
  onCustom: () => void;
}) {
  return (
    <>
      <div className="border-t border-l border-rule">
        <div className="grid grid-cols-4 bg-paper-deep">
          {["Size", "Bust", "Waist", "Hip"].map((head) => (
            <span
              key={head}
              className="eyebrow border-b border-r border-rule px-3 py-3 text-ink"
            >
              {head}
            </span>
          ))}
        </div>
        {rows.map((row) => {
          const active = row.size === selectedSize;
          return (
            <button
              key={row.size}
              type="button"
              onClick={() => onSelectSize(row.size)}
              className={cn(
                "grid w-full grid-cols-4 text-left transition-colors",
                active ? "bg-ink text-paper" : "hover:bg-paper-deep",
              )}
            >
              <span
                className={cn(
                  "label border-b border-r border-rule px-3 py-3.5",
                  active && "border-ink/25",
                )}
              >
                {row.size}
              </span>
              {[row.bust, row.waist, row.hip].map((value, i) => (
                <span
                  key={i}
                  className={cn(
                    "border-b border-r border-rule px-3 py-3.5 text-xs tabular-nums",
                    active ? "border-ink/25" : "text-ink-soft",
                  )}
                >
                  {formatLength(value, unit)}
                </span>
              ))}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-mute">
        Body measurements, not garment measurements — every piece is cut with
        ease allowed on top. Tap a row to select that size.
      </p>

      <h3 className="label mt-10 mb-4 text-ink">How to Measure</h3>
      <dl className="border-t border-rule">
        {fields.map((field) => (
          <div
            key={field.key}
            className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-rule py-3.5"
          >
            <dt className="label text-ink">{field.label}</dt>
            <dd className="text-xs leading-relaxed text-ink-soft">
              {field.hint}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 border border-rule bg-paper-deep p-6">
        <h3 className="statement statement-tight mb-2 text-[1.25rem]">
          Between Sizes?
        </h3>
        <p className="copy mb-5 text-fine">
          Every garment leaves the atelier cut to order, so nothing here has to
          be a compromise. Send us your own measurements and we cut to them at
          no extra cost.
        </p>
        <button
          type="button"
          onClick={onCustom}
          className="label border border-ink px-6 py-3 text-ink transition-colors hover:border-brand hover:bg-brand hover:text-paper"
        >
          Enter My Measurements
        </button>
      </div>
    </>
  );
}

function CustomTab({
  fields,
  draft,
  unit,
  showErrors,
  onChange,
  onNotes,
}: {
  fields: MeasurementField[];
  draft: CustomSize;
  unit: Unit;
  showErrors: boolean;
  onChange: (key: string, value: string) => void;
  onNotes: (notes: string) => void;
}) {
  const summary = customSizeSummary({ ...draft, unit }, fields);

  return (
    <>
      <p className="copy mb-8 text-fine">
        Cut to your own numbers, in our Lucknow atelier, at no extra cost. Fill
        in what you know — the four marked fields are the ones we cannot cut
        without.
      </p>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => {
          const value = draft.values[field.key] ?? "";
          const invalid = showErrors && field.required && !value.trim();
          return (
            /* The label is bound by id rather than wrapping the input:
               wrapping would fold the hint into the accessible name, and
               a screen reader would announce the whole sentence as the
               field's label before reading it again as its description. */
            <div key={field.key}>
              <label
                htmlFor={`measure-${field.key}`}
                className="label mb-2 flex items-baseline gap-1.5 text-ink"
              >
                {field.label}
                {field.required ? (
                  <span className="text-brand" aria-hidden>
                    •
                  </span>
                ) : null}
              </label>
              <div className="relative">
                <input
                  id={`measure-${field.key}`}
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  required={field.required}
                  aria-invalid={invalid || undefined}
                  aria-describedby={`measure-${field.key}-hint`}
                  placeholder="—"
                  className={cn(
                    "w-full border bg-transparent py-2.5 pl-3 pr-12 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink",
                    invalid ? "border-brand" : "border-rule",
                  )}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-ink-mute">
                  {unit}
                </span>
              </div>
              <p
                id={`measure-${field.key}-hint`}
                className="mt-1.5 text-[11px] leading-snug text-ink-mute"
              >
                {field.hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <label htmlFor="measure-notes" className="label mb-2 block text-ink">
          Notes for the Atelier
        </label>
        <textarea
          id="measure-notes"
          rows={3}
          value={draft.notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Sleeve preference, blouse lining, an occasion date…"
          className="w-full resize-none border border-rule bg-transparent p-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink"
        />
      </div>

      {summary ? (
        <div className="mt-8 border-t border-rule pt-5">
          <span className="eyebrow mb-1.5 block">Reading as</span>
          <p className="text-sm text-ink">{summary}</p>
        </div>
      ) : null}
    </>
  );
}
