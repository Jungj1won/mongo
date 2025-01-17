const express = require('express')  // express 라이브러리 사용 
const app = express()
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//passport 라이브러리 세팅 코드
const session = require("express-session")
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo')

// app.use 순서 지키기 
app.use(passport.initialize())
app.use(session({
    secret : "5454kj**", // 세션의 document id 는 암호화에서 유저에게 보냄
    resave : false,  // 유저가 서버로 요청할 때마다 세션 갱신할건지 보통 false
    saveUninitialized : false, // 로그인 안해도 세션 만들건지 보통 false
    cookie : {maxAge : 60 * 60 * 1000},
    store : MongoStore.create({
        mongoUrl : 'mongodb+srv://jj1jj1q:UrEyyimnLRmaESip@cluster0.oei3cah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        dbName : 'forum'
    })
}))
app.use(passport.session())


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
    
    try {
        console.log(요청.params)
        let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.aaaa)}) // findOne 안에꺼 찾아옴
        console.log(result)  
        응답.render('detail.ejs',{post : result})
    } catch(e) {
        console.log(e)
        응답.status(500).send("이상한 url 들어옴")
    }
})


// 상세페이지 기능
// 1. 유저가 /detail/어쩌구 접속하면
// 2. 아이디가 어쩌구인 글을 디비에서 찾아서
// 3. ejs 파일에 박아서 보내줌  

// 근데 누가 직접 아디를 입력함 
// 링크로 해야지


// 글 수정 버튼
// 1. 수정버튼 누르면 수정페이지로 이동
// 2. 수정페이지에는 기존 글이 채워져있음
// 3. 전송 누르면 입력한 내용으로 디비 글 수정 

app.get('/edit/:id', async(요청,응답)=>{

    // db.collection('post').updateOne({_id : new ObjectId(요청.params.id)},{$set : {title : 요청.body.title, content : 요청.body.content}}) // 수정 코드

    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)})
    응답.render('edit.ejs',{post : result})
})

app.put('/edit', async(요청,응답)=>{

    await db.collection('post').updateOne({ _id : 1 },
        {$inc : {like : -2}}) 

    // await db.collection('post').updateOne({_id : new ObjectId(요청.body.id)},{$set : {title : 요청.body.title, content : 요청.body.content}}) // 수정 코드

    // console.log(요청.body)
    // 응답.redirect('/list')
})

// 글 삭제버튼 누르면 해당 글 디비에서 삭제
// 유저가 직접 하면 문제 생길 확률 높음
// 글 삭제버튼 누르면 서버로 요청
// 서버는 확인 후 해당 글 디비에서 삭제
// AJAX 사용

app.get('/abc',async(요청,응답)=>{
    console.log('안녕')
    console.log(요청.query)
})

app.delete('/delete' , async(요청,응답)=>{
    console.log(요청.query)
    await db.collection('post').deleteOne({ _id : new ObjectId(요청.query.docid) })
    응답.send('삭제완료')
})

app.get('/list/:id',async(요청,응답) => {
    let result = await db.collection('post').find().skip((요청.params.id-1)*5).limit(5).toArray() 
    응답.render('list.ejs',{post : result})
})

app.get('/list/next/:id',async(요청,응답) => {
    let result = await db.collection('post').find({_id : {$gt : new ObjectId(요청.params.id) }}).limit(5).toArray() 
    응답.render('list.ejs',{post : result})
})



//회원가입 session 방식
// 1. 가입기능
// 2. 로그인 기능
// 3. 로그인 완료시 session만들기
// 4. 로그인 완료시 유저에게 입장권 보내줌
// 5. 로그인 여부 확인하고 싶으면 입장권 까봄
// 회원가입 기능 쉽게 만들어주는 passport 라이브러리 사용

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    // 제출한 아이디 비번 검사하는 로직 
    let result = await db.collection('user').findOne({username : 입력한아이디})
    if (!result) {
        return cb(null,false,{ message : '아이디가 존재하지 않습니다.'})
    }
    
    if (await bcrypt.compare(입력한비번, result.password)) {
        return cb(null,result)

    } else {
        return cb(null,false,{message : '비밀번호가 일치하지 않습니다.'});
    }
}))

passport.serializeUser((user,done) => {
    console.log(user)
    process.nextTick(()=>{
        done(null, {id : user._id, username : user.username}) 
    })
})

passport.deserializeUser(async(user,done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    delete result.password
    process.nextTick(()=>{
        done(null,result) 
    })
})

app.get('/login',async(요청,응답) => {
    console.log(요청.user)
    응답.render('login.ejs')
})

app.post('/login',async(요청,응답,next) => {
    
    passport.authenticate('local',(error,user,info)=>{
        if(error) return 응답.status(500).json(error)
        if(!user) return 응답.status(401).json(info.message)
        요청.logIn(user, (err) =>{
            if(err) return next(err)
            응답.redirect('/')
        }) // 세션만들어주기
    })(요청, 응답, next)


})

app.get('/register', (요청,응답) => {
    응답.render('register.ejs')
})

app.post('/register', async(요청,응답) => {

    let 해쉬 = await bcrypt.hash(요청.body.password, 10)
    console.log(해쉬)

    await db.collection('user').insertOne({
        username : 요청.body.username,
        password : 해쉬
    }
    )
    응답.redirect('/')
})