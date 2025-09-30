from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import pandas as pd
import os
import uuid
from models.analyzer import DataAnalyzer
import numpy as np
from typing import Optional
import json

router = APIRouter()

analyzers = {}  # Store analyzer instances by session ID

@router.post("/preview")
async def preview_file(file: UploadFile = File(...)):
    """Preview file content before processing"""
    try:
        # Save uploaded file temporarily
        temp_id = str(uuid.uuid4())
        file_path = f"uploads/{temp_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load data based on file type for preview
        file_ext = file.filename.split('.')[-1].lower()
        
        try:
            if file_ext == 'csv':
                # Read first 15 rows for preview
                df_preview = pd.read_csv(file_path, nrows=15, header=None)
                total_rows = sum(1 for line in open(file_path, 'r', encoding='utf-8'))
            elif file_ext in ['xls', 'xlsx']:
                df_preview = pd.read_excel(file_path, nrows=15, header=None)
                # For Excel, read full file to get total rows (can be optimized)
                df_full = pd.read_excel(file_path, header=None)
                total_rows = len(df_full)
            elif file_ext == 'json':
                df_preview = pd.read_json(file_path).head(15)
                df_full = pd.read_json(file_path)
                total_rows = len(df_full)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format")
        except UnicodeDecodeError:
            if file_ext == 'csv':
                df_preview = pd.read_csv(file_path, nrows=15, header=None, encoding='latin1')
                total_rows = sum(1 for line in open(file_path, 'r', encoding='latin1'))
            else:
                raise
        
        # Clean up temporary file
        os.remove(file_path)
        
        # Prepare preview data
        preview_data = []
        for _, row in df_preview.iterrows():
            preview_data.append([str(val) if pd.notna(val) else None for val in row.values])
        
        return {
            "preview_data": preview_data,
            "columns": [f"Column_{i+1}" for i in range(len(df_preview.columns))],
            "total_rows": total_rows,
            "filename": file.filename
        }
        
    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(
            status_code=500,
            content={"error": f"Error previewing file: {str(e)}"}
        )

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    has_header: bool = Form(True),
    skip_rows: int = Form(0),
    header_row: int = Form(0)
):
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Save uploaded file temporarily
        file_path = f"uploads/{session_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load data based on file type with user options
        file_ext = file.filename.split('.')[-1].lower()
        
        # Determine header parameter
        header_param = header_row if has_header else None
        
        try:
            if file_ext == 'csv':
                try:
                    df = pd.read_csv(
                        file_path, 
                        skiprows=skip_rows,
                        header=header_param
                    )
                except UnicodeDecodeError:
                    df = pd.read_csv(
                        file_path, 
                        encoding='latin1',
                        skiprows=skip_rows,
                        header=header_param
                    )
            elif file_ext in ['xls', 'xlsx']:
                df = pd.read_excel(
                    file_path,
                    skiprows=skip_rows,
                    header=header_param
                )
            elif file_ext == 'json':
                # For JSON files, skip_rows and header options are handled differently
                df = pd.read_json(file_path)
                if skip_rows > 0:
                    df = df.iloc[skip_rows:]
                if not has_header:
                    df.columns = [f'Column_{i+1}' for i in range(len(df.columns))]
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format")
        except Exception as read_error:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(read_error)}")
        
        # If no header was specified, create default column names
        if not has_header and file_ext != 'json':
            df.columns = [f'Column_{i+1}' for i in range(len(df.columns))]
        
        # Initialize analyzer
        analyzer = DataAnalyzer()
        analyzer.load_dataframe(df)
        analyzers[session_id] = analyzer
        
        # Clean up uploaded file
        os.remove(file_path)
        
        # Create a preview and replace any non-JSON compliant values (like NaN)
        preview_df = df.head(5).replace({np.nan: None})
        
        return {
            "session_id": session_id,
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "preview": preview_df.to_dict('records'),
            "datetime_columns": analyzer.datetime_cols,
            "numeric_columns": analyzer.numeric_cols,
            "processing_options": {
                "has_header": has_header,
                "skip_rows": skip_rows,
                "header_row": header_row
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(
            status_code=500,
            content={"error": f"Error processing file: {str(e)}"}
        )

@router.post("/sample")
async def load_sample_data():
    try:
        session_id = str(uuid.uuid4())
        analyzer = DataAnalyzer()
        sample_df = analyzer.generate_sample_data()
        analyzer.load_dataframe(sample_df)
        analyzers[session_id] = analyzer
        
        return {
            "session_id": session_id,
            "shape": sample_df.shape,
            "columns": sample_df.columns.tolist(),
            "data_types": sample_df.dtypes.astype(str).to_dict(),
            "preview": sample_df.head(5).to_dict('records'),
            "datetime_columns": analyzer.datetime_cols,
            "numeric_columns": analyzer.numeric_cols
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error generating sample data: {str(e)}"}
        )

def get_analyzer(session_id: str) -> DataAnalyzer:
    """Get analyzer instance by session ID"""
    if session_id not in analyzers:
        raise HTTPException(status_code=404, detail="Session not found")
    return analyzers[session_id]
