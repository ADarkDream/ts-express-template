/** 用户Token内的信息类型 */
export type UserInfo = {
  uid: number
  email: string
  username: string
}

/** 用户Token的类型 */
export type Token = {
  value: UserInfo
  /** token版本 */
  tokenVersion: number
  /** token过期时间戳 */
  exp: number
  /** token签发时间戳 */
  iat: number
}
