from csv import reader
import numpy as np


filename='清热君药2.csv'
with open(filename,'rt',encoding='UTF-8')as raw_data:
    readers=reader(raw_data,delimiter=',')
    x=list(readers)
    data=np.array(x)

print("data",  data)
print("lendata",  len(data))
slicedata=data[1:len(data), 1:len(data)]
print("slicedata",  slicedata)

slicedata=slicedata.astype(np.float64)
print("slicedata",  slicedata)
orislicedata=slicedata.copy()
bacslicedata=slicedata.copy()



bacslicedata[0].sort()
a=bacslicedata[0][1]
print("bacslicedata",  bacslicedata,"a=",a)

for i in range(0,len(data)-1):
    bacslicedata[0][i]=10
    bacslicedata[i][0] =10
print("10bacslicedata", bacslicedata)

newlist=[data[0][1]]
print("newlist", newlist)

for i in range (0,len(data)-1):
     if  orislicedata[0][i]==a:
         newlist.append(data[0][i+1])
         j=i
         print("1111 i=", i, "j=",j, "a=", a,"newlist", newlist)

for k in range(0,len(data)-2):
    bacslicedata[j].sort()
    print("j=",j,"bacslicedata[j].sort()",bacslicedata)
    a= bacslicedata[j][1]
    #print("bacslicedata",  bacslicedata,"a=",a)

    for i in range(0,len(data)-1):
        bacslicedata[j][i]=10
        bacslicedata[i][j] =10
    print("a=",a,"j=",j,"10bacslicedata", bacslicedata)




    for p in range (0,len(data)-1):
         if orislicedata[j][p]==a:
             newlist.append(data[0][p+1])
             print("jjjj 列数p=", p,  "a=", a,"newlist", newlist,"k=", k)
             j=p
             break




    print("newlist", newlist);