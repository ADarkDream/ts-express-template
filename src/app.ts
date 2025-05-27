// src/app.ts
import dotenv from "dotenv" //环境变量的库
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` })
import express from "express"
import cors from "cors"

const app = express()
console.warn(`|当前环境是：${process.env.Node_ENV} 模式`)

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Hello, TypeScript and Express!")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})
