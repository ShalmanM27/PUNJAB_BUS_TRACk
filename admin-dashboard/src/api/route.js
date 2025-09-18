import client from "./client";

// List all routes
export const getRoutes = async () => {
  const res = await client.get("/routes");
  return res.data;
};

// Create new route
export const createRoute = async (routeData) => {
  const res = await client.post("/routes", routeData);
  return res.data;
};

// Update route
export const updateRoute = async (id, routeData) => {
  const res = await client.put(`/routes/${id}`, routeData);
  return res.data;
};

// Delete route
export const deleteRoute = async (id) => {
  await client.delete(`/routes/${id}`);
};
