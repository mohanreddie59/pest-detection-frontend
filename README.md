# Pest Detection – Frontend

React + Vite console for the `pest-detection-backend` Spring Boot API. One page per backend controller.

| Page | Backend controller | Endpoints used |
|---|---|---|
| Login | `AuthController` | `POST /api/auth/login` |
| Dashboard | all of the below | aggregates list endpoints into stats and charts |
| Smart Traps | `TrapController` | `GET/POST /api/traps`, `PUT/DELETE /api/traps/{id}` |
| Detections | `DetectionController` | `GET/POST /api/detections`, `DELETE /api/detections/{id}` |
| Sensors | `SensorController` | `GET/POST /api/sensors` |
| Alerts | `AlertController` | `GET /api/alerts`, `PUT /api/alerts/{id}/read`, `PUT /api/alerts/{id}/resolve`, `DELETE /api/alerts/{id}` |
| Users | `UserController` | `GET /api/users`, `PUT/DELETE /api/users/{id}` |

## Run

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api -> http://localhost:8080
npm run build
```

For production set `VITE_API_BASE_URL` (see `.env.example`).

## Assumptions to check against your backend

I only had the folder structure, not the controller code, so these are guesses. Adjust in one place: `src/api/endpoints.js`.

- Routes are prefixed with `/api` and named as in the table above.
- Login body is `{ username, password }` and the response contains `token` (or `accessToken` / `jwt`). Requests send `Authorization: Bearer <token>`.
- Field names: traps `name, deviceId, location, status`; detections `trapId, pestType, count, confidence, detectedAt`; sensors `trapId, temperature, humidity`; alerts `message, severity, read, resolved, createdAt`; users `username, email, role`.
- The Spring app must allow CORS if you don't use the Vite proxy.
