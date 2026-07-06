export const successResponse = (message: string, data?: unknown) =>({
    success: true,
    message,
    data: data?? null,
});

export const errorResponse = (message: string, errors?: string[]) =>({
    success: false,
    message,
    error: errors?? [],
});