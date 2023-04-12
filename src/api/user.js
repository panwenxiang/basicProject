import request from '../utlis/request'

const api = {
  Login: '/login',
  Logout: '/profile/logout',
  UserInfo: '/profile/getCurrentUser',
  userMenuList: '/menu/list',
  dualFactorCode: '/qrCode',
  mfaCheckLoginUrl: '/mfaCheck',
  EditPwd: '/profile/resetPwd',
  profileAvatar: '/profile/avatar', // 头像上传
  profileVerifyEmailCode: '/profile/verify/email/code', // 发送邮箱验证吗
  profileVerifyEmail: '/profile/verify/email',
  userBatchDelete: '/user/delete',
  getToken: '/getToken',
  userGetCpUserList: '/user/getCpUserList',
  getOauth2Url: '/getOauth2Url',
  userEmailList: '/kms/userEmail/getKmsUserEmailOwn',
  userEmailDelete: '/kms/userEmail/delete'
}

export function Logout () {
  return request({
    url: api.Logout,
    method: 'get',
  })
}

export function login (params) {
  return request({
    url: api.Login,
    method: 'post',
    data: params
  })
}

export function EditPwd (params) {
  return request({
    url: api.EditPwd,
    method: 'post',
    data: params
  })
}

export function getUserInfo () {
  return request({
    url: api.UserInfo,
    method: 'get'
  })
}

export function getUserMenuList () {
  return request({
    url: api.userMenuList,
    method: 'get'
  })
}

export function userEmailList () {
  return request({
    url: api.userEmailList,
    method: 'get'
  })
}

export function userEmailDelete (params) {
  return request({
    url: api.userEmailDelete,
    method: 'delete',
    params
  })
}

export function getOauth2Url() {}

export function getToken() {}