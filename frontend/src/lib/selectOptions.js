/** Build searchable select options from fleet entities. */

export const vehicleOptions = (vehicles, { detailed = false, assignable = false } = {}) =>
  (vehicles || []).map((v) => ({
    value: v._id,
    label: assignable
      ? `${v.registrationNumber} (${v.vehicleName || '—'} - ${v.capacity}t)`
      : detailed
        ? `${v.registrationNumber} (${v.vehicleName || '—'}) — ${v.status || ''}`
        : v.registrationNumber,
    keywords: [v.registrationNumber, v.vehicleName, v.status, v.model, v.type, v.capacity].filter(Boolean).join(' '),
  }));

export const driverOptions = (drivers) =>
  (drivers || []).map((d) => ({
    value: d._id,
    label: `${d.name} (${d.licenseNumber || d.licenseCategory || '—'})`,
    keywords: [d.name, d.licenseNumber, d.licenseCategory, d.contact].filter(Boolean).join(' '),
  }));

export const tripOptions = (trips) =>
  (trips || []).map((t) => ({
    value: t._id,
    label: `${t.source} → ${t.destination}`,
    keywords: [t.source, t.destination, t.status].filter(Boolean).join(' '),
  }));

export const withPlaceholder = (options, placeholder, { disabled = true } = {}) => [
  { value: '', label: placeholder, disabled },
  ...options,
];
