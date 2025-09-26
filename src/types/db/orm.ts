import type {
  Model,
  ModelStatic,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  WhereOptions,
  Sequelize,
} from "sequelize"

/** 定义 db 对象结构 */
export interface DbInterface {
  sequelize: Sequelize
  Sequelize: typeof Sequelize
  [modelName: string]: ModelStatic<Model> | Sequelize | typeof Sequelize // 索引签名
}

/** 支持的动作 */
type Action = "create" | "update" | "destroy"

/** 单条任务 */
export interface TransactionTask<M extends Model = Model, R = any> {
  model: ModelStatic<M>
  action: Action

  /* create 用 */
  values?: M["_creationAttributes"]

  /* update 专用 */
  updateValues?: Partial<M["_creationAttributes"]> // ← 更新数据
  where?: WhereOptions<M["_attributes"]> // ← 条件

  options?: CreateOptions<M> | UpdateOptions<M> | DestroyOptions<M>
  callback?: (result: R) => TransactionTask[] | void
}
