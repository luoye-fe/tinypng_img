#!/usr/bin/env node

var fs = require('fs');
var crypto = require('crypto');

var content = fs.readFileSync('1.jpg');
var md5 = crypto.createHash('md5');
md5.update(content);
var d = md5.digest('hex');





// console.log(d);

var Tinypng = require('./app.js');
//调用
var tingpng = new Tinypng()
    .src('./temp')
    // .dest('./')
    .key('p11cJU7hHBuolnydFrt_Gp-o_ch9GrEg')
    .run()
