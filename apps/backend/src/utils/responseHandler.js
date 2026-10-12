export const sendResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    error: status >= 400,
    status: status,
    message: message,
    data: data,
  });
};