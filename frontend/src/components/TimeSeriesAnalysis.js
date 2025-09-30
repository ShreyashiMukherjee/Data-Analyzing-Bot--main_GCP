import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { getTimeSeriesData } from '../services/api';

const TimeSeriesAnalysis = ({ sessionId, datetimeColumns, numericColumns, onBack }) => {
  const [timeColumn, setTimeColumn] = useState(datetimeColumns[0] || '');
  const [selectedColumns, setSelectedColumns] = useState([numericColumns[0]] || []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (timeColumn && selectedColumns.length > 0) {
      fetchTimeSeriesData();
    }
  }, [timeColumn, selectedColumns]);

  const fetchTimeSeriesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTimeSeriesData(sessionId, timeColumn, selectedColumns);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Error fetching time series data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTimeSeriesPlot = () => {
    if (!data) return null;

    const traces = selectedColumns.map((col, index) => ({
      x: data.timestamps,
      y: data.data[col],
      type: 'scatter',
      mode: 'lines',
      name: col,
      line: { width: 2 }
    }));

    return {
      data: traces,
      layout: {
        title: 'Time Series Analysis',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Value' },
        template: 'plotly_white',
        hovermode: 'x unified',
        height: 600
      }
    };
  };

  if (datetimeColumns.length === 0) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Menu
        </Button>
        <Alert severity="warning">
          No datetime columns detected. Please ensure your data includes a timestamp column.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Back to Menu
        </Button>
        <Typography variant="h4" component="h1">
          Time Series Analysis
        </Typography>
        <div />
      </Box>

      {/* Configuration */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Column</InputLabel>
              <Select
                value={timeColumn}
                label="Time Column"
                onChange={(e) => setTimeColumn(e.target.value)}
              >
                {datetimeColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Value Columns</InputLabel>
              <Select
                multiple
                value={selectedColumns}
                label="Value Columns"
                onChange={(e) => setSelectedColumns(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {numericColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && !loading && (
        <Box>
          {/* Time Series Plot */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Series Visualization
              </Typography>
              <Plot
                data={createTimeSeriesPlot().data}
                layout={createTimeSeriesPlot().layout}
                style={{ width: '100%' }}
                useResizeHandler
              />
            </CardContent>
          </Card>

          {/* Time Range Information */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Range Information
              </Typography>
              <Typography variant="body1">
                <strong>Start:</strong> {new Date(data.time_range.min).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>End:</strong> {new Date(data.time_range.max).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> {data.time_range.span}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default TimeSeriesAnalysis;