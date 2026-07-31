/**
 * Extract a user-facing message from an Axios error response.
 */
export const getApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;

  if (data?.errors?.length) {
    return data.errors.map((e) => e.msg).join(' ');
  }

  if (data?.message) return data.message;

  if (err?.request && !err?.response) {
    if (import.meta.env.DEV) {
      return 'Cannot reach the server. Make sure the backend is running on port 5000.';
    }
    return 'Cannot reach the server. Please try again in a moment.';
  }

  return fallback;
};
