const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Resturant = require('./models/resturant')
const bodyParser = require('body-parser')

const port = 3000
const app = express()

// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// DB connect
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// 取得資料庫連線狀態
const db = mongoose.connection

// DB連線異常
db.on('error', () => { console.log('DB error') })

// DB成功連線
db.once('open', () => { console.log('DB connected!') })

// setting static files
app.use(express.static('public'))

// setting template engine
app.engine('hbs', exphbs.create({ defaultLayout: 'main', extname: 'hbs' }).engine)
app.set('view engine', 'hbs')
app.set('views', './views')

// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  Resturant.find() // 取出DB resturants的資料 
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then(resturants => res.render('index', { resturants }))
    .catch(error => console.log(error))
})

app.get('/orderbyname', (req, res) => {
  Resturant.find() // 取出DB resturants的資料 
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .sort({ name: 'asc' })
    .then(resturants => res.render('index', { resturants }))
    .catch(error => console.log(error))
})

app.get('/category', (req, res) => {
  Resturant.find() // 取出DB resturants的資料 
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .sort({ category: 'asc' })
    .then(resturants => res.render('index', { resturants }))
    .catch(error => console.log(error))
})

// CRUD_Create_render
app.get('/resturants/new', (req, res) => {
  res.render('new')
})

// CRUD_Create_to DB || Back to top set body-parser
app.post('/resturants', (req, res) => {
  return Resturant.create({
    name: req.body.name,
    name_en: req.body.name_en,
    category: req.body.category,
    image: req.body.image,
    location: req.body.location,
    phone: req.body.phone,
    google_map: req.body.google_map,
    rating: req.body.rating,
    description: req.body.description,
  })
    .then(() => res.redirect('/'))// 新增完成後導回首頁
    .catch(error => console.log(error))
})

// CRUD_Read
app.get('/restaurants/:id', (req, res) => {
  // 要注意index中的<a>的_id是否正確
  const id = req.params.id
  return Resturant.findById(id)
    .lean()
    .then((resturants) => { res.render('detail', { resturants }) })
    .catch(error => console.log(error))
})

// CRUD_Update
app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Resturant.findById(id)
    .lean()
    .then((resturant) => res.render('edit', { resturant }))
    .catch((error) => console.log(error))
})


app.post('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Resturant.findById(id)
    .then((resturant) => {
      resturant.name = req.body.name,
        resturant.name_en = req.body.name_en,
        resturant.category = req.body.category,
        resturant.image = req.body.image,
        resturant.location = req.body.location,
        resturant.phone = req.body.phone,
        resturant.google_map = req.body.google_map,
        resturant.rating = req.body.rating,
        resturant.description = req.body.description
      return resturant.save()// 重新賦值並存入
    })
    .then((resturant) => { res.redirect(`/restaurants/${resturant.id}`) })
    .catch(error => console.log(error))
})

// CRUD_Delete
app.post('/restaurants/:id/delete', (req, res) => {
  const id = req.params.id
  return Resturant.deleteOne({ _id: id })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})


app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  const regex = new RegExp(keyword, 'i') // 模糊搜尋
  Resturant.find({ $or: [{ name: { $regex: regex } }, { category: { $regex: regex } }] })
    .lean()
    .then(resturants => res.render('index', { resturants, keyword }))
    .catch(error => console.log(error))
})


app.listen(port, () => {
  console.log(`It's running on http://localhost:${port}`)
})