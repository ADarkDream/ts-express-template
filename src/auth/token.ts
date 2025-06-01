//token加密和解密的模块
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken"
import fs from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import crypto from "crypto" //获取随机密钥
import { getDiffTimestamp, getDiffTime } from "@/utils/time"

// 当前文件绝对路径
const __filename = fileURLToPath(import.meta.url)
// 当前文件所在目录
const __dirname = dirname(__filename)

/**当前版本的密钥*/
let currentSecretKey: Secret = ""
/**当前密钥的版本*/
let currentVersion: number = 0
/**上个版本的密钥*/
let oldSecretKey: Secret = ""
/**更新周期*/
const updateCycle: string = "14d"
/**更新周期的毫秒数*/
const cycleTime: number = 1209600000

type Token = {
  version: number
  key: string
  time: number
  cycle: string
  [key: string]: any
}

/**检查更新token的密钥*/
function updateTokenSecretKey() {
  const filePath = resolve(__dirname, "../configs/keys.json")

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))

  const thisVersion = data.key[data.key.length - 1] //获取最新版密钥信息
  const lastVersion = data.key[data.key.length - 2] //获取上个版密钥信息
  const { version, key, time } = thisVersion
  currentSecretKey = key
  oldSecretKey = lastVersion?.key
  currentVersion = version
  console.log("|上次token密钥更新的时间:", getDiffTime(time))
  console.log("|token密钥更新周期：" + updateCycle)
  console.log("————————————————————————")
  const diffTime = getDiffTimestamp(time) / cycleTime //上次与现在的时间差值除以更新周期
  //更新token的密钥
  if (diffTime > 1) {
    //如果大于一周，则更新token的密钥
    const newKey: Token = {
      version: version + 1, //记录本次更新密钥版本
      key: crypto.randomBytes(32).toString("hex"), // hex ：一种编码格式，将每个字节编码为两个十六进制字符
      time: Date.now(), //记录本次更新时间
      cycle: updateCycle, //记录更新周期
    }

    data.key.push(newKey)
    //更新密钥
    oldSecretKey = currentSecretKey
    currentSecretKey = newKey.key
    currentVersion = newKey.version
    //保存更新后的密钥
    fs.writeFileSync(filePath, JSON.stringify(data))
  }
  return { currentSecretKey, oldSecretKey, currentVersion, cycleTime, updateCycle }
}

/**
 * 创建token
 * @param value 要加密的值
 * @param time 过期时间
 * @returns 加密后的token
 */
function newToken(value: Token, time: string = updateCycle): string {
  value.tokenVersion = currentVersion
  const option: SignOptions = { expiresIn: time as SignOptions["expiresIn"] }
  return jwt.sign({ value }, currentSecretKey, option)
}

/**
 * 依次验证新旧两个key加密的token，返回解析后的值
 * @param token 要验证的token(包括创建的时候传的value和过期时间)
 * @returns 验证结果
 * - string | JwtPayload：验证成功
 * - false：验证失败，过期或出错了
 */
function verifyToken(token: string): boolean | string | JwtPayload {
  try {
    return jwt.verify(token, currentSecretKey) //验证当前版本的key
  } catch (error) {
    if (oldSecretKey) {
      try {
        return jwt.verify(token, oldSecretKey) //验证上一版本的key
      } catch (err) {
        return false
      }
    }
    return false
  }
}

//合并方法
const newJwt = {
  /**创建加密token的函数 jwt.create()*/
  create: newToken,
  /**创建验证token的函数jwt.verify()*/
  verify: verifyToken,
  /**检查、更新token密钥*/
  update: updateTokenSecretKey,
}
export default newJwt
