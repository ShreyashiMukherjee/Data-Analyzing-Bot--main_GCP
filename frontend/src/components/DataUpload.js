import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { CloudUpload, DataUsage, Visibility } from '@mui/icons-material';
import { uploadFile, loadSampleData, previewFile } from '../services/api';

const DataUpload = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('sample');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // File processing options
  const [hasHeader, setHasHeader] = useState(true);
  const [skipRows, setSkipRows] = useState(0);
  const [headerRow, setHeaderRow] = useState(0);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    
    // Show preview and options for uploaded files
    if (dataSource === 'upload') {
      try {
        setLoading(true);
        const preview = await previewFile(file);
        setPreviewData(preview);
        setShowOptions(true);
      } catch (err) {
        setError('Error previewing file: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadFile(selectedFile, {
        has_header: hasHeader,
        skip_rows: skipRows,
        header_row: headerRow
      });

      if (result.error) {
        setError(result.error);
      } else {
        onDataLoaded(result);
        setShowOptions(false);
      }
    } catch (err) {
      setError('Error uploading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadSampleData();
      if (result.error) {
        setError(result.error);
      } else {
        onDataLoaded(result);
      }
    } catch (err) {
      setError('Error loading sample data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
    setSelectedFile(null);
    setPreviewData(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📊 Data Analysis Tool
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload your dataset and explore various analysis options
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Select Data Source</FormLabel>
          <RadioGroup
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            row
          >
            <FormControlLabel value="sample" control={<Radio />} label="Use Sample Data" />
            <FormControlLabel value="upload" control={<Radio />} label="Upload Your Own Data" />
          </RadioGroup>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {dataSource === 'upload' ? (
          <Button
            component="label"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 2 }}
          >
            {loading ? 'Processing...' : 'Upload Dataset (CSV, Excel, JSON)'}
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
            />
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <DataUsage />}
            fullWidth
            size="large"
            onClick={handleSampleData}
            disabled={loading}
            sx={{ py: 2 }}
          >
            {loading ? 'Loading...' : 'Load Sample Data'}
          </Button>
        )}
      </Paper>

      {/* File Processing Options Dialog */}
      <Dialog 
        open={showOptions} 
        onClose={handleCloseOptions}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility />
            File Processing Options
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {previewData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                File Preview: {selectedFile?.name}
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Header Options</FormLabel>
                    <RadioGroup
                      value={hasHeader}
                      onChange={(e) => setHasHeader(e.target.value === 'true')}
                    >
                      <FormControlLabel 
                        value={true} 
                        control={<Radio />} 
                        label="First row contains headers" 
                      />
                      <FormControlLabel 
                        value={false} 
                        control={<Radio />} 
                        label="No headers (use default names)" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rows to Skip"
                    value={skipRows}
                    onChange={(e) => setSkipRows(Math.max(0, parseInt(e.target.value) || 0))}
                    inputProps={{ min: 0 }}
                    helperText="Number of rows to skip from the top"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Header Row"
                    value={headerRow}
                    onChange={(e) => setHeaderRow(Math.max(0, parseInt(e.target.value) || 0))}
                    inputProps={{ min: 0 }}
                    disabled={!hasHeader}
                    helperText="Row number to use as column headers"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Data Preview (First 10 rows):
                </Typography>
                <Chip 
                  label={`${previewData.total_rows} total rows`} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {previewData.columns.map((col, index) => (
                        <TableCell key={index}>
                          <strong>{col}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.preview_data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell !== null ? String(cell) : 'null'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseOptions}>
            Cancel
          </Button>
          <Button 
            onClick={handleFileUpload}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Processing...' : 'Process File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataUpload;
