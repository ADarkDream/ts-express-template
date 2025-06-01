import { Request, Response, NextFunction, RequestHandler } from "express"

/**返回结果类型*/
type Result<T> = {
  code: number
  msg: string
  data?: T
}

/**拓展 Request 类型*/
export interface CustomRequest extends Request {
  auth?: {
    value: {
      uid: number
      email: string
      username: string
    }
    exp: number
    iat: number
  }
}

/**拓展 Response 类型*/
export interface CustomResponse extends Response {
  /**正确返回函数，不传code值则默认为200*/
  ss: (data: string | Result<any>, status?: number) => void
  /**警告返回函数，不传code值则默认为300*/
  ww: (data: string | Result<any>, status?: number) => void
  /**错误返回函数，不传status值则默认为400*/
  ee: (data: string | Error, status?: number) => void
}

/**路由处理函数类型*/
export type CtxHandler = (
  req: Request,
  res: CustomResponse,
  next: NextFunction,
) => void | Promise<void>

/**路由处理函数类型*/
export interface CustomRouter {
  get: RequestHandler
  post: RequestHandler
  delete: RequestHandler
  put: RequestHandler
  [key: string]: RequestHandler
}

/**数据库错误类型*/
export interface MysqlError extends Error {
  code?: string
  errno?: number
  sqlMessage?: string
}

/**数据库事务委托查询参数类型*/
export type TransactionQuery = { sqlStr: string; values: Array<any>; callback?: Function }
