from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TCM Records API",
    description="API for Traditional Chinese Medicine Records Visualization",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有域名，生产环境需要配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据路径配置
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
PATIENT_DIR = DATA_DIR / "patient"
MED_DATA_PATH = DATA_DIR / "med_data" / "med_data.json"
OVERVIEW_PATH = DATA_DIR / "overview.csv"
VIS_UTILS_DIR = DATA_DIR / "vis_utils"

# 全局数据缓存
_data_cache = {}

def load_json_file(file_path: Path) -> Dict[str, Any]:
    """加载JSON文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load file: {file_path}")

def load_csv_file(file_path: Path) -> pd.DataFrame:
    """加载CSV文件"""
    try:
        return pd.read_csv(file_path, encoding='utf-8')
    except Exception as e:
        logger.error(f"Error loading CSV file {file_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load file: {file_path}")

def get_cached_data(key: str, loader_func, *args):
    """获取缓存数据或加载数据"""
    if key not in _data_cache:
        _data_cache[key] = loader_func(*args)
    return _data_cache[key]

@app.on_event("startup")
async def startup_event():
    """应用启动时预加载数据"""
    logger.info("Starting TCM Records API...")
    
    # 预加载基础数据
    try:
        get_cached_data("med_data", load_json_file, MED_DATA_PATH)
        get_cached_data("overview", load_csv_file, OVERVIEW_PATH)
        
        # 预加载vis_utils数据
        vis_utils_files = ["attr_loc.json", "book_color.json", "exp_color.json", "symp_loc.json"]
        for file_name in vis_utils_files:
            file_path = VIS_UTILS_DIR / file_name
            if file_path.exists():
                key = file_name.replace('.json', '')
                get_cached_data(key, load_json_file, file_path)
        
        logger.info("Data preloaded successfully")
    except Exception as e:
        logger.error(f"Failed to preload data: {e}")

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "TCM Records API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/patients")
async def get_patients_overview():
    """获取患者概览数据"""
    try:
        overview_df = get_cached_data("overview", load_csv_file, OVERVIEW_PATH)
        
        # 转换为字典列表，处理NaN值
        patients = []
        for _, row in overview_df.iterrows():
            patient = {}
            for col in overview_df.columns:
                value = row[col]
                # 处理NaN和空值
                if pd.isna(value) or value == '' or value == '/':
                    patient[col] = None
                else:
                    patient[col] = str(value)
            patients.append(patient)
        
        return {
            "total": len(patients),
            "patients": patients
        }
    except Exception as e:
        logger.error(f"Error getting patients overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get patients overview")

@app.get("/api/patient/{patient_id}")
async def get_patient_detail(patient_id: str):
    """获取特定患者的详细记录"""
    try:
        patient_file = PATIENT_DIR / f"{patient_id}.json"
        
        if not patient_file.exists():
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
        
        patient_data = load_json_file(patient_file)
        
        # 处理患者数据，转换为更友好的格式
        records = []
        for key, record in patient_data.items():
            if key.isdigit():  # 只处理数字键（记录ID）
                record_data = {
                    "record_id": key,
                    "date": record.get("date"),
                    "metrics": record.get("metrics", {}),
                    "scripts": record.get("scripts", {}),
                    "味数": record.get("味数"),
                    "剂数": record.get("剂数"),
                    "频次": record.get("频次"),
                    "途径": record.get("途径")
                }
                records.append(record_data)
        
        # 按日期排序
        records.sort(key=lambda x: x["date"] if x["date"] else "")
        
        return {
            "patient_id": patient_id,
            "total_records": len(records),
            "records": records
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient detail for {patient_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get patient {patient_id} detail")

@app.get("/api/patient/{patient_id}/timeline")
async def get_patient_timeline(patient_id: str):
    """获取患者时间线数据（用于可视化）"""
    try:
        patient_detail = await get_patient_detail(patient_id)
        records = patient_detail["records"]
        
        # 提取时间线数据
        timeline_data = []
        for record in records:
            metrics = record["metrics"]
            scripts = record["scripts"]
            
            # 提取药物信息
            herbs = []
            for herb_name, herb_info in scripts.items():
                herbs.append({
                    "name": herb_name,
                    "amount": herb_info.get("amount"),
                    "raw_name": herb_info.get("raw_name")
                })
            
            timeline_point = {
                "date": record["date"],
                "肌酐": metrics.get("肌酐"),
                "蛋白量mg": metrics.get("蛋白量mg"),
                "蛋白定性": metrics.get("蛋白定性"),
                "血尿定性": metrics.get("血尿定性"),
                "herbs": herbs,
                "味数": record["味数"],
                "剂数": record["剂数"]
            }
            timeline_data.append(timeline_point)
        
        return {
            "patient_id": patient_id,
            "timeline": timeline_data
        }
    except Exception as e:
        logger.error(f"Error getting patient timeline for {patient_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get patient {patient_id} timeline")

@app.get("/api/medicines")
async def get_medicines_info():
    """获取药物信息"""
    try:
        med_data = get_cached_data("med_data", load_json_file, MED_DATA_PATH)
        
        # 转换为列表格式，便于前端处理
        medicines = []
        for name, info in med_data.items():
            medicine = {
                "name": name,
                "性味归经": info.get("性味归经"),
                "功效": info.get("功效"),
                "主治": info.get("主治"),
                "教材分类": info.get("教材分类"),
                "名医对于药物的用法": info.get("名医对于药物的用法"),
                "专家分类": info.get("专家分类")
            }
            medicines.append(medicine)
        
        return {
            "total": len(medicines),
            "medicines": medicines
        }
    except Exception as e:
        logger.error(f"Error getting medicines info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get medicines info")

@app.get("/api/medicine/{medicine_name}")
async def get_medicine_detail(medicine_name: str):
    """获取特定药物的详细信息"""
    try:
        med_data = get_cached_data("med_data", load_json_file, MED_DATA_PATH)
        
        if medicine_name not in med_data:
            raise HTTPException(status_code=404, detail=f"Medicine {medicine_name} not found")
        
        medicine_info = med_data[medicine_name]
        
        return {
            "name": medicine_name,
            "info": medicine_info
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting medicine detail for {medicine_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get medicine {medicine_name} detail")

@app.get("/api/vis/attr-locations")
async def get_attr_locations():
    """获取属性位置数据（用于可视化布局）"""
    try:
        attr_loc = get_cached_data("attr_loc", load_json_file, VIS_UTILS_DIR / "attr_loc.json")
        return {
            "data": attr_loc
        }
    except Exception as e:
        logger.error(f"Error getting attr locations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get attr locations")

@app.get("/api/vis/colors")
async def get_vis_colors():
    """获取可视化颜色配置"""
    try:
        colors = {}
        
        # 加载颜色配置文件
        color_files = ["book_color.json", "exp_color.json", "symp_loc.json"]
        for file_name in color_files:
            file_path = VIS_UTILS_DIR / file_name
            if file_path.exists():
                key = file_name.replace('.json', '').replace('_', '-')
                colors[key] = get_cached_data(file_name.replace('.json', ''), load_json_file, file_path)
        
        return colors
    except Exception as e:
        logger.error(f"Error getting vis colors: {e}")
        raise HTTPException(status_code=500, detail="Failed to get vis colors")

@app.get("/api/statistics/overview")
async def get_statistics_overview():
    """获取统计概览数据"""
    try:
        overview_df = get_cached_data("overview", load_csv_file, OVERVIEW_PATH)
        
        # 基本统计
        total_patients = len(overview_df)
        
        # 性别分布
        gender_counts = overview_df['性别'].value_counts().to_dict()
        
        # 病理分布
        pathology_counts = overview_df['病理'].dropna().value_counts().head(10).to_dict()
        
        # 亚组分布
        subgroup_counts = overview_df['亚组'].dropna().value_counts().to_dict()
        
        # Oxford分型分布
        oxford_counts = overview_df['Oxford分型'].dropna().value_counts().head(10).to_dict()
        
        return {
            "total_patients": total_patients,
            "gender_distribution": gender_counts,
            "pathology_distribution": pathology_counts,
            "subgroup_distribution": subgroup_counts,
            "oxford_distribution": oxford_counts
        }
    except Exception as e:
        logger.error(f"Error getting statistics overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics overview")

@app.get("/api/statistics/medicines")
async def get_medicine_statistics():
    """获取药物使用统计"""
    try:
        # 遍历所有患者文件，统计药物使用频率
        medicine_usage = {}
        medicine_categories = {}
        
        # 获取药物分类信息
        med_data = get_cached_data("med_data", load_json_file, MED_DATA_PATH)
        
        # 统计所有患者的药物使用
        for patient_file in PATIENT_DIR.glob("*.json"):
            try:
                patient_data = load_json_file(patient_file)
                
                for record_key, record in patient_data.items():
                    if record_key.isdigit() and "scripts" in record:
                        scripts = record["scripts"]
                        for medicine_name, medicine_info in scripts.items():
                            # 统计使用次数
                            if medicine_name in medicine_usage:
                                medicine_usage[medicine_name] += 1
                            else:
                                medicine_usage[medicine_name] = 1
                            
                            # 记录分类信息
                            if medicine_name in med_data:
                                category = med_data[medicine_name].get("专家分类")
                                if category and medicine_name not in medicine_categories:
                                    medicine_categories[medicine_name] = category
            except Exception as e:
                logger.warning(f"Error processing patient file {patient_file}: {e}")
                continue
        
        # 排序并获取最常用的药物
        most_used = dict(sorted(medicine_usage.items(), key=lambda x: x[1], reverse=True)[:20])
        
        # 按分类统计
        category_stats = {}
        for medicine, category in medicine_categories.items():
            if category:
                if category in category_stats:
                    category_stats[category] += medicine_usage.get(medicine, 0)
                else:
                    category_stats[category] = medicine_usage.get(medicine, 0)
        
        return {
            "total_medicines": len(medicine_usage),
            "most_used_medicines": most_used,
            "category_statistics": dict(sorted(category_stats.items(), key=lambda x: x[1], reverse=True)),
            "medicine_categories": medicine_categories
        }
    except Exception as e:
        logger.error(f"Error getting medicine statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get medicine statistics")

@app.get("/api/search/patients")
async def search_patients(
    q: Optional[str] = Query(None, description="搜索关键词"),
    gender: Optional[str] = Query(None, description="性别筛选"),
    subgroup: Optional[str] = Query(None, description="亚组筛选")
):
    """搜索患者"""
    try:
        overview_df = get_cached_data("overview", load_csv_file, OVERVIEW_PATH)
        
        # 应用筛选条件
        filtered_df = overview_df
        
        if gender:
            filtered_df = filtered_df[filtered_df['性别'] == gender]
        
        if subgroup:
            filtered_df = filtered_df[filtered_df['亚组'] == subgroup]
        
        if q:
            # 在PID、病理字段中搜索
            mask = (
                filtered_df['PID'].astype(str).str.contains(q, case=False, na=False) |
                filtered_df['病理'].astype(str).str.contains(q, case=False, na=False)
            )
            filtered_df = filtered_df[mask]
        
        # 转换结果
        results = []
        for _, row in filtered_df.iterrows():
            patient = {}
            for col in filtered_df.columns:
                value = row[col]
                if pd.isna(value) or value == '' or value == '/':
                    patient[col] = None
                else:
                    patient[col] = str(value)
            results.append(patient)
        
        return {
            "total": len(results),
            "patients": results
        }
    except Exception as e:
        logger.error(f"Error searching patients: {e}")
        raise HTTPException(status_code=500, detail="Failed to search patients")

@app.get("/api/search/medicines")
async def search_medicines(
    q: Optional[str] = Query(None, description="搜索关键词"),
    category: Optional[str] = Query(None, description="分类筛选")
):
    """搜索药物"""
    try:
        med_data = get_cached_data("med_data", load_json_file, MED_DATA_PATH)
        
        results = []
        for name, info in med_data.items():
            # 分类筛选
            if category and info.get("专家分类") != category:
                continue
            
            # 关键词搜索
            if q:
                search_text = f"{name} {info.get('功效', '')} {info.get('主治', '')} {info.get('专家分类', '')}"
                if q.lower() not in search_text.lower():
                    continue
            
            medicine = {
                "name": name,
                "性味归经": info.get("性味归经"),
                "功效": info.get("功效"),
                "主治": info.get("主治"),
                "教材分类": info.get("教材分类"),
                "名医对于药物的用法": info.get("名医对于药物的用法"),
                "专家分类": info.get("专家分类")
            }
            results.append(medicine)
        
        return {
            "total": len(results),
            "medicines": results
        }
    except Exception as e:
        logger.error(f"Error searching medicines: {e}")
        raise HTTPException(status_code=500, detail="Failed to search medicines")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
