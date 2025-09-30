import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
} from '@mui/material';
import DataUpload from './components/DataUpload';
import AnalysisMenu from './components/AnalysisMenu';
import BasicStats from './components/BasicStats';
import DistributionAnalysis from './components/DistributionAnalysis';
import TimeSeriesAnalysis from './components/TimeSeriesAnalysis';
import CorrelationAnalysis from './components/CorrelationAnalysis';
import MissingValuesAnalysis from './components/MissingValuesAnalysis';
import ChatBot from './components/ChatBot';
import FullReport from './components/FullReport';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#e74c3c',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [dataInfo, setDataInfo] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const handleDataLoaded = (sessionData) => {
    setSessionId(sessionData.session_id);
    setDataInfo(sessionData);
    setCurrentAnalysis(null);
  };

  const handleAnalysisSelect = (analysisType) => {
    setCurrentAnalysis(analysisType);
  };

  const handleBackToMenu = () => {
    setCurrentAnalysis(null);
  };

  const renderAnalysisComponent = () => {
    if (!sessionId || !dataInfo) return null;

    switch (currentAnalysis) {
      case 'basic_stats':
        return <BasicStats sessionId={sessionId} onBack={handleBackToMenu} />;
      case 'distribution':
        return (
          <DistributionAnalysis
            sessionId={sessionId}
            numericColumns={dataInfo.numeric_columns}
            onBack={handleBackToMenu}
          />
        );
      case 'missing_values':
        return <MissingValuesAnalysis sessionId={sessionId} onBack={handleBackToMenu} />;
      case 'time_series':
        return (
          <TimeSeriesAnalysis
            sessionId={sessionId}
            datetimeColumns={dataInfo.datetime_columns}
            numericColumns={dataInfo.numeric_columns}
            onBack={handleBackToMenu}
          />
        );
      case 'correlation':
        return <CorrelationAnalysis sessionId={sessionId} onBack={handleBackToMenu} />;
      case 'full_report':
        return <FullReport sessionId={sessionId} onBack={handleBackToMenu} />;
      case 'chatbot':
        return <ChatBot sessionId={sessionId} onBack={handleBackToMenu} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📊 Automated Data Analysis Tool
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!sessionId ? (
          <DataUpload onDataLoaded={handleDataLoaded} />
        ) : currentAnalysis ? (
          renderAnalysisComponent()
        ) : (
          <AnalysisMenu
            dataInfo={dataInfo}
            onAnalysisSelect={handleAnalysisSelect}
            onDataReload={() => {
              setSessionId(null);
              setDataInfo(null);
              setCurrentAnalysis(null);
            }}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;