图片压缩
tinypng

注：为了检测是否被压缩过，修改了图片的文件尾为0作标记，使用的时候png修改回130。（其他图片格式的文件尾自测）

20150831  
统计压缩空间

20150827  
添加检测图片是否被压缩过功能


安装方法

	npm install tinypng_img -g



使用方法

使用前请到 <a href='https://tinypng.com/developers'>https://tinypng.com/developers</a> 申请API KEY

	//使用方法
	var Tinypng = require('tinypng_img');
	var tinypng = new Tinypng()
	    .src("./")   //图片目录或单个图片路径
	    .dest("./temp")  //必须是目录，如果不设定，则会覆盖压缩
	    .key("API KEY")  
	    .run()
