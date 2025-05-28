// src/app.ts
import dotenv from "dotenv" //环境变量的库
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` })
import express from "express"
import cors from "cors"
import { send } from "@/middleware/index"
import { Request, Response, NextFunction } from "express"
//导入全部路由文件
import routers from "@/router/index"

const PORT = process.env.PORT || 3000

const app = express()

// 有代理服务器，需要开启这个选项,获取访问者真实IP
app.set("trust proxy", true)

//处理跨域，用CORS中间件
app.use(
  cors({
    origin: "*", // 只允许这个源发起跨源请求
    methods: ["GET", "POST", "PUT", "DELETE"], // 允许的HTTP方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
  }),
)

//转换客户端提交的json格式的数据
app.use(express.json())
//转换客户端提交的urlencoded（表单）格式的数据
app.use(express.urlencoded({ extended: true }))

//全局中间件，精简res.send()
app.use(send as (req: Request, res: Response, next: NextFunction) => void)

//路由模块
app.use("/", routers)

app.listen(PORT, () => {
  console.warn(`|当前环境是：${process.env.Node_ENV} 模式`)
  console.warn(`|服务器已启动，正在监听端口 ${PORT}.`)
})

//全局捕获未处理的异常，防止崩溃
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 未处理的异常：")
  console.error(reason)
})
