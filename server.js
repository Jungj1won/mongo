const express = require('express')  // express 라이브러리 사용 
const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// 몽고디비 연결 세팅 코드
const { MongoClient , ObjectId} = require('mongodb');

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
    응답.render('list.ejs',{post : result})
})

// REST API 규칙 살펴보기
// 글 작성 기능
// 1. 유저가 작성한 글을 DB에 저장해주기 -> 유저가 직접 디비랑 통신하게 두면 안됨 중간에 검사 필요 검사는 서버가 담당함
// 글 작성페이지에서 글 작성해서 서버로 전송 -> 서버가 검사 -> 디비에 저장 이걸 코드화 해보자

app.get('/write',(요청,응답) => {
    응답.render('write.ejs')
})

app.post('/newpost',async(요청,응답) => {
    console.log(요청.body)

    
    
    //에러시 다른 코드 실행은 try catch 문법 
    try {
        // 제목이 비어있으면 디비 추가하지 마라..
        // 예외처리 
        if (요청.body.title == ''){
            응답.send('제목입력해줘')
        } else {

            await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content}) // 디비에 데이터 넣는 코드 
            응답.redirect('/list') // 서버기능 실행 끝나면 응답해주기 유저를 다른 페이지로 이동시켜줌 
        }
    } catch(e) {
        console.log(e)
        응답.status(500).send('서버에러남 ㅅㄱ')
    }
})

// 기능이 어케 돌아가는지부터 파악해야지

app.get('/detail/:aaaa',async(요청,응답)=>{   // :aaaa 유저가 이 자리에 아무문자나 입력시 
    console.log(요청.params)
    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.aaaa)}) // findOne 안에꺼 찾아옴
    console.log(result)  
    응답.render('detail.ejs',{post : result})
})


// 상세페이지 기능
// 1. 유저가 /detail/어쩌구 접속하면
// 2. 아이디가 어쩌구인 글을 디비에서 찾아서
// 3. ejs 파일에 박아서 보내줌  

// 근데 누가 직접 아디를 입력함 
// 링크로 해야지

