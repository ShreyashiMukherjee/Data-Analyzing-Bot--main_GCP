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
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ArrowBack, Download, Assessment } from '@mui/icons-material';
import { getBasicStats, getMissingValuesAnalysis, getCorrelationAnalysis, getComprehensiveReport } from '../services/api';

const FullReport = ({ sessionId, onBack }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the comprehensive report endpoint instead of multiple calls
      const result = await getComprehensiveReport(sessionId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setReportData({
          basicStats: result.basic_statistics,
          missingValues: result.missing_values,
          correlationData: result.correlations,
          datasetInfo: result.dataset_info,
          timeSeriesInfo: result.time_series_info,
          generatedAt: result.generated_at
        });
      }
    } catch (err) {
      setError('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comprehensive_report.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generating comprehensive report...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          variant="outlined"
        >
          Back to Menu
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Comprehensive Data Analysis Report
        </Typography>
        
        <Button
          startIcon={<Download />}
          onClick={downloadReport}
          variant="contained"
          disabled={!reportData}
          sx={{ ml: 2 }}
        >
          Download Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reportData && (
        <Box>
          {/* Report Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Comprehensive Analysis Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated on: {new Date(reportData.generatedAt).toLocaleString()}
            </Typography>
          </Paper>

          {/* Dataset Overview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. Dataset Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.datasetInfo?.shape[0] || reportData.basicStats.shape[0]}
                    </Typography>
                    <Typography variant="body2">Rows</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.datasetInfo?.shape[1] || reportData.basicStats.shape[1]}
                    </Typography>
                    <Typography variant="body2">Columns</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {Object.keys(reportData.basicStats.basic_stats || {}).length}
                    </Typography>
                    <Typography variant="body2">Numeric Columns</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.missingValues.missing_summary?.missing_counts?.reduce((a, b) => a + b, 0) || 0}
                    </Typography>
                    <Typography variant="body2">Missing Values</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Basic Statistics */}
          {reportData.basicStats?.basic_stats && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                2. Basic Statistics Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Column</strong></TableCell>
                      <TableCell><strong>Mean</strong></TableCell>
                      <TableCell><strong>Std Dev</strong></TableCell>
                      <TableCell><strong>Min</strong></TableCell>
                      <TableCell><strong>Max</strong></TableCell>
                      <TableCell><strong>Skewness</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(reportData.basicStats.basic_stats).map(([column, stats]) => (
                      <TableRow key={column}>
                        <TableCell>{column}</TableCell>
                        <TableCell>{stats.mean?.toFixed(3) || 'N/A'}</TableCell>
                        <TableCell>{stats.std?.toFixed(3) || 'N/A'}</TableCell>
                        <TableCell>{stats.min?.toFixed(3) || 'N/A'}</TableCell>
                        <TableCell>{stats.max?.toFixed(3) || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={Math.abs(stats.skewness || 0).toFixed(2)}
                            color={Math.abs(stats.skewness || 0) > 1 ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Missing Values Summary */}
          {reportData.missingValues?.missing_summary && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                3. Data Quality Assessment
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Column</strong></TableCell>
                      <TableCell><strong>Missing Count</strong></TableCell>
                      <TableCell><strong>Missing %</strong></TableCell>
                      <TableCell><strong>Quality Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.missingValues.missing_summary.columns.map((column, index) => {
                      const missingPct = reportData.missingValues.missing_summary.missing_percentages[index];
                      const getQualityStatus = (pct) => {
                        if (pct === 0) return { label: 'Excellent', color: 'success' };
                        if (pct < 5) return { label: 'Good', color: 'info' };
                        if (pct < 30) return { label: 'Fair', color: 'warning' };
                        return { label: 'Poor', color: 'error' };
                      };
                      const status = getQualityStatus(missingPct);

                      return (
                        <TableRow key={column}>
                          <TableCell>{column}</TableCell>
                          <TableCell>{reportData.missingValues.missing_summary.missing_counts[index]}</TableCell>
                          <TableCell>{missingPct.toFixed(2)}%</TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Correlation Summary */}
          {reportData.correlationData && !reportData.correlationData.error && reportData.correlationData.top_correlations && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                4. Key Correlations
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Variable Pair</strong></TableCell>
                      <TableCell><strong>Correlation</strong></TableCell>
                      <TableCell><strong>Strength</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.correlationData.top_correlations.slice(0, 5).map((corr, index) => {
                      const getStrength = (value) => {
                        const abs = Math.abs(value);
                        if (abs > 0.8) return { label: 'Very Strong', color: 'error' };
                        if (abs > 0.6) return { label: 'Strong', color: 'warning' };
                        if (abs > 0.4) return { label: 'Moderate', color: 'info' };
                        return { label: 'Weak', color: 'default' };
                      };
                      const strength = getStrength(corr.correlation);

                      return (
                        <TableRow key={index}>
                          <TableCell>{corr.variable1} vs {corr.variable2}</TableCell>
                          <TableCell>
                            <Typography
                              color={Math.abs(corr.correlation) > 0.7 ? 'error' : 'text.primary'}
                              fontWeight={Math.abs(corr.correlation) > 0.7 ? 'bold' : 'normal'}
                            >
                              {corr.correlation.toFixed(4)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={strength.label}
                              color={strength.color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Summary and Recommendations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              5. Summary and Recommendations
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" paragraph>
                <strong>Data Completeness:</strong> Your dataset has {reportData.missingValues.total_rows} records
                with {reportData.missingValues.missing_summary?.missing_counts?.reduce((a, b) => a + b, 0) || 0} total missing values.
              </Typography>
              <Typography component="li" paragraph>
                <strong>Numeric Features:</strong> {Object.keys(reportData.basicStats.basic_stats || {}).length} numeric columns available for quantitative analysis.
              </Typography>
              {reportData.correlationData && !reportData.correlationData.error && (
                <Typography component="li" paragraph>
                  <strong>Correlations:</strong> Found {reportData.correlationData.top_correlations?.length || 0} variable relationships,
                  with {reportData.correlationData.top_correlations?.filter(c => Math.abs(c.correlation) > 0.7).length || 0} strong correlations.
                </Typography>
              )}
              <Typography component="li" paragraph>
                <strong>Next Steps:</strong> Consider using the chatbot for specific questions or explore individual analysis modules for deeper insights.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FullReport;
