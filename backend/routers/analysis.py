from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
from .upload import get_analyzer

router = APIRouter()

class AnalysisRequest(BaseModel):
    session_id: str

class DistributionRequest(BaseModel):
    session_id: str
    column: str

class TimeSeriesRequest(BaseModel):
    session_id: str
    time_column: str
    value_columns: List[str]

class MissingValuesRequest(BaseModel):
    session_id: str
    method: str

class TrendAnalysisRequest(BaseModel):
    session_id: str
    time_column: str
    value_column: str
    window_size: int = 7

class SeasonalDecompositionRequest(BaseModel):
    session_id: str
    time_column: str
    value_column: str
    period: int = 30

class PeriodicAnalysisRequest(BaseModel):
    session_id: str
    time_column: str
    value_column: str
    period_type: str = "daily"

@router.post("/basic-stats")
async def basic_stats(request: AnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_basic_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/distribution")
async def distribution_analysis(request: DistributionRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_distribution_analysis(request.column)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/missing-values")
async def missing_values_analysis(request: AnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_missing_values_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/handle-missing")
async def handle_missing_values(request: MissingValuesRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.handle_missing_values(request.method)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/time-series")
async def time_series_analysis(request: TimeSeriesRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_time_series_data(request.time_column, request.value_columns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/correlation")
async def correlation_analysis(request: AnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_correlation_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trend-analysis")
async def trend_analysis(request: TrendAnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_trend_analysis(
            request.time_column,
            request.value_column,
            request.window_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seasonal-decomposition")
async def seasonal_decomposition(request: SeasonalDecompositionRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_seasonal_decomposition(
            request.time_column,
            request.value_column,
            request.period
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/periodic-analysis")
async def periodic_analysis(request: PeriodicAnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.get_periodic_analysis(
            request.time_column,
            request.value_column,
            request.period_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/time-period-comparison")
async def time_period_comparison(request: TimeSeriesRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.compare_time_periods(
            request.time_column,
            request.value_columns[0]  # Take first column
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comprehensive-report")
async def comprehensive_report(request: AnalysisRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        return analyzer.generate_comprehensive_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
