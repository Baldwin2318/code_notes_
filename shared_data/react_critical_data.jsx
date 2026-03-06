const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return String(value).trim().replace(/\/$/, '');
};

const explicitApiBase = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);

// 1) Use explicit API base URL when provided.
// 2) Otherwise default to same-origin so Render works out of the box.
const SERVER_URL = explicitApiBase || window.location.origin;

export default SERVER_URL;
