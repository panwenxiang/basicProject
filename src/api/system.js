import request from '@/utlis/request'

const api = {
  userList: '/user/list',
  addUser: '/user/add',
  deleteUser:'/user/delete',
  userBatchDelete:'/user/delete',
  updateUser: '/user/update',
  updateUserInfo: '/profile/updateCurrentUser', // 用户修改自己的个人信息
  useMfa: '/enableMfa', // 用户设置是否启用双因子验证
  userStatus: '/user/status',
  userBatchStatus: '/user/status/batch',
  getUserInfo: '/user/getById',
  userSetRoles: '/user/setRoles',
  getRole: '/user/getRoles',
  roleList: '/role/list',
  operateLogsList: '/operLog/list',
  operateLogsDelete: '/operLog/delete/',
  menuAdd: '/menu/add',
  menuSysList: '/menu/sysList',
  menuDelete: '/menu/delete/',
  menuDetail: '/menu/getById/',
  menuUpdate: '/menu/update',
  roleStatus: '/role/status/',
  roleAdd: '/role/add',
  roleAssign: '/role/assign', // 权限分配
  roleDelete: '/role/delete/batch',
  roleBatchDelete: '/role/delete/batch', // 批量删除
  roleBatchStatus: '/role/status/batch', // 批量设置角色状态
  rolePermission: '/role/roleForPermission/', // 获取某个用户的权限
  roleUpdate: '/role/update',
  dictTypeList: '/dict/list', // 查询数据字典 列表
  dictTypeAdd: '/dict/add', // 数据字典添加
  dictTypeUpdate: '/dict/update', // 修改数据字典类型
  dictList: '/dictData/selectType/', // 获取字典项 对应的键值列表
  dictAdd: '/dictData/add', // 字典项 键值对添加
  dictUpdate: '/dictData/update', // 字典项键值对 编辑
  dictTypeDeleteBatch: '/dict/batchDelete', // 数字字典类型 批量删除
  dictDeleteBatch: '/dictData/', // 数据字典值  批量删除
  userResetPwd: '/user/resetPwd/',
  operLogGetById:  '/operLog/getById/',
  getWxCpAppAuthInfo: '/getWxCpAppAuthInfo',
  commonProvince: '/common/province',
  commonCity: '/common/city',
  commonCounty: '/common/county',
}

export default api
// 用户管理列表
export function getUserList(parameter) {
  return request({
    url: api.userList,
    method: 'get',
    params: parameter,
  })
}
// 根据id查询用户管理详情
export function getUserInfo(parameter) {
  return request({
    url: `${api.getUserInfo}/${parameter}`,
    method: 'get',
    // params: parameter
  })
}
// 新增用户
export function addUser(parameter) {
  return request({
    url: api.addUser,
    method: 'post',
    data: parameter,
  })
}
//删除用户
export function deleteUser(parameter) {
  return request({
    url: api.deleteUser,
    method: 'put',
    data: parameter,
  })
}
export function   userBatchDelete(parameter) {
  return request({
    url: api.userBatchDelete,
    method: 'put',
    data: parameter,
  })
}

// 修改用户信息
export function updateUser(parameter) {
  return request({
    url: api.updateUser,
    method: 'put',
    data: parameter,
  })
}

// 批量设置用户状态
export function userBatchStatus(parameter) {
  return request({
    url: api.userBatchStatus,
    method: 'put',
    data: parameter,
  })
}

// 角色列表
export function getRoleList(parameter) {
  return request({
    url: api.roleList,
    method: 'get',
    params: parameter,
  })
}
// 设置用户角色
export function setBatchRole(parameter) {
  return request({
    url: api.userSetRoles,
    method: 'post',
    data: parameter,
  })
}
// 用户所属角色查询
export function getRole(parameter) {
  return request({
    url: api.getRole,
    method: 'get',
    params: parameter,
  })
}
// 更改用户状态
export function changeUserStatus(parameter) {
  return request({
    url: `${api.userStatus}/${parameter}`,
    method: 'put',
    // params: parameter
  })
}
// 操作日志列表
export function getOperateLogsList(parameter) {
  return request({
    url: api.operateLogsList,
    method: 'get',
    params: parameter,
  })
}

