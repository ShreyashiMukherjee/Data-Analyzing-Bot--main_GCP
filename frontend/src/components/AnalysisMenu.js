import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assessment,
  ShowChart,
  ReportProblem,
  Timeline,
  ScatterPlot,
  Description,
  Chat,
  Refresh,
} from '@mui/icons-material';

const AnalysisMenu = ({ dataInfo, onAnalysisSelect, onDataReload }) => {
  const analysisOptions = [
    {
      id: 'basic_stats',
      title: 'Basic Statistics',
      description: 'Show summary statistics for all numerical columns',
      icon: <Assessment />,
      color: '#3498db',
    },
    {
      id: 'distribution',
      title: 'Distribution Analysis',
      description: 'Show histograms and boxplots for numerical columns',
      icon: <ShowChart />,
      color: '#2ecc71',
    },
    {
      id: 'missing_values',
      title: 'Missing Values Analysis',
      description: 'Analyze and handle missing values in the dataset',
      icon: <ReportProblem />,
      color: '#f39c12',
    },
    {
      id: 'time_series',
      title: 'Time Series Analysis',
      description: 'Perform various time series analyses',
      icon: <Timeline />,
      color: '#9b59b6',
    },
    {
      id: 'correlation',
      title: 'Correlation Analysis',
      description: 'Analyze correlations between numerical features',
      icon: <ScatterPlot />,
      color: '#e67e22',
    },
    {
      id: 'full_report',
      title: 'Generate Full Report',
      description: 'Generate a comprehensive report with all analyses',
      icon: <Description />,
      color: '#34495e',
    },
    {
      id: 'chatbot',
      title: 'Chat with DataBot',
      description: 'Ask any question about your dataset using Gemini AI',
      icon: <Chat />,
      color: '#1abc9c',
    },
  ];

  return (
    <Box>
      {/* Dataset Info */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Dataset Information
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onDataReload}
          >
            Load New Data
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Shape:</strong> {dataInfo.shape[0]} rows × {dataInfo.shape[1]} columns
            </Typography>
            <Typography variant="body1">
              <strong>Numeric Columns:</strong> {dataInfo.numeric_columns.length}
            </Typography>
            <Typography variant="body1">
              <strong>DateTime Columns:</strong> {dataInfo.datetime_columns.length}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Columns:</strong>
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {dataInfo.columns.slice(0, 10).map((col, index) => (
                  <Chip
                    key={index}
                    label={col}
                    size="small"
                    color={dataInfo.numeric_columns.includes(col) ? 'primary' : 'default'}
                  />
                ))}
                {dataInfo.columns.length > 10 && (
                  <Chip label={`+${dataInfo.columns.length - 10} more`} size="small" />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Data Preview */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Data Preview
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {dataInfo.columns.slice(0, 6).map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                ))}
                {dataInfo.columns.length > 6 && <TableCell>...</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataInfo.preview.slice(0, 3).map((row, index) => (
                <TableRow key={index}>
                  {dataInfo.columns.slice(0, 6).map((col) => (
                    <TableCell key={col}>
                      {row[col] !== null && row[col] !== undefined 
                        ? String(row[col]).slice(0, 50) 
                        : 'null'}
                    </TableCell>
                  ))}
                  {dataInfo.columns.length > 6 && <TableCell>...</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Analysis Options */}
      <Typography variant="h5" component="h2" gutterBottom>
        Select Analysis Type
      </Typography>
      
      <Grid container spacing={3}>
        {analysisOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      mr: 2,
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {option.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
              <Box p={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onAnalysisSelect(option.id)}
                  sx={{ backgroundColor: option.color }}
                >
                  Start Analysis
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AnalysisMenu;