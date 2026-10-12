import { api } from "./client";

// AuthController
export const authApi = {
  login: (username, password) => api.post("/auth/login", { username, password }),
  register: (payload) => api.post("/auth/register", payload),
};

// UserController
export const usersApi = {
  list: () => api.get("/users"),
  get: (id) => api.get(`/users/${id}`),
  me: () => api.get("/users/me"),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.del(`/users/${id}`),
};

// TrapController (SmartTrap entity)
export const trapsApi = {
  list: () => api.get("/traps"),
  get: (id) => api.get(`/traps/${id}`),
  create: (payload) => api.post("/traps", payload),
  update: (id, payload) => api.put(`/traps/${id}`, payload),
  remove: (id) => api.del(`/traps/${id}`),
};

// DetectionController (PestDetection entity, DetectionRequest / DetectionResponse DTOs)
export const detectionsApi = {
  list: () => api.get("/detections"),
  byTrap: (trapId) => api.get(`/detections/trap/${trapId}`),
  create: (payload) => api.post("/detections", payload),
  remove: (id) => api.del(`/detections/${id}`),
};

// SensorController (SensorReading entity, SensorDataRequest DTO)
export const sensorsApi = {
  list: () => api.get("/sensors"),
  byTrap: (trapId) => api.get(`/sensors/trap/${trapId}`),
  create: (payload) => api.post("/sensors", payload),
};

// AlertController
export const alertsApi = {
  list: () => api.get("/alerts"),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  remove: (id) => api.del(`/alerts/${id}`),
};
