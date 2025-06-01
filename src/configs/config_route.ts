export default {
  /**公共接口，不进行token校验*/
  PUBLIC: [
    "/account/emailCode", //登录验证码
    "/account/register", //注册
    "/account/login", //登录
    "/activity/list", //活动列表
    "/achievement/list", //成就列表
  ],
  /**没有以/admin和/sadmin开头的例外接口*/
  ADMIN: [
    "/activity/add", //添加活动
    "/activity/update", //更新活动
    "/activity/switch", //弃用/启用活动
    "/activity/connect", //修改用户的活动状态
    "/achievement/add", //添加成就
    "/achievement/update", //更新成就
    "/achievement/switch", //弃用/启用成就
    "/achievement/connect", //修改成就与活动的关联状态
  ],
}
