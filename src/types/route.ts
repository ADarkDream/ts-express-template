import { RequestHandler } from "express"
import { CustomRouter } from "./system"

/**工具类型：组合默认路由和用户扩展路由*/
export type RouterOf<T extends Record<string, RequestHandler>> = CustomRouter & T

/** /test 路由特有的扩展路由名称 */
export type TestRouterType = "bbb"
