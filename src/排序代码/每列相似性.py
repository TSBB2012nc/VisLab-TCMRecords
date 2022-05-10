from csv import reader
import numpy as np

filename='降维方剂相似性矩阵完全版.csv'
with open(filename,'rt',encoding='UTF-8')as raw_data:
    readers=reader(raw_data,delimiter=',')
    x=list(readers)
    data = np.array(x)
    slicedata=data[1:len(data), 1:len(data)]
    slicedata = slicedata.astype(np.float64)
    print("slicedata", slicedata)


print("x",  x)
print("data",  data)
print("slicedata",  slicedata)

filename2='1.csv'
with open(filename2,'rt',encoding='UTF-8')as raw_data:
    readers2=reader(raw_data,delimiter=',')
    x2=list(readers2)
    # datachen = np.array(x2)
    # print("datachen", datachen)
    print("x2", x2)
    print("len(x2)", len(x2))
    x20index=[]
    x21index=[]
    print("x2[0]=", x2[0],"len(x2[0])",len(x2[0]))
    print("x2[1]=", x2[1],"len(x2[1])",len(x2[1]))
    for i in range(0, len(x2[0])):
        for j in range(0, len(x2[1])):
            if x2[0][i]==x2[1][j]:
                x20index.append(i)
                x21index.append(j)
    print(x20index,x21index)
    for i in range(0, len(x20index)):
        x2[0].remove(x2[0][x20index[i]])
    print("x2[0]=", x2[0],"len(x2[0])",len(x2[0]))
    for i in range(0, len(x21index)):
        x2[1].remove(x2[1][x21index[i]])
    print("x2[1]=", x2[1],"len(x2[1])",len(x2[1]))




times=len(x2[0])
if len(x2[1])<len(x2[0]):
    times = len(x2[1])
print("times=",times)

chenlist = []

keylist1 = []
# for i in range(1, 74):
for i in range(1, 58):
    for j in range(len(x2[0])):
        if data[0][i] == x2[0][j]:
            keylist1.append(i - 1)

print("keylist1=", keylist1)
keylist2 = []
print("keylist2=", keylist2)

for i in range(1, 58):
# for i in range(1, 74):
    for j in range(len(x2[1])):
        if data[0][i] == x2[1][j]:
            keylist2.append(i - 1)
            print(x2[1][j])

print("keylist2=", keylist2)



newarray = [[0 for _ in range(len(keylist2))] for _ in range(len(keylist1))]
for i in range(len(keylist1)):
    for j in range(len(keylist2)):
        newarray[i][j] = slicedata[keylist1[i]][keylist2[j]]
print("orinewarray=", newarray)
bacnewarray = [[0 for _ in range(len(keylist2))] for _ in range(len(keylist1))]
for i in range(len(keylist1)):
    for j in range(len(keylist2)):
        bacnewarray[i][j] = slicedata[keylist1[i]][keylist2[j]]


for a in range(times):
    for i in range(1, 58):
    # for i in range(1, 74):
        if data[0][i] == x2[0][a]:
            sin=i-1
            print("sin=",sin)


    for i in range(len(keylist1)):
        if keylist1[i]==sin:
            sortkey=i
            print("sortkey=",sortkey)

    bacnewarray[sortkey].sort()
    print("bacnewarray=", bacnewarray)

    for i in range(len(keylist2)):
        if newarray[sortkey][i] == bacnewarray[sortkey][0]:
            key = i
    print(" bacnewarray[sortkey][0]=", bacnewarray[sortkey][0])
    print("sortkey=", sortkey, "key=", key)

    for i in range(len(keylist1)):
        bacnewarray[i][key] = 10
    print("10bacnewarray=", bacnewarray)

    chenlist.append(x[0][keylist2[key] + 1])

    print("chenlist", chenlist)
