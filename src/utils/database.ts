import { MysqlError } from "@/types/system"

/**
 * 数据库错误信息翻译函数
 * @param err 数据库错误对象
 * @returns 返回一个新的错误对象，包含用户友好的错误信息和原始错误对象
 */
export function handleMysqlError(err: MysqlError) {
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
