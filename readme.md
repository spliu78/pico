# pico文件整理工具

根据日期，自动归档选定文件夹的文件，并跳过重复的文件

## cli工具

下载
`git clone https://github.com/spliu78/pico.git`

安装
`cd pico && npm install && npm build`

运行
`pico --help`

## 缘起

某天发现自己电脑里的各种资料太乱且到处是备份乱糟糟。。。闲下来的时候就先整理一下自己吧

## Feature

- 多线程进行Hash操作
- 命令执行完毕后，在目标目录中生成操作详录：
  - `.pico/FileMove_${datetime}.data`
    记录文件目录至目录的操作  
    格式：`fileName \t status \t newFileName \t fromPath \t toPath`  
    status: hashRepeat | created | conflict  
    newFileName: null | name(when rename)  
    toPath: null | filePath(when copy)  
  - `.pico/File-Hash.data.${datetime}`
    记录单次操作from文件夹中文件的hash值，以及重复数  
    格式：`path \t repeatCount \t hash`
- 支持多次执行pico，往已有pico文件夹下添加数据  

## TODO

[-] 终极目标：实现桌面UI，实现album功能
