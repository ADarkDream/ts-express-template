import { user } from "../models/user" // 按你项目实际路径改
import { Op } from "sequelize"
import { ormFindAsync } from "../index" // 上面那个查询函数的路径

export async function testUserQuery() {
  const results = await ormFindAsync(user, {
    where: {
      uid: { [Op.gt]: 0 },
    },
  })

  console.log(results)
}