// 操作日志列表 清理 deleteType 1,2,3 => 一天前 一周前 一个月前
export function operateLogsDelete(deleteType) {
  return request({
    url: `${api.operateLogsDelete}${deleteType}`,
    method: 'delete',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
}

// 获取全部列表
export function getAllMenuList() {
  return request({
    url: api.menuSysList,
    method: 'get',
  })
}

export function menuAdd(parameter) {
  return request({
    url: api.menuAdd,
    method: 'post',
    data: parameter,
  })
}

export function menuDelete(id) {
  return request({
    url: `${api.menuDelete}${id}`,
    method: 'delete',
  })
}

export function menuDetail(id) {
  return request({
    url: `${api.menuDetail}${id}`,
    method: 'get',
  })
}

// 修改用户信息
export function menuUpdate(parameter) {
  return request({
    url: api.menuUpdate,
    method: 'put',
    data: parameter,
  })
}

// 更改角色状态
export function changeRoleStatus(parameter) {
  return request({
    url: `${api.roleStatus}${parameter}`,
    method: 'put',
  })
}

export function roleAdd(parameter) {
  return request({
    url: api.roleAdd,
    method: 'post',
    data: parameter,
  })
}

export function roleAssign(parameter) {
  return request({
    url: api.roleAssign,
    method: 'post',
    data: parameter,
  })
}

export function roleDelete(id) {
  return request({
    url: `${api.roleDelete}${id}`,
    method: 'post',
  })
}

export function   roleBatchDelete(parameter) {
  return request({
    url: api.roleBatchDelete,
    method: 'post',
    data: parameter,
  })
}

export function roleBatchStatus(parameter) {
  return request({
    url: api.roleBatchStatus,
    method: 'put',
    data: parameter,
  })
}

export function rolePermission(roleId) {
  return request({
    url: `${api.rolePermission}${roleId}`,
    method: 'get',
  })
}

export function roleUpdate(parameter) {
  return request({
    url: api.roleUpdate,
    method: 'put',
    data: parameter,
  })
}

export function dictTypeList(parameter) {
  return request({
    url: api.dictTypeList,
    method: 'get',
    params: parameter,
  })
}

export function dictTypeAdd(parameter) {
  return request({
    url: api.dictTypeAdd,
    method: 'post',
    data: parameter,
  })
}

export function dictTypeUpdate(parameter) {
  return request({
    url: api.dictTypeUpdate,
    method: 'put',
    data: parameter,
  })
}

export function dictList(dictType) {
  return request({
    url: api.dictList+dictType,
    method: 'get',
  })
}

export function dictAdd(parameter) {
  return request({
    url: api.dictAdd,
    method: 'post',
    data: parameter,
  })
}

export function dictUpdate(parameter) {
  return request({
    url: api.dictUpdate,
    method: 'put',
    data: parameter,
  })
}

export function dictTypeDeleteBatch(parameter) {
  return request({
    url: api.dictTypeDeleteBatch,
    method: 'delete',
    data: parameter
  })
}

export function dictDeleteBatch(id) {
  return request({
    url: api.dictDeleteBatch+id,
    method: 'delete',
  })
}

export function userResetPwd(userId) {
  return request({
    url: `${api.userResetPwd}${userId}`,
    method: 'post',
  })
}

// 操作日志详情
export function operLogGetById(operId) {
  return request({
    url: api.operLogGetById + operId,
    method: 'get',
  })
}

export function commonProvince(params) {
  return request({
    url: api.commonProvince,
    method: 'get',
    params
  })
}

export function commonCity(params) {
  return request({
    url: api.commonCity,
    method: 'get',
    params
  })
}

export function commonCounty(params) {
  return request({
    url: api.commonCounty,
    method: 'get',
    params
  })
}