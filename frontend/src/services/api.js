import axios from 'axios';

const API_BASE_URL = "https://data-analyzing-bot-backend-service-595287534877.asia-south1.run.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// New function for file preview
export const previewFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/upload/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Updated uploadFile function with processing options
export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('has_header', options.has_header !== undefined ? options.has_header : true);
  formData.append('skip_rows', options.skip_rows || 0);
  formData.append('header_row', options.header_row || 0);
  
  const response = await api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const loadSampleData = async () => {
  const response = await api.post('/api/upload/sample');
  return response.data;
};

export const getBasicStats = async (sessionId) => {
  const response = await api.post('/api/analysis/basic-stats', {
    session_id: sessionId,
  });
  return response.data;
};

export const getDistributionAnalysis = async (sessionId, column) => {
  const response = await api.post('/api/analysis/distribution', {
    session_id: sessionId,
    column: column,
  });
  return response.data;
};

export const getMissingValuesAnalysis = async (sessionId) => {
  const response = await api.post('/api/analysis/missing-values', {
    session_id: sessionId,
  });
  return response.data;
};

export const handleMissingValues = async (sessionId, method) => {
  const response = await api.post('/api/analysis/handle-missing', {
    session_id: sessionId,
    method: method,
  });
  return response.data;
};

export const getTimeSeriesData = async (sessionId, timeColumn, valueColumns) => {
  const response = await api.post('/api/analysis/time-series', {
    session_id: sessionId,
    time_column: timeColumn,
    value_columns: valueColumns,
  });
  return response.data;
};

export const getCorrelationAnalysis = async (sessionId) => {
  const response = await api.post('/api/analysis/correlation', {
    session_id: sessionId,
  });
  return response.data;
};

export const sendChatMessage = async (sessionId, message, apiKey = null) => {
  const response = await api.post('/api/chat/message', {
    session_id: sessionId,
    message: message,
    api_key: apiKey,
  });
  return response.data;
};

export const getTrendAnalysis = async (sessionId, timeColumn, valueColumn, windowSize = 7) => {
  const response = await api.post('/api/analysis/trend-analysis', {
    session_id: sessionId,
    time_column: timeColumn,
    value_column: valueColumn,
    window_size: windowSize,
  });
  return response.data;
};

export const getSeasonalDecomposition = async (sessionId, timeColumn, valueColumn, period = 30) => {
  const response = await api.post('/api/analysis/seasonal-decomposition', {
    session_id: sessionId,
    time_column: timeColumn,
    value_column: valueColumn,
    period: period,
  });
  return response.data;
};

export const getPeriodicAnalysis = async (sessionId, timeColumn, valueColumn, periodType = 'daily') => {
  const response = await api.post('/api/analysis/periodic-analysis', {
    session_id: sessionId,
    time_column: timeColumn,
    value_column: valueColumn,
    period_type: periodType,
  });
  return response.data;
};

export const getTimePeriodComparison = async (sessionId, timeColumn, valueColumn) => {
  const response = await api.post('/api/analysis/time-period-comparison', {
    session_id: sessionId,
    time_column: timeColumn,
    value_columns: [valueColumn],
  });
  return response.data;
};

export const getComprehensiveReport = async (sessionId) => {
  const response = await api.post('/api/analysis/comprehensive-report', {
    session_id: sessionId,
  });
  return response.data;
};

// Utility function for downloading files
export const downloadFile = (data, filename, type = 'text/csv') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default api;
