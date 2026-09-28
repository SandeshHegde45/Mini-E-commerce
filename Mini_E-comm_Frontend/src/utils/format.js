const CURRENCY_LOCALE = { INR: "en-IN", USD: "en-US" };

export function formatPrice(amount, currency = "INR") {
  const locale = CURRENCY_LOCALE[currency] || "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(" ");
  }
  return data?.message || fallback;
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Copies server-side validation errors (express-validator) onto react-hook-form fields.
export function applyServerFieldErrors(error, setError) {
  const list = error?.data?.errors;
  if (!Array.isArray(list)) return false;
  let applied = false;
  list.forEach((e) => {
    const field = e.path || e.field || e.param;
    if (field) {
      setError(field, { type: "server", message: e.msg || e.message });
      applied = true;
    }
  });
  return applied;
}
