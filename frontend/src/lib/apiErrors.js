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
    if (err.code === 'ECONNABORTED') {
      if (import.meta.env.DEV) {
        return 'Request timed out. Make sure the backend is running on port 5000.';
      }
      return 'The server is taking longer than usual to respond. It may be starting up — please wait a moment and try again.';
    }

    if (import.meta.env.DEV) {
      return 'Cannot reach the server. Make sure the backend is running on port 5000.';
    }
    return 'Cannot reach the server right now. Please wait a moment and try again.';
  }

  return fallback;
};
