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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { getMissingValuesAnalysis, handleMissingValues } from '../services/api';

const MissingValuesAnalysis = ({ sessionId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [handlingMethod, setHandlingMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMissingValuesData();
  }, []);

  const fetchMissingValuesData = async () => {
    try {
      const result = await getMissingValuesAnalysis(sessionId);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Error fetching missing values data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMissingValuesAction = async () => {
    if (!handlingMethod) return;

    setProcessing(true);
    try {
      const result = await handleMissingValues(sessionId, handlingMethod);
      if (result.error) {
        setError(result.error);
      } else {
        // Refresh the analysis
        await fetchMissingValuesData();
        setHandlingMethod('');
      }
    } catch (err) {
      setError('Error handling missing values: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const createMissingValuesChart = () => {
    if (!data) return null;

    return {
      data: [{
        x: data.missing_summary.columns,
        y: data.missing_summary.missing_percentages,
        type: 'bar',
        marker: { color: '#f39c12' },
        name: 'Missing %'
      }],
      layout: {
        title: 'Percentage of Missing Values by Column',
        xaxis: { title: 'Columns' },
        yaxis: { title: 'Percentage (%)' },
        template: 'plotly_white'
      }
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
          Missing Values Analysis
        </Typography>
        <div />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Box>
          {/* Missing Values Summary Table */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Missing Values Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Column</strong></TableCell>
                      <TableCell><strong>Missing Values</strong></TableCell>
                      <TableCell><strong>Percentage (%)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.missing_summary.columns.map((column, index) => (
                      <TableRow key={column}>
                        <TableCell>{column}</TableCell>
                        <TableCell>{data.missing_summary.missing_counts[index]}</TableCell>
                        <TableCell>
                          <Typography
                            color={data.missing_summary.missing_percentages[index] > 30 ? 'error' : 'text.primary'}
                            fontWeight={data.missing_summary.missing_percentages[index] > 30 ? 'bold' : 'normal'}
                          >
                            {data.missing_summary.missing_percentages[index].toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Missing Values Chart */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Plot
                data={createMissingValuesChart().data}
                layout={createMissingValuesChart().layout}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
              />
            </CardContent>
          </Card>

          {/* Handle Missing Values */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Handle Missing Values
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Handling Method</InputLabel>
                  <Select
                    value={handlingMethod}
                    label="Handling Method"
                    onChange={(e) => setHandlingMethod(e.target.value)}
                  >
                    <MenuItem value="drop">Drop rows with missing values</MenuItem>
                    <MenuItem value="interpolate">Linear interpolation</MenuItem>
                    <MenuItem value="forward_fill">Forward fill</MenuItem>
                    <MenuItem value="backward_fill">Backward fill</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleMissingValuesAction}
                  disabled={!handlingMethod || processing}
                  startIcon={processing ? <CircularProgress size={20} /> : null}
                >
                  {processing ? 'Processing...' : 'Apply Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default MissingValuesAnalysis;