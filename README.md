# picgo-plugin-qingyun-uploader

> [PicGo](https://github.com/Molunerfinn/PicGo)的一个[青云对象存储](https://www.qingcloud.com/products/objectstorage/)上传插件

## 插件安装

GUI 直接搜索 qingyun 下载即可

![](https://my-vitepress-blog.sh1a.qingstor.com/202311120146273.png)

## 插件配置

| 参数名称        | 类型     | 描述                                       | 是否必须 |
| --------------- | -------- | ------------------------------------------ | -------- |
| AccessKeyId     | input    | 从右上角我的信息-API 密钥-创建获取         | true     |
| AccessKeySecret | password | 从右上角我的信息-API 密钥-创建获取         | true     |
| 桶名称          | input    | 从控制台对象存储列表中获取                 | true     |
| EndPoint        | input    | 存储桶的区域信息让填写看下图，不需要点     | true     |
| 存储路径        | input    | 存储桶里面的文件夹路径，默认根目录         |
| false           |
| 网址后缀        | input    | 图片处理表达式，用户自定义                 | false    |
| 自定义域名      | input    | 使用自定义域名替代存储桶的域名，用户自定义 | false    |

![](https://my-vitepress-blog.sh1a.qingstor.com/202311120149413.png)

![](https://my-vitepress-blog.sh1a.qingstor.com/202311120151789.png)
