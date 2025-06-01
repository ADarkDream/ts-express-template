//数据库模块
import mysql from "mysql2/promise"
import { MysqlError, TransactionQuery } from "@/types/system"
//todo设置环境变量
import dotenv from "dotenv"
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` })

const isRemote = process.env.IS_REMOTE === "true"
let db: any

//#region SSH 连接远程数据库

import fs from "fs"
import { Client, ConnectConfig } from "ssh2"
// 手动读取 `.env.remote`(远程环境) 并解析为对象（不写入 process.env）
const productionEnv = dotenv.parse(fs.readFileSync("./.env.remote"))

const sshClient = new Client()

let dbPromise: any // 新增一个 Promise 以确保 db 初始化完成

/**初始化 SSH 连接，连接远程 MySQL 数据库*/
function initSSHConnection() {
  dbPromise = new Promise((resolve, reject) => {
    const ssh_config: ConnectConfig = {
      host: productionEnv.SSH_HOST,
      port: Number(productionEnv.SSH_PORT),
      username: productionEnv.SSH_USER,
      password: productionEnv.SSH_PWD,
    }
    //使用生产模式下的数据库配置（因为连接的是远程的数据库）
    const mysqlConfig = {
      host: productionEnv.DB_HOST,
      port: productionEnv.DB_PORT,
      user: productionEnv.DB_USER,
      password: productionEnv.DB_PWD,
      database: productionEnv.DB_NAME,
    }
    sshClient.on("ready", async () => {
      try {
        const stream = await new Promise((res, rej) => {
          sshClient.forwardOut(
            ssh_config.host!,
            ssh_config.port!,
            mysqlConfig.host,
            Number(mysqlConfig.port),
            (err, stream) => {
              if (err) rej(err)
              else res(stream)
            },
          )
        })

        const connection = await mysql.createConnection({
          ...mysqlConfig,
          port: Number(mysqlConfig.port),
          stream,
        })

        db = connection
        console.log("|SSH 链接成功")
        resolve(db)
      } catch (err) {
        reject(err)
      }
    })

    sshClient.on("error", (err) => {
      console.error("|SSH 链接失败:", err)
      reject(err)
    })

    sshClient.on("close", () => {
      console.log("|SSH 链接关闭")
    })

    sshClient.connect(ssh_config)
  })

  return dbPromise
}

//#endregion

//#region 本地连接服务器

/**建立与本地 MySQL 数据库的连接*/
const initLocalConnection = async () => {
  db = mysql.createPool({
    host: process.env.DB_HOST, // 数据库的IP地址
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined, //数据库端口号
    user: process.env.DB_USER, // 登录数据库的账号
    password: process.env.DB_PWD, // 登录数据库的密码
    database: process.env.DB_NAME, // 指定要操作哪个数据库
    charset: "utf8mb4", //解决不能存储emoji表情的问题(数据库、表、列的格式要同步修改)
    connectionLimit: 10, //连接池的最大连接数
  })
}

//#endregion

/**
 * 服务器启动时检测数据库是否连接，并进行连接
 */
const connectWithRetry = async () => {
  try {
    if (!db) {
      if (isRemote) {
        console.log("|尝试连接远程数据库")
        await initSSHConnection()
        db = await dbPromise
      } else {
        await initLocalConnection()
        await db.getConnection()
      }
    }
    if (db) {
      console.log("|数据库" + process.env.DB_NAME + "连接成功")
      //* 下方启动服务器初始化时的查询函数
      const data = await queryAsync("SELECT * FROM user WHERE uid > ?", [0])
      console.log("|查询结果：", data)
    } else throw new Error("|数据库暂未就绪，请稍后再试")
  } catch (err) {
    if (err instanceof Error && err.message) console.error(err.message)
    else console.error("|数据库" + process.env.DB_NAME + "连接失败，5秒后重试...", err)

    setTimeout(connectWithRetry, 5000) // 5秒后重试连接
  }
}

/**
 * 单条插入 / 查询 / 更新 / 删除，自动处理缓存
 * @param {string} sqlStr SQL语句
 * @param {Array} values 参数
 */
const queryAsync = async (sqlStr: string, values: Array<any>) => {
  try {
    console.warn("|执行SQL：", sqlStr, "\n|参数：", values)
    if (!db && isRemote) {
      db = await dbPromise
    }
    // 执行 SQL 查询
    const [results] = await db.query(sqlStr, values)

    return results // 返回查询结果
  } catch (err) {
    console.error(`数据库查询失败: ${err instanceof Error && err.message}`)
    console.error(err)
    throw handleMysqlError(err as MysqlError)
  }
}

/**
 * 执行批量事务,支持通过回调来动态处理(例如拿到上一条插入语句的id，加入到下一句关系连接语句)
 * @param {{sqlStr:string, values:Array,callback?:Function}} queries
 * @returns
 */
const transactionAsync = async (queries: TransactionQuery[]) => {
  let connection

  try {
    if (isRemote) {
      if (!db) db = await dbPromise
      connection = db
    } else {
      connection = await db.getConnection()
    }
    await connection.beginTransaction()
    console.log(`事务处理开始，共有 ${queries.length} 条语句`)

    const results = [] // 用于保存每个 SQL 语句的执行结果
    let currentIndex = 0

    while (currentIndex < queries.length) {
      const { sqlStr, values, callback } = queries[currentIndex]
      // console.log(`执行语句: ${sqlStr}, 参数: ${values}`);

      // 执行当前语句
      const [result] = await connection.query(sqlStr, values)
      results.push(result)

      // 如果存在 callback，动态生成更多 SQL 语句
      if (callback) {
        const newQueries = callback(result)
        if (newQueries && Array.isArray(newQueries)) {
          console.log(`动态生成 ${newQueries.length} 条新语句`)
          queries.push(...newQueries) // 推入到 queries 队列
        }
      }

      currentIndex++
    }

    await connection.commit()
    console.log(`事务处理成功，共执行 ${results.length} 条语句`)
    return results
  } catch (err) {
    if (connection) await connection.rollback()
    console.error(`事务处理失败: ${err instanceof Error && err.message}`)
    throw handleMysqlError(err as MysqlError)
  } finally {
    if (!isRemote && connection) connection.release()
  }
}

/**错误翻译函数*/
function handleMysqlError(err: MysqlError) {
  const errorMap: Record<string, string> = {
    ER_LOCK_DEADLOCK: "数据库出现死锁，请稍后再试或联系管理员",
    ER_DUP_ENTRY: "已有相同的数据存在，请勿重复提交",
    ER_NO_REFERENCED_ROW_2: "关联数据不存在，请确认相关信息是否填写正确",
    ER_ROW_IS_REFERENCED_2: "数据已被引用，无法删除",
    ER_BAD_NULL_ERROR: "缺少必要字段，请检查提交的数据",
    ER_PARSE_ERROR: "SQL 语法错误，请联系开发人员",
    ER_DATA_TOO_LONG: "有字段长度超出限制，请检查填写内容",
    ER_TRUNCATED_WRONG_VALUE: "数据格式错误，请检查输入",
  }

  if (err.code && errorMap[err.code]) {
    const userErr = new Error(errorMap[err.code]) as Error & {
      originalError: any
      statusCode: number
    }
    userErr.originalError = err
    userErr.statusCode = 400
    return userErr
  }

  // 默认错误
  const defaultErr = new Error("未知错误") as Error & { originalError: any; statusCode: number }
  defaultErr.originalError = err
  defaultErr.statusCode = 500
  if (err.message) defaultErr.message = err.message
  return defaultErr
}

export { connectWithRetry, queryAsync, transactionAsync }

//region 查询封装用法示例
// const fn= async () => {
//     try {
//         const queries = [
//             { sqlStr: 'INSERT INTO songInfo (cloud_music_id, name, duration) VALUES (?, ?, ?)', values: [36024806, '再见', 206.853] },
//             { sqlStr: 'INSERT INTO artists (cloud_artist_id, name) VALUES (?, ?)', values: [7763, 'G.E.M.邓紫棋'] },
//             { sqlStr: 'INSERT INTO album (album_id, name, publish_time) VALUES (?, ?, ?)', values: [318902, '新的心跳', 1446739200007] }
//         ]
//         await transactionAsync(queries)
//         console.log('数据插入成功')
//     } catch (err) {
//         console.error(err)
//     }
// }
// ### 说明：
// 1. **`transactionAsync` 函数**：
//    - `queries` 是一个包含 SQL 语句和参数的数组，每个对象都包含 `sqlStr` 和 `values`。
//    - 该函数会在 `START TRANSACTION` 后依次执行每个 SQL 语句。
//    - 如果所有操作成功，调用 `COMMIT` 提交事务。
//    - 如果某个操作失败，则会回滚 (`ROLLBACK`) 整个事务。
//endregion

//endregion
