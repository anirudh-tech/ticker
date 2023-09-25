const express = require("express")
require("dotenv").config()
const app = express()
const path = require('path')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
const cookieParser = require('cookie-parser')
const db = require('./config/db')
require('dotenv').config()

const ejs = require('ejs')

app.use(express.static("public"))


app.set("views",path.join(__dirname,"views"))

app.set('view engine','ejs')

app.use("/",userRouter)
app.use('/admin',adminRouter)

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log("connected successfully");
})

