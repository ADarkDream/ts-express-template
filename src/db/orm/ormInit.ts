import { execSync } from "child_process" // 执行终端命令
import { existsSync } from "fs"
import { resolve, dirname, join } from "path"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

// 当前文件绝对路径
const __filename = fileURLToPath(import.meta.url)
// 当前文件所在目录
const __dirname = dirname(__filename)

/**执行终端命令， 生成sequelize的模型*/
export async function generateModel() {
  try {
    const { DB_NAME, DB_USER, DB_PWD, DB_HOST, DB_PORT } = process.env
    const filePath = resolve(__dirname, "./models")
    const initFilePath = join(filePath, "init-models.ts")

    if (existsSync(initFilePath)) {
      console.log("|✅ ./models/init-models.ts 文件存在，ORM模型已生成")
      return
    } else {
      console.warn(
        `|❌ ./models/init-models.ts 文件不存在,正在读取.env.${process.env.NODE_ENV}文件中的数据库配置,即将初始化ORM，生成模型`,
      )
    }

    const cmd = `npx sequelize-auto -o "${filePath}" -d ${DB_NAME} -h ${DB_HOST} -u ${DB_USER} -p ${DB_PORT} -x ${DB_PWD} -e mysql --lang ts --caseModel p --caseFile l`

    const stdout = execSync(cmd)
    console.log("✅ ORM模型生成成功：\n", stdout.toString())
  } catch (err) {
    console.error("❌ ORM模型生成失败：", err)
  }
}

generateModel()
