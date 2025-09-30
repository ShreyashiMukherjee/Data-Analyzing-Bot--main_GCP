import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
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
import { getCorrelationAnalysis } from '../services/api';

const CorrelationAnalysis = ({ sessionId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCorrelationData = async () => {
      try {
        const result = await getCorrelationAnalysis(sessionId);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        setError('Error fetching correlation data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrelationData();
  }, [sessionId]);

  const createHeatmap = () => {
    if (!data) return null;

    return {
      data: [{
        z: data.correlation_matrix.values,
        x: data.correlation_matrix.columns,
        y: data.correlation_matrix.columns,
        type: 'heatmap',
        colorscale: 'RdBu',
        zmid: 0,
        zmin: -1,
        zmax: 1,
        showscale: true
      }],
      layout: {
        title: 'Correlation Matrix Heatmap',
        xaxis: { title: 'Features' },
        yaxis: { title: 'Features' },
        template: 'plotly_white',
        height: 600
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
          Correlation Analysis
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
          {/* Correlation Heatmap */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Plot
                data={createHeatmap().data}
                layout={createHeatmap().layout}
                style={{ width: '100%' }}
                useResizeHandler
              />
            </CardContent>
          </Card>

          {/* Top Correlations */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Correlations
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Variables</strong></TableCell>
                      <TableCell><strong>Correlation</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.top_correlations.map((corr, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {corr.variable1} vs {corr.variable2}
                        </TableCell>
                        <TableCell>
                          <Typography
                            color={Math.abs(corr.correlation) > 0.7 ? 'error' : 'text.primary'}
                            fontWeight={Math.abs(corr.correlation) > 0.7 ? 'bold' : 'normal'}
                          >
                            {corr.correlation.toFixed(4)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default CorrelationAnalysis;