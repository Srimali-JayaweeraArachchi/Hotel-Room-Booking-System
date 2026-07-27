export function notFoundHandler(request, response) {
  response.status(404).json({
    status: 'error',
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  response.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : error.message,
  });
}
