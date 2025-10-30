
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from collections import deque
import random


class Node:
    
    def __init__(self,data):
        self.data=data
        self.left=None
        self.right=None

#this for 2d points
def gen_ann_tree(df,feats,k):
    if(len(df)<=k):
        # df['color']
        root=Node(df)
        root.data=df
        return root
    two=df.sample(2,replace=True)
    # print('two --------\n',two)
    root=Node(two)
    m=(two.iloc[0][feats]+two.iloc[1][feats])/2
    # print('center --------\n',m)
    v=two.iloc[1][feats]-two.iloc[0][feats]
    # print('hyperplane --------\n',v)
    lt=df[np.dot(df.loc[:,feats]-m,v)>0]
    rt=df[~(np.dot(df.loc[:,feats]-m,v)>0)]
    root.left=gen_ann_tree(lt,feats,k)
    root.right=gen_ann_tree(rt,feats,k)
    return root

def kids(node):
    return [node.left,node.right]

def find_leaves(root):
    leaves=[]
    q=deque([root])
    ct=l=0        # ct : count of nodes explored other than root in BFS
    while(len(q)>0):
        node=q.popleft()
        l+=1
            # print("node\n",node)
            # print("--------------")
        for c in kids(node):
            # print(c)
            ct+=1
                # print(ct)
            if(not c):
                 leaves.append(node)
            if c:
                q.append(c)
    return leaves

def plot_leaves(leaves,feats):
    fig,ax=plt.subplots()
    for i in leaves:
        color='#%06X' % random.randint(0, 0xFFFFFF)
        ax.scatter(i.data[feats[0]],i.data[feats[1]],s=10,color=color)
    ax.axis('off')
    # plt.savefig('annoyance.png')
    plt.show()
    return