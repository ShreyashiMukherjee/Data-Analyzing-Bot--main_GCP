import pandas as pd
import numpy as np
from typing import Dict, Any, List
import json

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif pd.isna(obj):
        return None
    return obj

def serialize_dataframe_stats(df_stats: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize dataframe statistics for JSON response"""
    serialized = {}
    for key, value in df_stats.items():
        if isinstance(value, dict):
            serialized[key] = {k: convert_numpy_types(v) for k, v in value.items()}
        else:
            serialized[key] = convert_numpy_types(value)
    return serialized

def validate_file_size(file_size: int, max_size_mb: int = 50) -> bool:
    """Validate uploaded file size"""
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes

def get_file_info(file_path: str) -> Dict[str, Any]:
    """Get file information"""
    import os
    file_size = os.path.getsize(file_path)
    file_ext = file_path.split('.')[-1].lower()
    
    return {
        "size": file_size,
        "extension": file_ext,
        "size_mb": round(file_size / (1024 * 1024), 2)
    }