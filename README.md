# Data Analysis Tool

A comprehensive full-stack data analysis application built with React frontend and FastAPI backend, deployed on **Google Cloud Run**. This tool allows users to upload datasets, perform various statistical analyses, and generate comprehensive reports with interactive visualizations.

---

## 🚀 Features

- **File Upload & Processing:**  
  Support for CSV, Excel (.xlsx, .xls), and JSON files with customizable header and row processing options.
- **Statistical Analysis:**  
  Basic statistics, distribution analysis, missing values analysis.
- **Time Series Analysis:**  
  Interactive time series plots with date range information.
- **Correlation Analysis:**  
  Correlation matrix heatmaps and top correlations identification.
- **Interactive Chat:**  
  AI-powered chatbot for data analysis queries using Google Gemini API.
- **Comprehensive Reporting:**  
  Downloadable JSON reports with all analysis results.
- **Real-time Visualizations:**  
  Interactive charts and plots using Plotly.js.

---

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm package manager
- Google Cloud SDK installed and authenticated

---

## 🛠 Deployment on Google Cloud Run

### 1️⃣ Configure Google Cloud

```bash
gcloud config set project eversense-4
```

---

### 2️⃣ Deploy Backend

**Navigate to backend:**
```bash
cd backend
```

**Update CORS origins in `app.py` with your frontend Cloud Run URL:**
```python
allow_origins=["https://data-analyzing-bot-frontend-service-xxxx.run.app"]
```

**Dockerfile (backend):**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8080
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Build & Push to Artifact Registry:**
```bash
gcloud builds submit --tag asia-south1-docker.pkg.dev/eversense-4/docker-repo/data-analyzing-bot-backend
```

**Deploy to Cloud Run:**
```bash
gcloud run deploy data-analyzing-bot-backend-service \
  --image asia-south1-docker.pkg.dev/eversense-4/docker-repo/data-analyzing-bot-backend \
  --platform managed --region asia-south1 --allow-unauthenticated --port 8080
```

> 📌 After deployment, note the backend URL (e.g. `https://data-analyzing-bot-backend-service-xxxx.run.app`).

---

### 3️⃣ Deploy Frontend

**Navigate to frontend:**
```bash
cd ../frontend
```

**Update API URL in `src/services/api.js`:**
```js
const API_URL = "https://data-analyzing-bot-backend-service-xxxx.run.app";
```

**Nginx Config**

- `start.sh`
    ```sh
    #!/bin/sh
    envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
    nginx -g 'daemon off;'
    ```

- `nginx.conf.template`
    ```nginx
    server {
        listen ${PORT};
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri /index.html;
        }
    }
    ```

**Dockerfile (frontend):**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
```

**Build & Push to Artifact Registry:**
```bash
gcloud builds submit --tag asia-south1-docker.pkg.dev/eversense-4/docker-repo/data-analyzing-bot-frontend
```

**Deploy to Cloud Run:**
```bash
gcloud run deploy data-analyzing-bot-frontend-service \
  --image asia-south1-docker.pkg.dev/eversense-4/docker-repo/data-analyzing-bot-frontend \
  --platform managed --region asia-south1 --allow-unauthenticated --port 8080
```

> 📌 After deployment, note the frontend URL (e.g. `https://data-analyzing-bot-frontend-service-xxxx.run.app`).

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py
│   ├── routers/
│   ├── models/
│   └── uploads/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── nginx.conf.template
└── README.md
```

---

## 🎯 Usage

- Access the app via the frontend Cloud Run URL:  
  `https://data-analyzing-bot-frontend-service-xxxx.run.app`
- Upload datasets (CSV, Excel, JSON)
- Perform analyses (basic stats, correlations, time series, missing values)
- Download reports
- Interact with the AI chatbot (Gemini API-powered)

---

## 🔧 Configuration

- **Gemini API key:** Update `chat.py` in backend
- **CORS origins:** Update `allow_origins` in `app.py`
- **API URL:** Update `frontend/src/services/api.js`

---

## 🐛 Troubleshooting

- **Network Errors:**  
  Check if backend/frontend URLs are updated correctly
- **CORS Errors:**  
  Ensure backend `allow_origins` includes frontend Cloud Run URL
- **Port Issues:**  
  Both frontend and backend must listen on `$PORT` (8080 in Cloud Run)

---
