"""
定义病案可视分析需要的类

Patient类:
- 人口特征
 - name
 - birth --> age_now, age_regisitered
 - gender
 - patient_id

- 就诊记录
 - list of Visits

Visit类:
- date & time
- Patient
- prescription: list of {Herb: amount}
- num of herbs: 味数
- num of doses: 剂数

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

import json
class patient:
    class Patient:
        def __init__(self, name, age, gender, visits):
            self.name = name
            self.age = age
            self.gender = gender
            self.visits = visits

        def to_json(self):
            return json.dumps({
                'name': self.name,
                'age': self.age,
                'gender': self.gender,
                'visits': self.visits
            })

class Visit:
    def __init__(self, date, prescription):
        self.date = date
        self.prescription = prescription

    def to_json(self):
        return json.dumps({
            'date': self.date,
            'prescription': self.prescription
        })