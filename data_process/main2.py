# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.


from sklearn.datasets import load_iris
import matplotlib.pyplot as plt
import umap.umap_ as umap
from csv import reader
import numpy as np
import pandas as pd

#digits = pd.read_csv("iris3.csv")
# filename=input("请输入文件名： ")
filename='only01.csv'
with open(filename,'rt',encoding='UTF-8')as raw_data:
    readers=reader(raw_data,delimiter=',')
    x=list(readers)
    data=np.array(x)
    print(data)
    print(data.shape)
digits=data


reducer = umap.UMAP(random_state=42)
print(reducer)
embedding = reducer.fit_transform(digits)
# print(digits)
# print(digits.shape)

print(embedding)
embedding = reducer.fit_transform(digits)
print(embedding.shape)
print(embedding)
# f = open (r'D:\LearningProjects\1220-UMAPpython\result.txt','w')
#
# print (embedding,file = f)
# f.close()
np.savetxt('C:/Users/Cherry/Documents/研究生/0314中药/UMAP-only01.csv', embedding, delimiter = ',')


plt.scatter(embedding[:, 0], embedding[:, 1],  cmap='Spectral', s=5)
plt.gca().set_aspect('equal', 'datalim')

plt.title('UMAP projection of the SymMap')
plt.show()
