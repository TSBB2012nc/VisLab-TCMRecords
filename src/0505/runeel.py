import eel
import numpy as np
from ciecam02 import rgb2jch, jch2rgb
from scipy.interpolate import Rbf

# Set web files folder and optionally specify which file types to check for eel.expose()
#   *Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])


@eel.expose 
def rgb2rgb(x,y,xi,yi,wuindex):
    rgb = np.array([[81, 118, 147],
                [143, 75, 40],
                [128, 0, 32],
                [0, 140, 149],
                [0, 49, 83]
                ])
    jch=rgb2jch(rgb)
    jjj=jch[:,0]
    ccc=jch[:,1]
    hhh=jch[:,2]
    rbfj = Rbf(x, y, jjj, function='linear')
    rbfc = Rbf(x, y, ccc, function='linear')
    rbfh = Rbf(x, y, hhh, function='linear')
    jjji = rbfj(xi, yi)  
    ccci = rbfc(xi, yi)
    hhhi = rbfh(xi, yi)
    for i in range(len(jjji)):
        if jjji[i]<=0:
            jjji[i]=0.01
        elif jjji[i]>=100:
            jjji[i]=99.99
    for i in range(len(hhhi)):
        if hhhi[i]<=0:
            hhhi[i]=0.01
        elif hhhi[i]>=360:
            hhhi[i]=359.99
    for i in range(len(ccci)):
        if ccci[i]<=0:
            ccci[i]=0.01
    bac1=np.array([jjji,ccci,hhhi])
    # print(bac1)
    newjch=bac1.transpose()
    newjch=newjch.astype(np.float32)
    print(newjch)
    newrgb=jch2rgb(newjch)
    print(newrgb)
   
    # np.savetxt('C:/Users/wuzhi/Desktop/LearningProjects0427/LearningProjects/0430-eel/web/rgb0430.csv', newrgb, delimiter = ',')

    newrgb=newrgb.tolist()
    for i in range(53):
        for j in range(3):
            newrgb[i][j]=str(newrgb[i][j])
    print(newrgb)
    all0 = [[0 for j in range(3)] for i in range(58)]
    # wuindex=[0, 7, 11, 18, 40]
    wuxing=[['81', '118', '147'],
    ['128', '0', '32'], 
    ['143', '75', '40'],
    ['0', '140', '149'],
    ['0', '49', '83']
    ]
    if wuindex[0]==0:
        all0[0]=wuxing[0]
        all0[wuindex[1]]=wuxing[1]
        all0[wuindex[2]]=wuxing[2]
        all0[wuindex[3]]=wuxing[3]
        all0[wuindex[4]]=wuxing[4]
        all0[1:(wuindex[1])]=newrgb[0:(wuindex[1]-1)]
        all0[(wuindex[1]+1):(wuindex[2])]=newrgb[(wuindex[1]-1):(wuindex[2]-2)]
        all0[(wuindex[2]+1):(wuindex[3])]=newrgb[(wuindex[2]-2):(wuindex[3]-3)]
        all0[(wuindex[3]+1):(wuindex[4])]=newrgb[(wuindex[3]-3):(wuindex[4]-4)]
        all0[(wuindex[4]+1):]=newrgb[(wuindex[4]-4):]
        print(all0)

    if wuindex[0]!=0:
        all0[wuindex[0]]=wuxing[0]
        all0[wuindex[1]]=wuxing[1]
        all0[wuindex[2]]=wuxing[2]
        all0[wuindex[3]]=wuxing[3]
        all0[wuindex[4]]=wuxing[4]
        all0[0:(wuindex[0])]=newrgb[0:(wuindex[0])]
        all0[(wuindex[0]+1):(wuindex[1])] = newrgb[(wuindex[0]):(wuindex[1]-1)]
        all0[(wuindex[1] + 1):(wuindex[2])] = newrgb[(wuindex[1]-1):(wuindex[2] - 2)]
        all0[(wuindex[2] + 1):(wuindex[3])] = newrgb[(wuindex[2]-2):(wuindex[3] - 3)]
        all0[(wuindex[3] + 1):(wuindex[4])] = newrgb[(wuindex[3]-3):(wuindex[4] - 4)]
        all0[(wuindex[4] + 1):] = newrgb[(wuindex[4] - 4):]
        print(all0)


    allrgb0=[]
    for i in range(58):
        allrgb0.append(0)
    print(allrgb0)

    for k in range(58):
        allrgb0[k]="rgb("+all0[k][0]+","+all0[k][1]+","+all0[k][2]+")"
    # allrgb0[:,0]=all0[:,0]+all0[:,1]+all0[:,2]
    print(allrgb0)

    import pandas as pd

    data = pd.read_csv(r"web/fangjidata0425.csv",encoding='utf-8')
    print(data.columns)  # 获取列索引值
    data1=allrgb0 # 将新列的名字设置为cha
    data['rgb']=data1
    data.to_csv(r"web/fangjidata0504.csv", index=False,encoding='utf-8')
    # mode=a，以追加模式写入,header表示列名，默认为true,index表示行名，默认为true，再次写入不需要行名
    print(data)







eel.start('hello.html',mode="edge")             # Start (this blocks and enters loop)