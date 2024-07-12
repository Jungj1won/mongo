const express = require('express')  // express 라이브러리 사용 
const app = express()


app.use(express.static(__dirname + '/public'))
app.set('view engine','ejs')

// 몽고디비 연결 세팅 코드
const { MongoClient } = require('mongodb');

let db;
const url = 'mongodb+srv://jj1jj1q:UrEyyimnLRmaESip@cluster0.oei3cah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client)=>{
    console.log('DB연결성공')
    db = client.db('forum');
    app.listen(8080,() => {
        console.log("http://localhost:8080 에서 서버 실행 중") // port 하나 오픈하는 문법 
    }) // 여기 안에 하는게 좋은 관습 
}).catch((err) => {
    console.log(err)
})


// app.listen(8080,() => {
//     console.log("http://localhost:8080 에서 서버 실행 중") // port 하나 오픈하는 문법 
// })

app.get('/',(요청,응답) => {
    응답.sendFile(__dirname + '/index.html')  // html 파일 보내려면 sendFile 
})

app.get('/news',(요청,응답) => {    // /news로 접속하면 오늘의 뉴스 보여주기 
    db.collection('post').insertOne({title : '어쩌구'})
    // 응답.send('오늘 비옴')
})

app.get('/shop',(요청,응답) => {
    응답.send('쇼핑페이지입니다.')
})

app.get('/list',async(요청,응답) => {
    let result = await db.collection('post').find().toArray() // document 콜렉션 모두 가져오기 
    응답.render('list.ejs',{posts : result})
})

