import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import { getBasicStats } from '../services/api';

const BasicStats = ({ sessionId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getBasicStats(sessionId);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        setError('Error fetching basic statistics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [sessionId]);

  const downloadCSV = (tableData, filename) => {
    if (!tableData) return;
    
    const headers = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max', 'skewness', 'kurtosis'];
    const rows = Object.keys(tableData).map(key => [
      key, 
      ...headers.map(h => tableData[key][h] || 'N/A')
    ]);
    
    const csvContent = [
      ['Column', ...headers],
      ...rows
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading basic statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={onBack} 
          sx={{ mb: 2 }}
        >
          Back to Menu
        </Button>
        <Alert severity="error">
          {error}
        </Alert>
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
          Basic Statistical Features
        </Typography>
        
        <Button
          startIcon={<Download />}
          onClick={() => downloadCSV(data.basic_stats, 'basic_stats.csv')}
          variant="contained"
          disabled={!data || !data.basic_stats}
        >
          Download
        </Button>
      </Box>

      {data && data.basic_stats && (
        <Paper sx={{ p: 3 }}>
          {/* Dataset Overview */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dataset Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {data.shape[0]}
                    </Typography>
                    <Typography variant="body2">Rows</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {Object.keys(data.basic_stats).length}
                    </Typography>
                    <Typography variant="body2">Numeric Columns</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Basic Statistics Table */}
          <Typography variant="h6" gutterBottom>
            Descriptive Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Column</strong></TableCell>
                  <TableCell><strong>Count</strong></TableCell>
                  <TableCell><strong>Mean</strong></TableCell>
                  <TableCell><strong>Std</strong></TableCell>
                  <TableCell><strong>Min</strong></TableCell>
                  <TableCell><strong>25%</strong></TableCell>
                  <TableCell><strong>50%</strong></TableCell>
                  <TableCell><strong>75%</strong></TableCell>
                  <TableCell><strong>Max</strong></TableCell>
                  <TableCell><strong>Skewness</strong></TableCell>
                  <TableCell><strong>Kurtosis</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data.basic_stats).map(([column, stats]) => (
                  <TableRow key={column}>
                    <TableCell>{column}</TableCell>
                    <TableCell>{stats.count?.toFixed(0) || 'N/A'}</TableCell>
                    <TableCell>{stats.mean?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats.std?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats.min?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats['25%']?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats['50%']?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats['75%']?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{stats.max?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>
                      <span style={{ 
                        color: Math.abs(stats.skewness || 0) > 1 ? '#ff9800' : '#666',
                        fontWeight: Math.abs(stats.skewness || 0) > 1 ? 'bold' : 'normal'
                      }}>
                        {stats.skewness?.toFixed(4) || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        color: Math.abs(stats.kurtosis || 0) > 3 ? '#f44336' : '#666',
                        fontWeight: Math.abs(stats.kurtosis || 0) > 3 ? 'bold' : 'normal'
                      }}>
                        {stats.kurtosis?.toFixed(4) || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default BasicStats;
