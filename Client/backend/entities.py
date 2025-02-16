"""
定义病案可视分析需要的类
"""

import csv
import json
import os
from datetime import datetime


class Herb:
    """
        Herb类:
    - name
     - Chinese Name: required
     - English Name(pinyin)
    - attributes
     - 四气五味
     - 归经
     - 功效
     - 主治
     - 教材分类
     - 专家分类
     - 备注
    - counted attr for vis
     - umap_loc: (dim1, dim2)
     - color
      - 教材分类的color
      - 专家分类的color
    """

    def __init__(
        self,
        chinese_name,
        english_name=None,
        four_natures_and_five_flavors=None,
        meridian_tropism=None,
        efficacy=None,
        indications=None,
        textbook_classification=None,
        expert_classification=None,
        remarks=None,
    ):
        self.chinese_name = chinese_name
        self.english_name = english_name
        self.attributes = {
            "四气五味": four_natures_and_five_flavors,
            "归经": meridian_tropism,
            "功效": efficacy,
            "主治": indications,
            "教材分类": textbook_classification,
            "专家分类": expert_classification,
            "备注": remarks,
        }
        self.counted_attr = {
            "umap_loc": (0, 0),
            "color": {"教材分类": None, "专家分类": None},
        }

    def to_dict(self):
        return {
            "chinese_name": self.chinese_name,
            "english_name": self.english_name,
            "attributes": self.attributes,
            "counted_attr": self.counted_attr,
        }


class Visit:
    """
        Visit类:
    - date & time
    - Patient
    - prescription: list of {Herb: amount}
    - num of herbs: 味数
    - num of doses: 剂数

    """

    def __init__(self, date_time, patient, prescription, num_of_doses):
        self.date_time = date_time
        self.patient = patient
        self.prescription = prescription
        self.num_of_herbs = len(prescription)
        self.num_of_doses = num_of_doses

    def to_dict(self):
        prescription_dict = {
            herb.chinese_name: amount for herb, amount in self.prescription.items()
        }
        return {
            "date_time": self.date_time.strftime("%Y-%m-%d %H:%M:%S"),
            "patient_id": self.patient.patient_id,
            "prescription": prescription_dict,
            "num_of_herbs": self.num_of_herbs,
            "num_of_doses": self.num_of_doses,
        }


class Patient:
    """
    Patient类:
    - 人口特征
     - name
     - birth --> age_now, age_regisitered
     - gender
     - patient_id

    - 就诊记录
     - list of Visits

    """

    def __init__(self, name, birth, gender, patient_id):
        self.name = name
        self.birth = birth
        self.gender = gender
        self.patient_id = patient_id
        self.visits = []

    @property
    def age_now(self):
        now = datetime.now()
        return (
            now.year
            - self.birth.year
            - ((now.month, now.day) < (self.birth.month, self.birth.day))
        )

    @property
    def age_registered(self):
        # 假设注册时间为第一次就诊时间，如果没有就诊记录则返回当前年龄
        if self.visits:
            first_visit_date = self.visits[0].date_time
            return (
                first_visit_date.year
                - self.birth.year
                - (
                    (first_visit_date.month, first_visit_date.day)
                    < (self.birth.month, self.birth.day)
                )
            )
        return self.age_now

    def add_visit(self, visit):
        self.visits.append(visit)

    def to_dict(self):
        return {
            "name": self.name,
            "birth": self.birth.strftime("%Y-%m-%d"),
            "gender": self.gender,
            "patient_id": self.patient_id,
            "age_now": self.age_now,
            "age_registered": self.age_registered,
            "visits": [visit.to_dict() for visit in self.visits],
        }


class MedicalRecordAnalyzer:
    def __init__(self, csv_file_path, json_file_path):
        self.csv_file_path = csv_file_path
        self.json_file_path = json_file_path
        self.patients = {}
        self.herbs = {}
        self.load_data()

    def load_data(self):
        if os.path.exists(self.json_file_path):
            with open(self.json_file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._load_from_json(data)
        else:
            self._load_from_csv()
            self.save_to_json()

    def _load_from_csv(self):
        # 这里需要根据实际的 CSV 文件格式进行解析
        # 以下是一个简单的示例，假设 CSV 文件格式为：
        # patient_id, name, birth, gender, visit_date, herb_chinese_name, herb_amount
        with open(self.csv_file_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader)  # 跳过标题行
            for row in reader:
                (
                    patient_id,
                    name,
                    birth_str,
                    gender,
                    visit_date_str,
                    herb_chinese_name,
                    herb_amount,
                ) = row
                birth = datetime.strptime(birth_str, "%Y-%m-%d")
                visit_date = datetime.strptime(visit_date_str, "%Y-%m-%d %H:%M:%S")

                if patient_id not in self.patients:
                    patient = Patient(name, birth, gender, patient_id)
                    self.patients[patient_id] = patient
                else:
                    patient = self.patients[patient_id]

                if herb_chinese_name not in self.herbs:
                    herb = Herb(herb_chinese_name)
                    self.herbs[herb_chinese_name] = herb
                else:
                    herb = self.herbs[herb_chinese_name]

                prescription = {herb: int(herb_amount)}
                visit = Visit(visit_date, patient, prescription)
                patient.add_visit(visit)

    def _load_from_json(self, data):
        for patient_data in data["patients"]:
            name = patient_data["name"]
            birth = datetime.strptime(patient_data["birth"], "%Y-%m-%d")
            gender = patient_data["gender"]
            patient_id = patient_data["patient_id"]
            patient = Patient(name, birth, gender, patient_id)

            for visit_data in patient_data["visits"]:
                visit_date = datetime.strptime(
                    visit_data["date_time"], "%Y-%m-%d %H:%M:%S"
                )
                prescription = {}
                for herb_name, amount in visit_data["prescription"].items():
                    if herb_name not in self.herbs:
                        herb = Herb(herb_name)
                        self.herbs[herb_name] = herb
                    else:
                        herb = self.herbs[herb_name]
                    prescription[herb] = amount
                visit = Visit(visit_date, patient, prescription)
                patient.add_visit(visit)

            self.patients[patient_id] = patient

    def save_to_json(self):
        data = {
            "patients": [patient.to_dict() for patient in self.patients.values()],
            "herbs": {
                herb.chinese_name: herb.to_dict() for herb in self.herbs.values()
            },
        }
        with open(self.json_file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

    def get_patients(self):
        return list(self.patients.values())

    def get_herbs(self):
        return list(self.herbs.values())


# 使用示例
if __name__ == "__main__":
    csv_file_path = "medical_records.csv"
    json_file_path = "medical_records.json"
    analyzer = MedicalRecordAnalyzer(csv_file_path, json_file_path)

    patients = analyzer.get_patients()
    herbs = analyzer.get_herbs()

    print("Patients:", patients)
    print("Herbs:", herbs)
