export function notFoundHandler(request, response) {
  response.status(404).json({
    status: 'error',
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const isDuplicateDatabaseEntry = error.code === 'ER_DUP_ENTRY';
  const isUploadError = error.name === 'MulterError';
  const statusCode = isDuplicateDatabaseEntry ? 409 : isUploadError ? 400 : (error.statusCode ?? 500);

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  response.status(statusCode).json({
    status: 'error',
    message: isDuplicateDatabaseEntry
      ? 'An account with this email already exists'
      : isUploadError
        ? error.code === 'LIMIT_FILE_SIZE'
          ? 'Each room image must be 5 MB or smaller'
          : 'Upload a maximum of 10 room images at a time'
      : statusCode === 500
        ? 'Internal server error'
        : error.message,
    ...(error.details && { details: error.details }),
  });
}
