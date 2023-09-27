const express = require("express")
const app = express()
const path = require('path')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const db = require('./config/db.js')
const flash = require('express-flash');
require('dotenv').config()

const ejs = require('ejs')

app.use(flash());
app.use(express.static("public"))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"views"))

app.set('view engine','ejs')
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
  }));
  

app.use("/",userRouter)
app.use('/admin',adminRouter)

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log("connected successfully");
})

