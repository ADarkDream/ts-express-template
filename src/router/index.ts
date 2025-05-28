//主要路由模块
import express, { Router } from "express"
import { asyncHandler } from "@/middleware/index"
import { CustomResponse } from "@/types/system"

import test from "./test/index"

const router: Router = express.Router()

//主路由示例
const mainRouter = asyncHandler(async (req, res: CustomResponse) => {
  //这里处理要返回的数据
  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("服务器连接成功")
}, "连接失败")

//默认路由，示例，调用处理函数
router.get("/", mainRouter)

//#region 一级路由

/**
 * test相关的路由模块
 * 为其添加一级路由/test
 * */
router.use("/test", test)

//#endregion

//找不到该页面时
router.use((req, res) => {
  console.log("找不到该地址:" + req.url)
  res.send("<h1>404 Not Found</h1><br><h3>找不到该地址</h3>")
})

//导出路由
export default router
