import { Request, Response, NextFunction, RequestHandler } from "express"
import { Token } from "./account"

/**带错误参数的中间件类型*/
export type MiddleWareWithErrorType = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void

/**中间件类型*/
export type MiddlewareType = (req: Request, res: Response, next: NextFunction) => void

/**返回结果类型*/
type Result<T = any> = {
  code: number
  msg: string
  data?: T
}

/**拓展 Request 类型*/
export interface CustomRequest extends Request {
  auth?: Token
}

/**拓展 Response 类型*/
export interface CustomResponse<T = any> extends Response {
  /**正确返回函数，不传code值则默认为200*/
  ss: (data: string | Result<T>, status?: number) => void
  /**警告返回函数，不传code值则默认为300*/
  ww: (data: string | Result<T>, status?: number) => void
  /**错误返回函数，不传status值则默认为400*/
  ee: (data: string | Error, status?: number) => void
}

/**路由处理函数类型*/
export type CtxHandler = (
  req: Request,
  res: CustomResponse,
  next: NextFunction,
) => void | Promise<void>

/**数据库错误类型*/
export interface MysqlError extends Error {
  code?: string
  errno?: number
  sqlMessage?: string
}

/**数据库事务委托查询参数类型*/
export type TransactionQuery = { sqlStr: string; values: Array<any>; callback?: Function }

/**路由处理函数类型*/
export type CustomRouter<T extends string = string> = {
  [key in T]: RequestHandler
} & {
  get: RequestHandler
  post: RequestHandler
  delete: RequestHandler
  put: RequestHandler
}
