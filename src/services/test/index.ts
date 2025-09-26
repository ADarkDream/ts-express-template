/**
 * 检查数据是否存在(不为 null 或 undefined)
 * @param data - 需要检查的数据
 * @returns 如果数据存在则返回 true，否则返回 false
 */
export const checkData = (data: any) => {
  return data !== null && data !== undefined
}
