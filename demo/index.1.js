/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created on 2017-07-31
 */

const SMSClient = require('./../index')
const express = require('express');
const mongodb = require('mongodb').MongoClient;
const db_str = "mongodb://localhost:27017/zhengzhou1802"
var bodyParser = require('body-parser');
const app = express();

//插入跨域
app.all('*',function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Header","X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTTONS");
	next();
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAIFGcJkapOK0X1'
const secretAccessKey = 'IluZiusHDB8itjCVHMy2OHoeGr1WPd'

//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
const queueName = 'Alicom-Queue-1092397003988387-'

//初始化sms_client
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

//短信回执报告
smsClient.receiveMsg(0, queueName).then(function (res) {
    //消息体需要base64解码
    let {code, body}=res
    if (code === 200) {
        //处理消息体,messagebody
//      console.log(body)
    }
}, function (err) {
//  console.log(err)
})

//短信上行报告
smsClient.receiveMsg(1, queueName).then(function (res) {
    //消息体需要base64解码
    let {code, body}=res
    if (code === 200) {
        //处理消息体,messagebody
//      console.log(body)
    }
}, function (err) {
//  console.log(err)
})


//查询短信发送详情
smsClient.queryDetail({
    PhoneNumber: '15000000000',
    SendDate: '20170731',
    PageSize: '10',
    CurrentPage: "1"
}).then(function (res) {
    let {Code, SmsSendDetailDTOs}=res
    if (Code === 'OK') {
        //处理发送详情内容
//      console.log(SmsSendDetailDTOs)
    }
}, function (err) {
    //处理错误
//  console.log(err)
})


function send(phonenum,yzm){
	//发送短信
	smsClient.sendSMS({
	    PhoneNumbers: phonenum,
	    SignName: '听风雨',
	    TemplateCode: 'SMS_137925001',
	    TemplateParam: `{"code":${yzm}}`
	}).then(function (res) {
	    let {Code}=res
	    if (Code === 'OK') {
	        //处理返回参数
	//      console.log(res)
	    }
	}, function (err) {
	//  console.log(err)
	})
}



//随机验证码
var yzmcode;
function suiji(){
	yzmcode = Math.floor(Math.random()*10000)
	return yzmcode;
}



app.post('/register',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')
	
	var id = req.query.id;
	var user = req.query.user;
	var pass = req.query.pass;
	console.log(req.query.user)
	if(id == 1){
		suiji()
		console.log(yzmcode)
		// send(user,yzmcode)//每天最多一个手机号十条短信
	}else{
		var yzm = req.query.sjyzm;
		var pass = req.query.pass;
		// console.log(pass)
		
		
		if(yzm == yzmcode){
			console.log('对比成功，插入数据库')
			mongodb.connect(db_str,(err,database)=>{
				database.collection('sjyzm',(err,coll)=>{
					coll.find({user:user}).toArray((err,data)=>{
						if(data.length>0){
							res.send('2')
						}else{
							coll.save({user:user,pass:pass},()=>{						
								res.send('1')
							})
						}
						database.close();
					})
					
				})
			})
		}else{
			res.send('3')
		}
	}
	
})


app.post('/login',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')
	
	var id = req.query.id;
	var user = req.query.user;
	var pass = req.query.pass;
	console.log(req.query.user)
	console.log(req.query.id)	
	
	if(id == 2){
		console.log('对比成功')
		mongodb.connect(db_str,(err,database)=>{
			database.collection('sjyzm',(err,coll)=>{
				coll.find({user:user,pass:pass}).toArray((err,data)=>{
					console.log(data)
					if(data.length>0){
						console.log('登录成功')
						res.send('2')
					}else{						
						res.send('1')
					}
					database.close();
				})
				
			})
		})
	}	
})


app.post('/home',(req,res)=>{	
	mongodb.connect(db_str,(err,database)=>{
		database.collection('home',(err,coll)=>{
			coll.find({}).toArray((err,data)=>{
				res.send(data)
				database.close();
			})			
		})
	})	
})


app.post('/about',(req,res)=>{	
	mongodb.connect(db_str,(err,database)=>{
		database.collection('products',(err,coll)=>{
			coll.find({}).toArray((err,data)=>{
				res.send(data)
				database.close();
			})			
		})
	})	
})


app.post('/detail',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')	
//	console.log(req.query.id)
	// console.log(req.query)
	var id=req.query.id
	mongodb.connect(db_str,(err,database)=>{		
		database.collection('products',(err,coll)=>{			
			coll.find({id:id}).toArray((err,data)=>{			
				res.send(data)
//				console.log(data)
				database.close();
			})			
		})
	})	
})

app.post('/jiekuan',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')	
	console.log(req.query.tit)
	mongodb.connect(db_str,(err,database)=>{		
		database.collection('jie',(err,coll)=>{	
			coll.find({tit:req.query.tit}).toArray((err,data)=>{
				if(data.length>0){
					console.log(data)
					res.send('1')
				}else{
					coll.save(req.query,()=>{
						res.send('2')
					})
				}
				database.close()
			})  							 					
		})
	})	
})

app.post('/huan',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')	
	console.log(req.query.tit)
	mongodb.connect(db_str,(err,database)=>{		
		database.collection('jie',(err,coll)=>{	
			coll.find({}).toArray((err,data)=>{	
				console.log(data)
				res.send(data)
//				console.log(data)
				database.close();
			})  							 					
		})
	})	
})

app.post('/cha',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')	
	console.log(req.query)
	mongodb.connect(db_str,(err,database)=>{		
		database.collection('jie',(err,coll)=>{	
			coll.find({id:req.query.id}).toArray((err,data)=>{			
				if(data.length>0){					
					coll.deleteOne({id:req.query.id},()=>{
						res.send('1')
					})
				}else{
					res.send('2')
				}
				database.close()
			})
		})
	})	
})

app.post('/yue',(req,res)=>{
	res.header('Access-Control-Allow-Origin','*')	
	console.log(req.query)
	mongodb.connect(db_str,(err,database)=>{		
		database.collection('jie',(err,coll)=>{	
			coll.find({user:req.query.user}).toArray((err,data)=>{			
				res.send(data)
				database.close()
			})
		})
	})	
})

// app.post('/touz',(req,res)=>{
// 	res.header('Access-Control-Allow-Origin','*')	
// 	console.log(req.query)
// 	mongodb.connect(db_str,(err,database)=>{		
// 		database.collection('touzi',(err,coll)=>{			
// 			coll.save(req.query)						
// 			database.close()		
// 		})
// 	})	
// })

// app.post('/touzi',(req,res)=>{
// 	res.header('Access-Control-Allow-Origin','*')	
// 	console.log(req.query.id)
// 	var id=req.query.id
// 	mongodb.connect(db_str,(err,database)=>{		
// 		database.collection('about',(err,coll)=>{			
// 			coll.find({id:id}).toArray((err,data)=>{			
// 				res.send(data)
// 				database.close();
// 			})			
// 		})
// 	})	
// })

app.post('/jilu',(req,res)=>{
   	res.header('Access-Control-Allow-Origin','*')	
   	console.log(req.query.id)
   	var id=req.query.id
   	mongodb.connect(db_str,(err,database)=>{		
   		database.collection('jie',(err,coll)=>{			
   			coll.find({}).toArray((err,data)=>{			
   				res.send(data)
   				console.log(data)
   				database.close();
   			})			
   		})
   	})	
})


//搭建服务器
app.listen(3000)
