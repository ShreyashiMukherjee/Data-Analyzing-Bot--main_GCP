import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import re
import json
from typing import Dict, Any, List, Optional
from statsmodels.tsa.seasonal import seasonal_decompose

class DataAnalyzer:
    def __init__(self):
        self.df = None
        self.datetime_cols = []
        self.numeric_cols = []

    def load_dataframe(self, df: pd.DataFrame):
        """Load and prepare dataframe for analysis"""
        self.df = self.clean_dataframe(df)
        self.datetime_cols = self.detect_datetime_columns()
        self.numeric_cols = list(self.df.select_dtypes(include=[np.number]).columns)

    def clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean dataframe - handle duplicates, empty rows/columns"""
        # Remove completely empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')
        
        # Handle duplicate column names
        cols = pd.Series(df.columns)
        for dup in cols[cols.duplicated()].unique():
            cols[cols == dup] = [f"{dup}_{i}" if i != 0 else dup for i in range(sum(cols == dup))]
        df.columns = cols
        
        # Clean column names
        df.columns = [str(col).strip().replace(' ', '_').replace('.', '_').replace('-', '_') for col in df.columns]
        return df

    def detect_datetime_columns(self) -> List[str]:
        """Detect datetime columns with enhanced pattern matching"""
        datetime_cols = []
        
        # Check existing datetime columns
        existing_datetime_cols = self.df.select_dtypes(include=['datetime64']).columns
        if len(existing_datetime_cols) > 0:
            return list(existing_datetime_cols)

        # Common datetime column names
        common_datetime_names = ['date', 'time', 'timestamp', 'datetime', 'created', 'modified']
        
        # Check columns with common names first
        potential_cols = []
        for col in self.df.columns:
            col_lower = col.lower()
            if any(dt_name in col_lower for dt_name in common_datetime_names):
                potential_cols.append(col)

        # Check other string columns
        for col in self.df.select_dtypes(include=['object']).columns:
            if col not in potential_cols:
                sample = self.df[col].dropna().head(5).astype(str)
                if sample.empty:
                    continue
                    
                # Date pattern detection
                date_patterns = [
                    r'\d{4}-\d{2}-\d{2}',
                    r'\d{2}-\d{2}-\d{4}',
                    r'\d{2}/\d{2}/\d{4}',
                    r'\d{4}/\d{2}/\d{2}',
                    r'\d{2}-\w{3}-\d{4}',
                    r'\d{2}/\w{3}/\d{4}',
                    r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}',
                ]
                
                has_date_pattern = any(any(re.search(pattern, str(val)) for pattern in date_patterns) for val in sample)
                if has_date_pattern:
                    potential_cols.append(col)

        # Try to convert potential columns
        date_formats = [
            '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%Y/%m/%d',
            '%d-%b-%Y', '%d/%b/%Y', '%Y-%m-%d %H:%M:%S',
            '%m-%d-%Y', '%m/%d/%y', '%b %d %Y', '%B %d %Y'
        ]
        
        for col in potential_cols:
            converted = False
            for date_format in date_formats:
                try:
                    self.df[col] = pd.to_datetime(self.df[col], format=date_format, errors='raise')
                    datetime_cols.append(col)
                    converted = True
                    break
                except (ValueError, TypeError):
                    continue
                    
            if not converted:
                try:
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                    if not self.df[col].isnull().all():
                        datetime_cols.append(col)
                except (ValueError, TypeError):
                    continue

        return datetime_cols

    def get_basic_stats(self) -> Dict[str, Any]:
        """Get basic statistical features"""
        if not self.numeric_cols:
            return {"error": "No numeric columns found"}
        
        stats = self.df[self.numeric_cols].describe().T
        
        # Additional statistics
        skewness = self.df[self.numeric_cols].skew()
        kurtosis = self.df[self.numeric_cols].kurtosis()
        
        # Convert to serializable format
        basic_stats = {}
        for col in self.numeric_cols:
            basic_stats[col] = {
                'count': int(stats.loc[col, 'count']),
                'mean': float(stats.loc[col, 'mean']),
                'std': float(stats.loc[col, 'std']),
                'min': float(stats.loc[col, 'min']),
                '25%': float(stats.loc[col, '25%']),
                '50%': float(stats.loc[col, '50%']),
                '75%': float(stats.loc[col, '75%']),
                'max': float(stats.loc[col, 'max']),
                'skewness': float(skewness[col]) if not pd.isna(skewness[col]) else 0.0,
                'kurtosis': float(kurtosis[col]) if not pd.isna(kurtosis[col]) else 0.0
            }
        
        return {
            "basic_stats": basic_stats,
            "shape": list(self.df.shape)
        }

    def get_distribution_analysis(self, column: str) -> Dict[str, Any]:
        """Get distribution analysis for a specific column"""
        if column not in self.numeric_cols:
            return {"error": f"Column {column} not found or not numeric"}
        
        # Histogram data
        hist_data = self.df[column].dropna()
        
        # Box plot data
        box_stats = {
            "q1": float(hist_data.quantile(0.25)),
            "median": float(hist_data.median()),
            "q3": float(hist_data.quantile(0.75)),
            "min": float(hist_data.min()),
            "max": float(hist_data.max()),
            "outliers": []
        }
        
        # Calculate outliers
        iqr = box_stats["q3"] - box_stats["q1"]
        lower_bound = box_stats["q1"] - 1.5 * iqr
        upper_bound = box_stats["q3"] + 1.5 * iqr
        outliers = hist_data[(hist_data < lower_bound) | (hist_data > upper_bound)]
        box_stats["outliers"] = [float(x) for x in outliers.tolist()]
        
        return {
            "histogram_data": [float(x) for x in hist_data.tolist()],
            "box_stats": box_stats,
            "column": column
        }

    def get_missing_values_analysis(self) -> Dict[str, Any]:
        """Analyze missing values"""
        missing_vals = self.df.isnull().sum()
        missing_percentages = (missing_vals / len(self.df) * 100).round(2)
        
        return {
            "missing_summary": {
                "columns": missing_vals.index.tolist(),
                "missing_counts": [int(x) for x in missing_vals.tolist()],
                "missing_percentages": [float(x) for x in missing_percentages.tolist()]
            },
            "total_rows": int(len(self.df))
        }

    def handle_missing_values(self, method: str) -> Dict[str, Any]:
        """Handle missing values with specified method"""
        original_shape = self.df.shape
        
        if method == "drop":
            self.df = self.df.dropna()
        elif method == "interpolate":
            self.df = self.df.interpolate(method='linear')
        elif method == "forward_fill":
            self.df = self.df.fillna(method='ffill')
        elif method == "backward_fill":
            self.df = self.df.fillna(method='bfill')
        else:
            return {"error": "Invalid method"}
        
        # Update column lists
        self.numeric_cols = list(self.df.select_dtypes(include=[np.number]).columns)
        
        return {
            "original_shape": list(original_shape),
            "new_shape": list(self.df.shape),
            "message": f"Missing values handled using {method} method"
        }

    def get_time_series_data(self, time_col: str, value_cols: List[str]) -> Dict[str, Any]:
        """Get time series data for plotting"""
        if time_col not in self.datetime_cols:
            return {"error": f"Column {time_col} is not a datetime column"}
        
        # Validate value columns
        invalid_cols = [col for col in value_cols if col not in self.df.columns]
        if invalid_cols:
            return {"error": f"Columns not found: {invalid_cols}"}
        
        try:
            # Prepare data
            temp_df = self.df[[time_col] + value_cols].copy()
            temp_df = temp_df.sort_values(time_col)
            
            # Remove rows with NaT in time column
            temp_df = temp_df.dropna(subset=[time_col])
            
            if temp_df.empty:
                return {"error": "No valid data after cleaning"}
            
            # Convert to JSON-serializable format
            result = {
                "timestamps": temp_df[time_col].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                "data": {},
                "time_range": {
                    "min": temp_df[time_col].min().strftime('%Y-%m-%dT%H:%M:%S'),
                    "max": temp_df[time_col].max().strftime('%Y-%m-%dT%H:%M:%S'),
                    "span": str(temp_df[time_col].max() - temp_df[time_col].min())
                }
            }
            
            for col in value_cols:
                # Convert to float and handle NaN values
                values = temp_df[col].astype(float)
                result["data"][col] = [float(x) if not pd.isna(x) else None for x in values.tolist()]
            
            return result
            
        except Exception as e:
            return {"error": f"Error processing time series data: {str(e)}"}

    def get_correlation_analysis(self) -> Dict[str, Any]:
        """Get correlation analysis"""
        if len(self.numeric_cols) < 2:
            return {"error": "At least two numeric columns required"}
        
        try:
            corr_matrix = self.df[self.numeric_cols].corr()
            
            # Handle NaN values in correlation matrix
            corr_matrix = corr_matrix.fillna(0)
            
            # Top correlations
            correlations = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):  # Fixed the range
                    corr_val = corr_matrix.iloc[i, j]
                    if not pd.isna(corr_val) and abs(corr_val) < 1.0:  # Exclude self-correlations
                        correlations.append({
                            'variable1': corr_matrix.columns[i],
                            'variable2': corr_matrix.columns[j],
                            'correlation': float(corr_val)
                        })
            
            # Sort by absolute correlation value
            correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
            
            return {
                "correlation_matrix": {
                    "columns": corr_matrix.columns.tolist(),
                    "values": [[float(val) if not pd.isna(val) else 0.0 for val in row] for row in corr_matrix.values]
                },
                "top_correlations": correlations[:10]  # Top 10 correlations
            }
            
        except Exception as e:
            return {"error": f"Error in correlation analysis: {str(e)}"}

    def generate_sample_data(self) -> pd.DataFrame:
        """Generate sample data similar to original"""
        dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
        df = pd.DataFrame({
            'Timestamp': dates,
            'Efficiency': np.sin(np.linspace(0, 10, 365)) * 10 + 80 + np.random.normal(0, 3, 365),
            'Temperature': np.cos(np.linspace(0, 8, 365)) * 15 + 150 + np.random.normal(0, 5, 365),
            'Pressure': np.sin(np.linspace(0, 6, 365)) * 8 + 50 + np.random.normal(0, 2, 365),
            'Flow_Rate': np.cos(np.linspace(0, 12, 365)) * 20 + 100 + np.random.normal(0, 8, 365),
            'Quality_Score': np.random.uniform(0.7, 1.0, 365)
        })
        return df

    def get_trend_analysis(self, time_col: str, value_col: str, window_size: int = 7) -> Dict[str, Any]:
        """Get trend analysis with moving averages"""
        try:
            if time_col not in self.datetime_cols:
                return {"error": f"Column {time_col} is not a datetime column"}
            
            if value_col not in self.numeric_cols:
                return {"error": f"Column {value_col} is not numeric"}
            
            temp_df = self.df[[time_col, value_col]].copy().sort_values(time_col)
            temp_df = temp_df.dropna()
            
            if temp_df.empty:
                return {"error": "No valid data after cleaning"}
            
            rolling_mean = temp_df[value_col].rolling(window=window_size, min_periods=1).mean()
            
            return {
                "timestamps": temp_df[time_col].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                "original_data": [float(x) for x in temp_df[value_col].tolist()],
                "rolling_mean": [float(x) for x in rolling_mean.tolist()],
                "window_size": window_size,
                "column": value_col
            }
        except Exception as e:
            return {"error": str(e)}

    def get_seasonal_decomposition(self, time_col: str, value_col: str, period: int = 30) -> Dict[str, Any]:
        """Perform seasonal decomposition"""
        try:
            if time_col not in self.datetime_cols:
                return {"error": f"Column {time_col} is not a datetime column"}
            
            if value_col not in self.numeric_cols:
                return {"error": f"Column {value_col} is not numeric"}
            
            temp_df = self.df[[time_col, value_col]].copy().set_index(time_col).sort_index()
            temp_df = temp_df.dropna()
            
            if len(temp_df) < 2 * period:
                return {"error": f"Insufficient data for decomposition. Need at least {2 * period} data points"}
            
            decomposition = seasonal_decompose(temp_df[value_col], period=period, model='additive')
            
            return {
                "timestamps": temp_df.index.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                "observed": [float(x) for x in temp_df[value_col].tolist()],
                "trend": [float(x) if not pd.isna(x) else None for x in decomposition.trend.tolist()],
                "seasonal": [float(x) for x in decomposition.seasonal.tolist()],
                "residual": [float(x) if not pd.isna(x) else None for x in decomposition.resid.tolist()],
                "period": period,
                "column": value_col
            }
        except Exception as e:
            return {"error": str(e)}

    def compare_time_periods(self, time_col: str, value_col: str) -> Dict[str, Any]:
        """Compare first and second half of time series"""
        try:
            if time_col not in self.datetime_cols:
                return {"error": f"Column {time_col} is not a datetime column"}
            
            if value_col not in self.numeric_cols:
                return {"error": f"Column {value_col} is not numeric"}
            
            temp_df = self.df[[time_col, value_col]].copy().sort_values(time_col)
            temp_df = temp_df.dropna()
            
            if temp_df.empty:
                return {"error": "No valid data after cleaning"}
            
            mid_point = temp_df[time_col].min() + (temp_df[time_col].max() - temp_df[time_col].min()) / 2
            
            first_half = temp_df[temp_df[time_col] <= mid_point]
            second_half = temp_df[temp_df[time_col] > mid_point]
            
            return {
                "first_half": {
                    "timestamps": first_half[time_col].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                    "values": [float(x) for x in first_half[value_col].tolist()],
                    "stats": {
                        "mean": float(first_half[value_col].mean()),
                        "median": float(first_half[value_col].median()),
                        "std": float(first_half[value_col].std()),
                        "min": float(first_half[value_col].min()),
                        "max": float(first_half[value_col].max())
                    }
                },
                "second_half": {
                    "timestamps": second_half[time_col].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                    "values": [float(x) for x in second_half[value_col].tolist()],
                    "stats": {
                        "mean": float(second_half[value_col].mean()),
                        "median": float(second_half[value_col].median()),
                        "std": float(second_half[value_col].std()),
                        "min": float(second_half[value_col].min()),
                        "max": float(second_half[value_col].max())
                    }
                },
                "column": value_col
            }
        except Exception as e:
            return {"error": str(e)}

    def get_periodic_analysis(self, time_col: str, value_col: str, period_type: str = "daily") -> Dict[str, Any]:
        """Analyze data by hour/day/month"""
        try:
            if time_col not in self.datetime_cols:
                return {"error": f"Column {time_col} is not a datetime column"}
            
            if value_col not in self.numeric_cols:
                return {"error": f"Column {value_col} is not numeric"}
            
            temp_df = self.df[[time_col, value_col]].copy()
            temp_df = temp_df.dropna()
            
            if temp_df.empty:
                return {"error": "No valid data after cleaning"}
            
            if period_type == "hourly":
                temp_df['period'] = temp_df[time_col].dt.hour
                period_name = "Hour"
            elif period_type == "daily":
                temp_df['period'] = temp_df[time_col].dt.day
                period_name = "Day"
            elif period_type == "monthly":
                temp_df['period'] = temp_df[time_col].dt.month
                period_name = "Month"
            else:
                return {"error": "Invalid period type"}
            
            period_stats = temp_df.groupby('period')[value_col].agg(['mean', 'min', 'max', 'std']).reset_index()
            
            return {
                "periods": [int(x) for x in period_stats['period'].tolist()],
                "mean_values": [float(x) for x in period_stats['mean'].tolist()],
                "min_values": [float(x) for x in period_stats['min'].tolist()],
                "max_values": [float(x) for x in period_stats['max'].tolist()],
                "std_values": [float(x) if not pd.isna(x) else 0.0 for x in period_stats['std'].tolist()],
                "period_type": period_type,
                "period_name": period_name,
                "column": value_col
            }
        except Exception as e:
            return {"error": str(e)}

    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate a comprehensive analysis report"""
        try:
            report = {
                "dataset_info": {
                    "shape": list(self.df.shape),
                    "columns": self.df.columns.tolist(),
                    "numeric_columns": self.numeric_cols,
                    "datetime_columns": self.datetime_cols,
                    "memory_usage": int(self.df.memory_usage(deep=True).sum())
                },
                "basic_statistics": self.get_basic_stats(),
                "missing_values": self.get_missing_values_analysis(),
                "correlations": self.get_correlation_analysis() if len(self.numeric_cols) >= 2 else None,
                "generated_at": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            }
            
            # Add time series analysis if datetime columns exist
            if self.datetime_cols and self.numeric_cols:
                time_col = self.datetime_cols[0]
                value_col = self.numeric_cols[0]
                
                # Time range information
                min_date = self.df[time_col].min()
                max_date = self.df[time_col].max()
                report["time_series_info"] = {
                    "time_column": time_col,
                    "time_range": {
                        "start": min_date.strftime('%Y-%m-%dT%H:%M:%S'),
                        "end": max_date.strftime('%Y-%m-%dT%H:%M:%S'),
                        "duration": str(max_date - min_date)
                    },
                    "sample_analysis": self.compare_time_periods(time_col, value_col)
                }
            
            return report
        except Exception as e:
            return {"error": str(e)}
