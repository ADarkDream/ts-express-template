import { User } from "../models/user" // 按你项目实际路径改
import { Op } from "sequelize"
import { ormFindAsync } from "../index" // 上面那个查询函数的路径

/**
 * ORM测试查询用户信息
 */
export async function testUserQuery() {
  const results = await ormFindAsync(User, {
    where: {
      uid: { [Op.gt]: 0 },
    },
  })

  console.log("|ORM测试查询用户信息，查询结果条数：", results.length)
}
