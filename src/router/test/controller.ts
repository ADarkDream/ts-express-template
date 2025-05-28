import { asyncHandler } from "@/middleware/index"
import { CustomResponse } from "@/types/system"
import { RequestHandler } from "express"

/**
 * 示例路由：
 * - /test
 * */
export const test_main_router: RequestHandler = asyncHandler(async (req, res: CustomResponse) => {
  //这里处理要返回的数据
  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("服务器连接成功")
}, "连接失败")

/**
 * 示例路由：
 * - /test/aaa
 * */
export const test_aaa_router: RequestHandler = asyncHandler(async (req, res: CustomResponse) => {
  //这里处理要返回的数据
  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("服务器连接成功")
}, "连接失败")
