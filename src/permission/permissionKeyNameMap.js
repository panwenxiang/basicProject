// 权限标识关键字映射表 前端代码使用的字段名： 菜单配置中的 标识关键字

const UserPermission = {
  ADD: 'userAdd',
  DELETE: 'userDelete',
  UPDATE: 'userUpdate',
  ROLE_ASSIGN: 'roleAssign',
  COMPANY_LIST: 'companyListAll'
}
const KeyPermission = {
  ADD: 'kmsSecretKeyAdd',
  DELETE: 'kmsSecretKeyDelete',
  UPDATE: 'kmsSecretKeyUpdate'
}
export {
  UserPermission,
  KeyPermission
}
