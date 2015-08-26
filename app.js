var fs = require("fs");
var path = require("path");
var request = require('request');
var colors = require('colors');
//加密模块
var crypto = require('crypto');
//转码模块
var iconv = require('iconv-lite');


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
    var data = [];
    // data[src] = md5(src);
    // data[src+'/'+img] = md5(src+'/'+img);
    
    if(fs.existsSync(src)){
        if (!fs.existsSync(src+'/info')) {
            // fs.writeFileSync(src+'/info','','utf-8');
            imgList = getImg(src);
        }else{

        };
    }

    var index = 0;
    imgList.forEach(function(file){
        var _current = []
        _current[0] = file;
        _current[1] = md5(file);
        data.push(_current);
        index++;
    })
    fs.writeFileSync(src+'/info',data);
    console.log(data);



    
    // if(imgList.length == 0){
    //     console.log("未发现图片");
    // }else{
    //     var len = imgList.length.toString();
    //     console.log("\n未压缩图片共 "+len.bold.white+" 张，正在压缩···");
    //     console.log(equiLong('\n   图片名',28)+equiLong('压缩前',15)+equiLong('压缩后',15)+equiLong('压缩率',8));
    //     imgList.forEach(function(file){

    //         fs.createReadStream(file).pipe(request.post('https://api.tinify.com/shrink',{
    //             auth:{
    //                 'user':'api',
    //                 'pass':key
    //             }
    //         },function(err,response,body){
    //             var body = JSON.parse(body);
    //             if(response.statusCode == 201){
    //                 //打印压缩信息：图片名  压缩前大小  压缩后大小  压缩率
    //                 console.log(equiLong('   '+path.basename(file),30).bold.white+equiLong((body.input.size/1024).toFixed(2)+'KB',18).bold.cyan+equiLong((body.output.size/1024).toFixed(2)+'KB',18).bold.green+equiLong((1-(body.output.size/body.input.size)).toFixed(2)+'%',8).bold.green);
    //                    写入md5信息
                       
    //                    data.
    //                 //写入文件
    //                 request.get(body.output.url).pipe(fs.createWriteStream(dest+'/'+path.basename(file)));
    //             }else{
    //                 if (body.error === 'TooManyRequests') {
    //                     console.log('   此KEY压缩图片数量已达限制');
    //                 } else if (body.error === 'Unauthorized') {
    //                     console.log('   此KEY不可用');
    //                 } else {
    //                     console.log(equiLong('   '+path.basename(file),30).bold.white+'压缩出现问题'.bold.red);
    //                 }
    //             };
    //         }));
    //     })
    // }

};


//获取文件夹内所有图片路径数组
function getImg(src){
    var imgList = [];
    if(fs.statSync(src).isFile() && checkImg(src)){
        imgList.push(src);
    }else if(fs.statSync(src).isDirectory()){
        var _current = fs.readdirSync(src);
        _current.forEach(function(img){
            if(checkImg(img)){
                imgList.push(src+'/'+img);
            }
        })
    }
    return imgList;
}


//校验MD5，不一致的返回数组
//不一致的话就是没压缩过的
function checkMd5(file,md5){

}

//判断是否是图片
function checkImg(file){
    var imgType = ['.png','.jpg','.jpeg']; 
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

//返回md5戳
function md5(file){
    var content = fs.readFileSync(file);
    var md5 = crypto.createHash('md5');
    md5.update(content);
    var result = md5.digest('hex');
    return result;
}



module.exports = Tinypng;




//调用
// var tingpng = new Tinypng()
//     .src('./')
//     .dest('./')
//     .key('api key')
//     .run()