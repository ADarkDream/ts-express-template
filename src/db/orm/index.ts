import {
  Sequelize,
  DataTypes,
  Model,
  ModelStatic,
  CreateOptions,
  InferCreationAttributes,
  FindOptions,
} from "sequelize"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"

import { initModels } from "./models/init-models"
import { handleMysqlError } from "@/utils/database"
import { MysqlError } from "@/types/system"

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
const { DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT } = process.env
console.log(DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT)

const sequelize = new Sequelize(DB_NAME!, DB_USER!, DB_PWD, {
  dialect: "mysql",
  host: DB_HOST,
  port: Number(DB_PORT),
  dialectOptions: {
    charset: "utf8mb4",
  },
  define: {
    underscored: false, //字段名是否使用下划线分隔
  },
})
const models = initModels(sequelize)

sequelize
  .authenticate()
  .then(() => {
    console.log("|Sequelize连接数据库成功")
  })
  .catch((err: Error) => {
    console.error("|Sequelize连接数据库失败:", err)
  })

// 初始化模型容器
const db: DbInterface = { sequelize, Sequelize }

// 定义 db 对象结构
interface DbInterface {
  sequelize: Sequelize
  Sequelize: typeof Sequelize
  [modelName: string]: ModelStatic<Model> | Sequelize | typeof Sequelize // 索引签名
}

// 动态导入模型文件
const modelsDir = path.join(process.cwd(), "models")
const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")

modelFiles.forEach(async (file) => {
  // 使用 async 来保证顺序执行
  const model = await import(path.join(modelsDir, file))
  const modelInstance = model.default(sequelize, DataTypes) // 使用 default 导入模型
  db[modelInstance.name] = modelInstance
})

// 建立模型之间的关联关系（如果有的话）
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

/**
 * 通用 ORM 插入封装
 * @param model Sequelize 模型
 * @param values 插入字段
 * @param options Sequelize 插入选项（可选，比如事务）
 */
const ormInsertAsync = async <T extends Model>(
  model: ModelStatic<T>,
  values: InferCreationAttributes<T>,
  options: CreateOptions = {},
): Promise<T> => {
  try {
    return await model.create(values, options)
  } catch (err) {
    console.error(`ORM 插入失败: ${err instanceof Error && err.message}`)
    throw handleMysqlError(err as MysqlError)
  }
}

/**通用 ORM 查询封装*/
const ormFindAsync = async <T extends Model>(
  model: ModelStatic<T>,
  options: FindOptions = {},
): Promise<T[]> => {
  try {
    return await model.findAll(options)
  } catch (err) {
    console.error(`ORM 查询失败: ${err instanceof Error && err.message}`)
    throw err
  }
}

/**
 * 使用 Sequelize 执行批量事务操作，支持动态插入语句（通过回调函数添加更多任务）。
 *
 * @async
 * @param {Array<{
 *   model: import('sequelize').ModelStatic<any>, // Sequelize 模型（如 User, Post）
 *   action: 'create' | 'update' | 'destroy' | 'query',      // 操作类型
 *   values: Object | Array,                       // 要传入操作的数据
 *   options?: Object,                             // 额外选项（例如 where 条件、个性化事务配置等）
 *   callback?: (result: any) => Array<{
 *     model: import('sequelize').ModelStatic<any>,
 *     action: 'create' | 'update' | 'destroy',
 *     values: Object | Array,
 *     options?: Object,
 *     callback?: Function
 *   }>
 * }>} tasks 要执行的事务任务队列，每项包含模型、操作、数据及可选的回调
 *
 * @returns {Promise<Array>} 所有任务的执行结果数组
 *
 * @example
 * await sequelizeTransactionAsync([
 *   {
 *     model: User,
 *     action: 'create',
 *     values: { name: 'Alice' },
 *     callback: (user) => [
 *       {
 *         model: Profile,
 *         action: 'create',
 *         values: { userId: user.id, bio: 'Hello World' }
 *       }
 *     ]
 *   }
 * ])
 */
const ormTransactionAsync = async (tasks) => {
  const t = await db.sequelize.transaction()
  const results = []
  let currentIndex = 0

  try {
    while (currentIndex < tasks.length) {
      const { model, action, values, options = {}, callback } = tasks[currentIndex]
      let result

      if (!model || !model[action]) {
        throw new Error(`模型或操作未定义: ${model?.name || "unknown"}.${action}`)
      }

      // 添加事务到 options 中
      const opts = { ...options, transaction: t }

      if (action === "create") {
        result = await model.create(values, opts)
      } else if (action === "update") {
        result = await model.update(values, opts)
      } else if (action === "destroy") {
        result = await model.destroy(opts)
      } else {
        throw new Error(`不支持的操作类型: ${action}`)
      }

      results.push(result)

      if (callback) {
        const newTasks = callback(result)
        if (newTasks && Array.isArray(newTasks)) {
          tasks.push(...newTasks)
        }
      }

      currentIndex++
    }

    await t.commit()
    return results
  } catch (err) {
    await t.rollback()
    console.error(`事务失败：${err instanceof Error && err.message}`)
    throw err
  }
}
export { sequelize, Sequelize, models, ormInsertAsync, ormFindAsync, ormTransactionAsync }
