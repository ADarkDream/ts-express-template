// 中间件模块
import { Request, NextFunction, RequestHandler } from "express"
import { CustomRequest, CustomResponse, CtxHandler } from "@/types/system"
import { expressjwt } from "express-jwt"
import newJwt from "@/auth/token"
import { getDiffTime, getTime } from "@/utils/time"
import config_route from "@/configs/config_route"
import { Secret } from "jsonwebtoken"

/**全局中间件，精简res.send()*/
export const send = (req: Request, res: CustomResponse, next: NextFunction) => {
  res.ss = (data, status = 200) => {
    if (typeof data === "string") return res.send({ code: status, msg: data })
    const { code, ...restData } = data
    res.send({
      code: code || status || 200,
      ...restData,
    })
  }

  res.ww = (data, status = 300) => {
    if (typeof data === "string") return res.send({ code: status, msg: data })
    const { code, ...restData } = data
    res.send({
      code: code || status || 300,
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

/**全局错误中间件,捕获未捕获的错误(在app末尾使用)*/
export const errorHandler = (
  err: Error,
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction,
) => {
  console.error("|发生了错误：", err)
  // JWT错误
  if (err.name === "UnauthorizedError") {
    if (err.message === "jwt expired") {
      res.ee("身份认证已过期,请重新登录！", 401)
    } else if (err.message === "No authorization token was found") {
      res.ee("您尚未登录,请先登录！", 402)
    } else {
      console.error("|未知JWT错误：" + err.message)
      res.ee(`未知错误：${err.message}`)
    }
  } else {
    console.error("|发生了未知错误")
    res.ee(err?.message || "未知错误")
  }
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
      await handler(req as CustomRequest, res as CustomResponse, next)
    } catch (err: any) {
      const msg = err?.message || defaultErrorMessage
      console.error("|路由错误捕获：", msg)
      //因为加了类型断言，所以加了;()
      ;(res as CustomResponse).ee?.(msg)
    }
  }
}

//#region 引入token的加密和解密模块

let { currentSecretKey, oldSecretKey, cycleTime } = newJwt.update() //检查并更新密钥版本
//如果更新周期短于一天，那么就设置定时器周期更新
if (cycleTime < 86400000)
  setInterval(() => {
    ;({ currentSecretKey, oldSecretKey, cycleTime } = newJwt.update()) //批量解构赋值
    console.log("已修改token加密密钥")
  }, cycleTime)

// 检查token是否即将过期，如果是，则生成新的token
let times = 0

export const jwtHandler = (req: Request, res: CustomResponse, next: NextFunction) => {
  // 检查请求路径是否为需要排除的路径，如果是，则直接调用 next() 进行下一个中间件处理
  times += 1
  console.warn("第" + times + "次请求")

  //获取网站访问来源信息
  console.log("\r\n———————————————————————")
  console.log("时间：" + getTime())
  console.log("接口：" + req.url)
  console.log("方法：" + req.method)
  console.log("IP：" + req.ip)
  // const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip']
  if (req.ip === "::ffff:127.0.0.1") console.log("当前是本地调试访问")
  //如果请求以下接口则不验证token
  //接口代理
  if (req.path.startsWith("/download1999")) return next()
  else if (req.path.startsWith("/myMusic")) return next()
  //公共接口
  else if (config_route.PUBLIC.includes(req.path)) {
    return next()
  }
  //用token密钥进行验证，并返回对应结果
  jwtVerification(req, res, next, currentSecretKey)
}

//用token密钥进行验证，并返回对应结果
const jwtVerification = (
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction,
  secretKey: Secret,
) => {
  expressjwt({
    secret: secretKey,
    algorithms: ["HS256"],
  })(req, res, (err) => {
    if (err) {
      //密钥不对会验证失败，报错
      if (secretKey === oldSecretKey) {
        // 如果已经是旧密钥，则第二次验证也失败了，返回错误
        console.log("token校验第二次失败，已拒绝访问")
        return res.ss("身份认证失败，请重新登录!", 401)
      }
      // 如果第一次验证失败，尝试第二个密钥
      console.log("token校验第一次失败")
      //上一版密钥不存在时
      console.log(oldSecretKey)
      if (!oldSecretKey) return res.ee("您尚未登录,请先登录！", 401)
      return jwtVerification(req, res, next, oldSecretKey)
    }
    // 验证成功，执行后续逻辑
    let token = req.headers.authorization
    if (!token) return res.ee("身份认证失败，请重新登录!", 401) // 如果请求没有token，则直接返回
    // 去除token中的Bearer前缀
    if (token && token.startsWith("Bearer ")) {
      req.headers.authorization = token.substring(7)
      token = token.substring(7)
    }
    // console.log(req.auth)
    //如果token验证失败(已过期)，则直接拒绝访问
    if (!newJwt.verify(token) || !req.auth) return res.ee("身份认证已过期，请重新登录", 401)
    // 如果token还有一个小时就要过期，或者token已经是上一版本的
    else if (req.auth.exp * 1000 - Date.now() < 3600000 || secretKey === oldSecretKey) {
      //则生成新的token返回
      const newToken = newJwt.create(req.auth.value)
      // console.log(newToken)
      // 将新token放入响应头中，客户端可以通过响应头获取新token
      res.header("Authorization", newToken)
      res.setHeader("Access-Control-Expose-Headers", "Authorization")
      return next()
    }
    // 如果token未过期
    // console.log('用户的token信息已解密到req.auth.value')
    console.log(
      "用户：" + req.auth.value.uid + "-" + req.auth.value.username + "-" + req.auth.value.email,
    )
    console.log("token过期时间：" + getDiffTime(req.auth.exp * 1000))
    // 进入下一个中间件
    return next()
  })
}

//#endregion

const middleware = {
  send,
  errorHandler,
  asyncHandler,
}

export default middleware
