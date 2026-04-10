"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [managingFieldsFor, setManagingFieldsFor] = useState<Service | null>(null);

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/services");
    if (res.ok) {
      setServices(await res.json());
    }
    setLoading(false);
  }, []);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          Add service
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

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">No services yet. Add your first service to get started.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`rounded-xl border bg-white p-4 ${
                service.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {!service.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>{service.durationMinutes} min</span>
                    {service.price !== null && (
                      <span>${(service.price / 100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {service.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
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
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {service ? "Edit service" : "Add a service"}
      </h2>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <button
              type="button"
              onClick={generateTitle}
              disabled={!name.trim() || generatingTitle}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {generatingTitle ? "Rewriting..." : "✨ Rewrite with AI"}
            </button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="e.g., Men's Haircut"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={!name.trim() || generating}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? "Regenerating..." : "✨ Regenerate with AI"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this service"
            rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price <span className="text-gray-400">(optional)</span>
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buffer before</label>
            <select
              value={bufferBeforeMinutes}
              onChange={(e) => setBufferBefore(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {BUFFERS.map((b) => (
                <option key={b} value={b}>
                  {b === 0 ? "None" : `${b} min`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Buffer after</label>
            <select
              value={bufferAfterMinutes}
              onChange={(e) => setBufferAfter(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {BUFFERS.map((b) => (
                <option key={b} value={b}>
                  {b === 0 ? "None" : `${b} min`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <input
            id="requires-approval"
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="requires-approval" className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Require manual approval</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Bookings stay pending until you approve or decline them.
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : service ? "Save changes" : "Add service"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
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
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Custom questions — {service.name}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Done
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Collect extra info from customers when they book this service.
      </p>

      {loading ? (
        <div className="mt-4 h-10 rounded-lg bg-gray-100 animate-pulse" />
      ) : (
        <div className="mt-4 space-y-2">
          {fields.length === 0 && (
            <p className="text-sm text-gray-400">No custom questions yet.</p>
          )}
          {fields.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{f.label}</div>
                <div className="text-xs text-gray-500">
                  {f.fieldType}
                  {f.required ? " · required" : ""}
                </div>
              </div>
              <button
                onClick={() => removeField(f.id)}
                className="text-xs text-red-600 hover:bg-red-50 rounded px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addField} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Vehicle make & model"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              <option value="text">Short text</option>
              <option value="textarea">Long text</option>
              <option value="tel">Phone</option>
              <option value="email">Email</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Required
          </label>
        </div>
        <button
          type="submit"
          disabled={!label.trim()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Add question
        </button>
      </form>
    </div>
  );
}
