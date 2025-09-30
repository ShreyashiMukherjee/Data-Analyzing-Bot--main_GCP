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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ArrowBack, Download, ExpandMore } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { getDistributionAnalysis } from '../services/api';

const DistributionAnalysis = ({ sessionId, numericColumns, onBack }) => {
  const [selectedColumn, setSelectedColumn] = useState(numericColumns[0] || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedColumn) {
      fetchDistributionData(selectedColumn);
    }
  }, [selectedColumn]);

  const fetchDistributionData = async (column) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDistributionAnalysis(sessionId, column);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Error fetching distribution data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createHistogramPlot = () => {
    if (!data) return null;

    return {
      data: [{
        x: data.histogram_data,
        type: 'histogram',
        nbinsx: 30,
        marker: { color: '#3498db' },
        name: 'Frequency'
      }],
      layout: {
        title: `Distribution of ${data.column}`,
        xaxis: { title: data.column },
        yaxis: { title: 'Frequency' },
        template: 'plotly_white'
      }
    };
  };

  const createBoxPlot = () => {
    if (!data) return null;

    return {
      data: [{
        y: data.histogram_data,
        type: 'box',
        boxpoints: 'outliers',
        marker: { color: '#e74c3c' },
        name: data.column
      }],
      layout: {
        title: `Boxplot of ${data.column}`,
        yaxis: { title: data.column },
        template: 'plotly_white'
      }
    };
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Back to Menu
        </Button>
        <Typography variant="h4" component="h1">
          Distribution Analysis
        </Typography>
        <div />
      </Box>

      {/* Column Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Column for Analysis</InputLabel>
          <Select
            value={selectedColumn}
            label="Select Column for Analysis"
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            {numericColumns.map((col) => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Grid container spacing={3}>
          {/* Histogram */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Histogram
                </Typography>
                <Plot
                  data={createHistogramPlot().data}
                  layout={createHistogramPlot().layout}
                  style={{ width: '100%', height: '400px' }}
                  useResizeHandler
                />
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Histogram Insights</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      This histogram shows the frequency distribution of values in the <strong>{data.column}</strong> column.
                      The x-axis represents the range of values, divided into bins.
                      The y-axis shows how many data points fall into each bin.
                      The shape can reveal whether the data is normally distributed, skewed, or has other patterns.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          {/* Boxplot */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Boxplot
                </Typography>
                <Plot
                  data={createBoxPlot().data}
                  layout={createBoxPlot().layout}
                  style={{ width: '100%', height: '400px' }}
                  useResizeHandler
                />
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Boxplot Insights</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      The box represents the interquartile range (IQR) containing the middle 50% of data.
                      The line inside the box shows the median value.
                      The whiskers typically extend to 1.5 times the IQR from the box.
                      Points outside the whiskers are potential outliers.
                      This visualization helps identify skewness, spread, and outliers in your data.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DistributionAnalysis;