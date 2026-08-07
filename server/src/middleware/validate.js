import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return function requestValidation(request, _response, next) {
    const result = schema.safeParse({
      body: request.body ?? {},
      params: request.params ?? {},
      query: request.query ?? {},
    });

    if (!result.success) {
      const fields = result.error.issues.map((issue) => ({
        field: issue.path.filter((segment) => segment !== 'body').join('.') || 'request',
        message: issue.message,
      }));

      return next(
        new AppError(400, 'Please correct the highlighted information', { fields }),
      );
    }

    request.validated = result.data;
    return next();
  };
}
