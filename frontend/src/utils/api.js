const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// Auth
export const registerUser = (body) => request("POST", "/auth/register", body);
export const loginUser = (body) => request("POST", "/auth/login", body);
export const getMe = () => request("GET", "/auth/me");

// Builds
export const getMyBuilds = () => request("GET", "/builds/");
export const getPublicBuilds = (params = "") => request("GET", `/builds/public${params}`);
export const getBuild = (id) => request("GET", `/builds/${id}`);
export const createBuild = (body) => request("POST", "/builds/", body);
export const updateBuild = (id, body) => request("PATCH", `/builds/${id}`, body);
export const deleteBuild = (id) => request("DELETE", `/builds/${id}`);
export const addItemToBuild = (buildId, body) => request("POST", `/builds/${buildId}/items`, body);
export const removeItemFromBuild = (buildId, itemId) => request("DELETE", `/builds/${buildId}/items/${itemId}`);

// Gear
export const getGear = (params = "") => request("GET", `/gear/${params}`);
export const fetchGearFromBungie = (hash) => request("POST", "/gear/fetch", { hash });

// AI
export const getAIRecommendation = (build) => request("POST", "/ai/recommend", { build });