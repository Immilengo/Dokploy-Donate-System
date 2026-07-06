type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (isApiErrorLike(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
