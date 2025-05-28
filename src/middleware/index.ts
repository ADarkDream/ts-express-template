// 中间件模块
import { Request, NextFunction, RequestHandler } from "express"
import { CustomResponse, CtxHandler } from "@/types/system"

/**全局中间件，精简res.send()*/
export const send = (req: Request, res: CustomResponse, next: NextFunction) => {
  res.ss = (data) => {
    if (typeof data === "string") return res.send({ code: 200, msg: data })
    const { code, ...restData } = data
    res.send({
      code: code || 200,
      ...restData,
    })
  }

  res.ww = (data) => {
    if (typeof data === "string") return res.send({ code: 300, msg: data })
    const { code, ...restData } = data
    res.send({
      code: code || 300,
      ...restData,
    })
  }

  res.ee = (err: Error | string, status = 400) => {
    res.send({
      code: status,
      //判断得到的err是系统的Error对象还是传递的字符串信息
      msg: err instanceof Error ? err.message : err,
    })
  }
  next()
}

/**
 * 封装异步请求处理，支持自定义错误消息
 * @param handler - 异步处理函数
 * @param defaultErrorMessage - 默认错误消息
 * @returns Express中间件函数
 */

export function asyncHandler(
  handler: CtxHandler,
  defaultErrorMessage = "未知错误",
): RequestHandler {
  // 改为返回标准的 RequestHandler
  return async (req, res, next) => {
    try {
      await handler(req, res as CustomResponse, next)
    } catch (err: any) {
      const msg = err?.message || defaultErrorMessage
      console.error("全局 asyncHandler 错误捕获：", msg)
      //因为加了类型断言，所以加了;()
      ;(res as CustomResponse).ee?.(msg)
    }
  }
}

const middleware = {
  send,
  asyncHandler,
}

export default middleware
