var fs = require("fs");
var path = require("path");
var request = require('request');
var colors = require('colors');

function Tinypng() {
    if (!(this instanceof Tinypng)) {
        return new Tinypng();
    }

    this.streams = [];
}

Tinypng.prototype.src = function(file) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = file;
    return this;
};

Tinypng.prototype.dest = function (dir) {
    if (!arguments.length) {
        return this._dest;
    }

    this._dest = dir;
    return this;
};

Tinypng.prototype.key = function (apiKey) {
    if (!arguments.length) {
        return this._key;
    }

    this._key = apiKey;
    return this;
};

Tinypng.prototype.run = function () {

    //获取存放所有图片路径的数组
    var src = this.src();
    if(this.dest() == undefined){
        var dest = src;
    }else{
        var dest = this.dest();
    };

    //KEY
    var key = this.key();

    if(!fs.existsSync(dest)){
        if(fs.statSync(src).isDirectory()){
            fs.mkdirSync(dest);
        }
    }

    var imgList = [];

    
    if(fs.existsSync(src)){
        imgList = getImg(src);
    }


    if(imgList.length == 0){
        console.log("\n   未发现可压缩图片\n");
    }else{
        var len = imgList.length.toString();
        console.log("\n发现未压缩图片共 "+len.bold.white+" 张，正在压缩···");
        console.log(equiLong('\n   图片名',28)+equiLong('压缩前',15)+equiLong('压缩后',15)+equiLong('压缩率',8));
        imgList.forEach(function(file){
            var input = fs.createReadStream(file)
            input.pipe(request.post('https://api.tinify.com/shrink',{
                auth:{
                    'user':'api',
                    'pass':key
                }
            },function(err,response,body){
                var body = JSON.parse(body);
                if(response.statusCode == 201){
                    //打印压缩信息：图片名  压缩前大小  压缩后大小  压缩率
                    console.log(equiLong('   '+path.basename(file),30).bold.white+equiLong((body.input.size/1024).toFixed(2)+'KB',18).bold.cyan+equiLong((body.output.size/1024).toFixed(2)+'KB',18).bold.green+equiLong((1-(body.output.size/body.input.size)).toFixed(2)+'%',8).bold.green);
                    //写入文件
                    var output = fs.createWriteStream(dest+'/'+path.basename(file));

                    request.get(body.output.url).pipe(output);

                    output.on('finish',function(){
                        //修改文件尾buffer，作为已压缩图片的特征码
                        var buf = fs.readFileSync(dest+'/'+path.basename(file));
                        var len = buf.length;
                        buf[len-1] = '0';
                        fs.writeFileSync(dest+'/'+path.basename(file),buf);
                    })
                    
                }else{
                    if (body.error === 'TooManyRequests') {
                        console.log('   此KEY压缩图片数量已达限制');
                    } else if (body.error === 'Unauthorized') {
                        console.log('   此KEY不可用');
                    } else {
                        console.log(equiLong('   '+path.basename(file),30).bold.white+'压缩出现问题'.bold.red);
                    }
                };
            }));
        })
    }

};


//获取文件夹内所有图片路径数组
function getImg(src){
    var imgList = [];
    if(fs.statSync(src).isFile() && checkImg(src)){
        var buf = fs.readFileSync(src);
        if(buf[buf.length-1] != '0'){
            imgList.push(src);             
        }
    }else if(fs.statSync(src).isDirectory()){
        var _current = fs.readdirSync(src);
        _current.forEach(function(img){
            if(checkImg(img)){
                var buf = fs.readFileSync(src+'/'+img);
                if(buf[buf.length-1] != '0'){
                    imgList.push(src+'/'+img);
                }
            }
        })
    }
    return imgList;
}



//判断是否是图片
function checkImg(file){
    var imgType = ['.png','jpg']; 
    var extName = path.extname(file);
    for(var i = 0;i<imgType.length;i++){
        if(imgType[i] == extName){
            return true;
        }
    }
}

//返回字符串，截断或用空格填充（为了打印压缩信息时对齐）
function equiLong(str,len){
    var length = str.length;
    if(length>len){
        return str.substr(0,length);
    }else{
        var _str = str;
        for(var j = 0;j<(len-length);j++){
            _str += ' ';
        };
        return _str;
    }
}

//获取info数组
function getInfo(src){
    var result = [];
    var _info = fs.readFileSync(src+'/info','utf-8').split('\n');
    for(var i = 0;i<_info.length;i++){
        __info = _info[i].split(',');
        result.push(__info);
    }
    return result;
}

module.exports = Tinypng;




//调用
// var tingpng = new Tinypng()
//     .src('./')
//     .dest('./')
//     .key('api key')
//     .run()