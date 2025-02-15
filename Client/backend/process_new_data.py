"""
handle file upload and raw data view
"""
import json
def process_new_data(path):
    """
    TODO: handle new data
    """
    new_json = {
    "patients": 0,
    "herbs": 707,
    "new": False
}
    with open(f'{path}/sys_info.json', 'w', encoding='utf-8') as f:
        # rewrite with new json
        json.dump(new_json, f, ensure_ascii=False, indent=4)
    return "NEW"