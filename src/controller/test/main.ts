import { asyncHandler } from "@/middleware"
import { routerMerge } from "@/controller"
import { checkData } from "@/services/test"
import { CustomRouter } from "@/types/system"
import { TestRouterType } from "@/types/route"

/**
 * 示例路由：[get] /test
 */
const test_get = asyncHandler(async (req, res) => {
  //这里处理要返回的数据
  if (!checkData(req.query?.data)) {
    return res.ee("无效的请求数据", 400)
  }

  console.log("接收到数据:", req.query?.data)

  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("[get]/test请求成功")
}, "连接失败")

/**
 * 示例路由,其他请求类型
 */
const bbb = asyncHandler(async (req, res) => {
  //这里处理要返回的数据
  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("[get]bbb请求成功")
}, "连接失败")

/**示例路由/test*/
export const routers_test = routerMerge({
  /**  示例路由/test */
  get: test_get,
  bbb: bbb,
}) as CustomRouter<TestRouterType>
