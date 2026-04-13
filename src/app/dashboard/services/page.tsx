"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number | null;
  isActive: boolean;
  sortOrder: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  requiresApproval: boolean;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const BUFFERS = [0, 5, 10, 15, 30, 60];

interface ServiceField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
}

const inputClass =
  "mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";
const labelClass =
  "block text-xs font-medium uppercase tracking-[0.15em] text-ink/60";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [managingFieldsFor, setManagingFieldsFor] = useState<Service | null>(null);
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  const [showAvailabilityBanner, setShowAvailabilityBanner] = useState(false);
  const [hadServicesOnLoad, setHadServicesOnLoad] = useState<boolean | null>(null);

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/services");
    if (res.ok) {
      const data = await res.json();
      const list = data.services ?? data;
      setServices(list);
      if (data.slug) setBusinessSlug(data.slug);
      if (hadServicesOnLoad === null) {
        setHadServicesOnLoad(list.length > 0);
      } else if (!hadServicesOnLoad && list.length === 1) {
        setShowAvailabilityBanner(true);
      }
    }
    setLoading(false);
  }, [hadServicesOnLoad]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  function handleEdit(service: Service) {
    setEditing(service);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchServices();
  }

  async function handleToggleActive(service: Service) {
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
    });
    fetchServices();
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            What you do
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
            Services
          </h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
        >
          + Add service
        </button>
      </div>

      {managingFieldsFor && (
        <FieldsManager
          service={managingFieldsFor}
          onClose={() => setManagingFieldsFor(null)}
        />
      )}

      {showForm && (
        <ServiceForm
          service={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchServices();
          }}
        />
      )}

      {showAvailabilityBanner && (
        <div className="mt-8 rounded-3xl border border-teal-700/20 bg-teal-700/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                Set your hours
              </p>
              <p className="mt-1.5 text-sm text-ink/65">
                We&rsquo;ve set you up with Mon&ndash;Fri, 9 AM&ndash;5 PM by default.
                Want to adjust your availability before sharing your booking link?
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/dashboard/availability"
                  className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
                >
                  Customize hours
                </Link>
                <button
                  onClick={() => setShowAvailabilityBanner(false)}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
                >
                  Looks good, skip
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAvailabilityBanner(false)}
              className="flex-shrink-0 text-ink/40 transition-colors hover:text-ink"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {businessSlug && services.length > 0 && (
        <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink/60">
            Your booking link
          </p>
          <p className="mt-2 break-all font-mono text-sm text-ink/70">
            {typeof window !== "undefined" ? window.location.origin : ""}/book/{businessSlug}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => {
                const url = `${window.location.origin}/book/${businessSlug}`;
                navigator.clipboard.writeText(url);
              }}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-ink/25 hover:text-ink"
            >
              Copy link
            </button>
            <Link
              href={`/book/${businessSlug}`}
              target="_blank"
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-ink/25 hover:text-ink"
            >
              Preview booking page →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink/60 transition-colors hover:text-terracotta"
        >
          ← Back to dashboard
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-ink/5" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="mt-16 border-t border-ink/10 pt-10 text-center">
          <p className="text-base text-ink/60">
            No services yet. Add your first one to get started.
          </p>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {services.map((service) => (
            <div
              key={service.id}
              className={`py-5 ${service.isActive ? "" : "opacity-55"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {service.name}
                    </h3>
                    {!service.isActive && (
                      <span className="rounded-full border border-ink/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink/60">
                        Paused
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="mt-1.5 text-sm text-ink/60">{service.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm text-ink/70">
                    <span>{service.durationMinutes} min</span>
                    {service.price !== null && (
                      <>
                        <span className="text-ink/25">·</span>
                        <span className="font-medium text-ink">
                          ${(service.price / 100).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1 text-xs font-medium">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="rounded-full px-3 py-1.5 text-ink/60 transition-colors hover:bg-cream hover:text-ink"
                  >
                    {service.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="rounded-full px-3 py-1.5 text-terracotta transition-colors hover:bg-terracotta/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="rounded-full px-3 py-1.5 text-ink/50 transition-colors hover:bg-ink hover:text-cream"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes ?? 30);
  const [price, setPrice] = useState(service?.price ? (service.price / 100).toString() : "");
  const [bufferBeforeMinutes, setBufferBefore] = useState(service?.bufferBeforeMinutes ?? 0);
  const [bufferAfterMinutes, setBufferAfter] = useState(service?.bufferAfterMinutes ?? 0);
  const [requiresApproval, setRequiresApproval] = useState(service?.requiresApproval ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate description once when user stops typing the name (3s debounce)
  useEffect(() => {
    if (hasAutoGenerated) return;
    if (!name.trim() || name.trim().length < 3) return;
    if (service && description) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateDescriptionAuto();
    }, 3000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function handleNameBlur() {
    if (hasAutoGenerated) return;
    if (!name.trim() || name.trim().length < 3 || generating) return;
    if (service && description) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    generateDescriptionAuto();
  }

  async function generateDescriptionAuto() {
    if (!name.trim() || generating || hasAutoGenerated) return;
    setHasAutoGenerated(true);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/service-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, durationMinutes, field: "description" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function generateDescription() {
    if (!name.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/service-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, durationMinutes, field: "description" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function generateTitle() {
    if (!name.trim()) return;
    setGeneratingTitle(true);
    try {
      const res = await fetch("/api/ai/service-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, field: "title" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setName(data.title);
      }
    } finally {
      setGeneratingTitle(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...(service ? { id: service.id } : {}),
      name,
      description,
      durationMinutes,
      price: price ? parseFloat(price) : null,
      bufferBeforeMinutes,
      bufferAfterMinutes,
      requiresApproval,
    };

    const res = await fetch("/api/services", {
      method: service ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSaving(false);
      return;
    }

    onSaved();
  }

  return (
    <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-7">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
        {service ? "Editing" : "New"}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">
        {service ? "Edit this service" : "Add a service"}
      </h2>

      {error && (
        <div className="mt-5 rounded-2xl border border-terracotta/30 bg-terracotta/5 px-5 py-4 text-sm text-terracotta-dark">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Name</label>
            <button
              type="button"
              onClick={generateTitle}
              disabled={!name.trim() || generatingTitle}
              className="text-xs font-medium text-terracotta hover:text-terracotta-dark disabled:text-ink/30 disabled:cursor-not-allowed"
            >
              {generatingTitle ? "Rewriting…" : "✨ Rewrite with AI"}
            </button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="e.g., Men's Haircut"
            required
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>
              Description <span className="normal-case tracking-normal text-ink/40">(optional)</span>
            </label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={!name.trim() || generating}
              className="text-xs font-medium text-terracotta hover:text-terracotta-dark disabled:text-ink/30 disabled:cursor-not-allowed"
            >
              {generating ? "Regenerating…" : "✨ Regenerate with AI"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this service"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className={inputClass}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Price <span className="normal-case tracking-normal text-ink/40">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 mt-2 flex items-center pl-5 text-ink/40">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Buffer before</label>
            <select
              value={bufferBeforeMinutes}
              onChange={(e) => setBufferBefore(Number(e.target.value))}
              className={inputClass}
            >
              {BUFFERS.map((b) => (
                <option key={b} value={b}>
                  {b === 0 ? "None" : `${b} min`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Buffer after</label>
            <select
              value={bufferAfterMinutes}
              onChange={(e) => setBufferAfter(Number(e.target.value))}
              className={inputClass}
            >
              {BUFFERS.map((b) => (
                <option key={b} value={b}>
                  {b === 0 ? "None" : `${b} min`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-cream p-4">
          <input
            id="requires-approval"
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink/30 text-terracotta focus:ring-terracotta/30"
          />
          <span className="text-sm">
            <span className="font-display font-semibold text-ink">
              Require manual approval
            </span>
            <span className="mt-0.5 block text-xs text-ink/55">
              Bookings stay pending until you approve or decline them.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : service ? "Save changes" : "Add service"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-3 text-sm font-medium text-ink/60 transition-colors hover:bg-cream hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldsManager({ service, onClose }: { service: Service; onClose: () => void }) {
  const [fields, setFields] = useState<ServiceField[]>([]);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/services/fields?serviceId=${service.id}`);
    if (res.ok) setFields(await res.json());
    setLoading(false);
  }, [service.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function addField(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    await fetch("/api/services/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: service.id, label, fieldType, required }),
    });
    setLabel("");
    setFieldType("text");
    setRequired(false);
    load();
  }

  async function removeField(id: string) {
    await fetch("/api/services/fields", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-7">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            Custom questions
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">
            {service.name}
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            Collect extra info from customers when they book this service.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-cream hover:text-ink"
        >
          Done
        </button>
      </div>

      {loading ? (
        <div className="mt-6 h-12 animate-pulse rounded-2xl bg-ink/5" />
      ) : (
        <div className="mt-6 space-y-2">
          {fields.length === 0 && (
            <p className="text-sm text-ink/45">No custom questions yet.</p>
          )}
          {fields.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-2xl border border-ink/10 px-4 py-3"
            >
              <div>
                <div className="font-display text-base font-semibold text-ink">
                  {f.label}
                </div>
                <div className="text-xs text-ink/55">
                  {f.fieldType}
                  {f.required ? " · required" : ""}
                </div>
              </div>
              <button
                onClick={() => removeField(f.id)}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50 transition-colors hover:bg-ink hover:text-cream"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addField} className="mt-6 space-y-4 border-t border-ink/10 pt-6">
        <div>
          <label className={labelClass}>Question</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Vehicle make & model"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className={inputClass}
            >
              <option value="text">Short text</option>
              <option value="textarea">Long text</option>
              <option value="tel">Phone</option>
              <option value="email">Email</option>
            </select>
          </div>
          <label className="mt-8 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-ink/30 text-terracotta focus:ring-terracotta/30"
            />
            Required
          </label>
        </div>
        <button
          type="submit"
          disabled={!label.trim()}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
        >
          + Add question
        </button>
      </form>
    </div>
  );
}
