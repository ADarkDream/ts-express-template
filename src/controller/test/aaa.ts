import { asyncHandler } from "@/middleware"
import { routerMerge } from "@/controller"
import { CustomRouter } from "@/types/system"

/**
 * 示例路由：[get] /test/aaa
 */
const test_aaa_get = asyncHandler(async (req, res) => {
  //这里处理要返回的数据
  // return res.ss() 或 res.ww() 或 res.ee() 进行返回
  return res.ss("[get]/test/aaa请求成功")
}, "连接失败")

/**示例路由/test/aaa*/
export const routers_test_aaa = routerMerge({
  get: test_aaa_get,
}) as CustomRouter
