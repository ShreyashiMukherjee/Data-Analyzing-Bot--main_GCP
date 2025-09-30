# Data Analysis Tool

A comprehensive full-stack data analysis application built with React frontend and FastAPI backend. This tool allows users to upload datasets, perform various statistical analyses, and generate comprehensive reports with interactive visualizations.

## 🚀 Features

- **File Upload \& Processing**: Support for CSV, Excel (.xlsx, .xls), and JSON files with customizable header and row processing options
- **Statistical Analysis**: Basic statistics, distribution analysis, missing values analysis
- **Time Series Analysis**: Interactive time series plots with date range information
- **Correlation Analysis**: Correlation matrix heatmaps and top correlations identification
- **Interactive Chat**: AI-powered chatbot for data analysis queries using Google Gemini API
- **Comprehensive Reporting**: Downloadable JSON reports with all analysis results
- **Real-time Visualizations**: Interactive charts and plots using Plotly.js


## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm package manager


## 🛠 Installation \& Setup

### Backend Setup

1. **Clone the repository**

```bash
git clone < https://github.com/Prathamkogta/Data-Analyzing-Bot-.git>
cd <Data-Analysing-Bot->
```

2. **Navigate to the backend directory**

```bash
cd backend  # or wherever your Python files are located
```

3. **Create a virtual environment**

```bash
python -m venv venv
```

4. **Activate the virtual environment**
    - On Windows:

```bash
venv\Scripts\activate
```

    - On macOS/Linux:

```bash
source venv/bin/activate
```

5. **Install Python dependencies**

```bash
pip install -r requirements.txt
```


### Frontend Setup

1. **Navigate to the frontend directory**

```bash
cd frontend
```

2. **Install Node.js dependencies**

```bash
npm install
```

3. **Install additional required packages** (if not already included)

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-plotly.js plotly.js axios
```


## 🚀 Running the Application

### Start the Backend Server

1. **Navigate to the backend directory**

```bash
cd backend
```

2. **Activate virtual environment** (if not already activated)

```bash
# Windows
venv\Scripts\activate

# macOS/Linux  
source venv/bin/activate
```

3. **Start the FastAPI server**

```bash
python app.py
```

Or alternatively:

```bash
uvicorn app:app --reload 
```

The backend server will start on `http://localhost:8000`

### Start the Frontend Server

1. **Open a new terminal window/tab**
2. **Navigate to the frontend directory**

```bash
cd frontend
```

3. **Start the React development server**

```bash
npm start
```

The frontend application will start on `http://localhost:3000` and automatically open in your browser.

## 📁 Project Structure

```
├── backend/
│   ├── app.py                 # FastAPI main application
│   ├── routers/
│   │   ├── upload.py         # File upload endpoints
│   │   ├── analysis.py       # Analysis endpoints
│   │   └── chat.py          # Chat/AI endpoints
│   ├── models/
│   │   └── analyzer.py       # Data analysis logic
│   └── uploads/              # Temporary file storage
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataUpload.js
│   │   │   ├── FullReport.js
│   │   │   ├── TimeSeriesAnalysis.js
│   │   │   ├── CorrelationAnalysis.js
│   │   │   └── BasicStats.js
│   │   ├── services/
│   │   │   └── api.js        # API service functions
│   │   └── App.js
│   ├── package.json
│   └── node_modules/         # Auto-generated after npm install
└── README.md
```


## 🎯 Usage

1. **Access the application** at `http://localhost:3000`
2. **Upload Data**:
    - Choose between sample data or upload your own file
    - For custom uploads, configure header options, skip rows, etc.
    - Supported formats: CSV, Excel (.xlsx, .xls), JSON
3. **Perform Analysis**:
    - **Basic Statistics**: View descriptive statistics for numeric columns
    - **Time Series Analysis**: Analyze temporal data with interactive plots
    - **Correlation Analysis**: Explore relationships between variables
    - **Missing Values**: Analyze and handle missing data
    - **Generate Reports**: Create comprehensive analysis reports
4. **Interactive Chat**: Ask questions about your data using the AI chatbot


### API Configuration

The Gemini API key is configured in `chat.py`. To use your own API key:

1. Get a Gemini API key from Google AI Studio
2. Replace the `DEFAULT_GEMINI_API_KEY` in `chat.py`

## 📊 Supported File Formats

- **CSV**: Comma-separated values with customizable headers and encoding
- **Excel**: `.xlsx` and `.xls` files with sheet selection
- **JSON**: JSON format with automatic pandas conversion


## 🔍 Available Analysis Types

- **Descriptive Statistics**: Mean, median, std deviation, quartiles, skewness, kurtosis
- **Distribution Analysis**: Histograms and box plots for individual columns
- **Time Series Analysis**: Temporal data visualization and analysis
- **Correlation Analysis**: Pearson correlation matrix and heatmaps
- **Missing Values Analysis**: Detection and handling of missing data
- **Comprehensive Reporting**: Combined analysis with downloadable results


## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
    - Backend: Change port in `app.py` or use `--port` flag
    - Frontend: Use `PORT=3001 npm start` to use different port
2. **Module not found errors**:
    - Ensure all dependencies are installed
    - Check virtual environment activation for backend
    - Run `npm install` again for frontend
3. **CORS errors**:
    - Ensure backend is running on `http://localhost:8000`
    - Check CORS configuration in `app.py`
4. **File upload errors**:
    - Ensure `uploads/` directory exists in backend
    - Check file size limits and format support

### Development Notes

- The app includes deprecation warnings from webpack dev server - these are non-critical
- Plotly.js source map warnings can be suppressed with `GENERATE_SOURCEMAP=false`
- For production deployment, build the frontend with `npm run build`




