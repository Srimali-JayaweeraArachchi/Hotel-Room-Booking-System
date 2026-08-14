export function getApiErrorMessage(error) {
  if (!error.response) {
    return 'Unable to reach the server. Check that the backend is running.';
  }

  const response = error.response.data;
  const fieldErrors = response?.details?.fields;

  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors
      .map(({ field, message }) => `${formatFieldName(field)}: ${message}`)
      .join(' ');
  }

  return response?.message ?? 'Something went wrong. Please try again.';
}

function formatFieldName(field) {
  const labels = {
    name: 'Full name',
    email: 'Email',
    password: 'Password',
    request: 'Request',
  };

  return labels[field] ?? field;
}
