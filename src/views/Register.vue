<template>
  <div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="logo">
            <i class="el-icon-notebook-2"></i>
            <span>图书租赁系统</span>
          </div>
          <div class="login-title">用户注册</div>
        </div>
        <el-form :model="data.form" ref="formRef" :rules="rules">
          <el-form-item prop="username">
            <el-input prefix-icon="User" type="text" v-model="data.form.uname" placeholder="请输入账号"/>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="Lock" show-password v-model="data.form.upass" placeholder="请输入密码"/>
          </el-form-item>
          <el-form-item prop="name">
            <el-input prefix-icon="User" v-model="data.form.nickname" placeholder="请输入昵称"/>
          </el-form-item>
          <el-form-item prop="phone">
            <el-input prefix-icon="Phone" v-model="data.form.phone" placeholder="请输入手机号"/>
          </el-form-item>
          <el-button type="primary" style="width: 100%;" @click="register">注 册</el-button>
        </el-form>
        <div style="margin-top: 30px;text-align: right;">已有账号? 请 <a href="/login">登录</a></div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import router from "@/router";

const data = reactive({
  form: {role: 'ADMIN'}
})

const rules = reactive({
  uname: [
    {required: true, message: '请输入账号', trigger: 'blur'}
  ],
  upass: [
    {required: true, message: '请输入密码', trigger: 'blur'}
  ]
})

const formRef = ref()

const register = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/member/register', data.form).then(res => {
        console.log(JSON.stringify(res));
        if (res.code === '200') {
          ElMessage.success('注册成功，现在去登录！');
          //location.href = '/home'
          router.push('/login')// 跳转到主页
        } else {
          ElMessage.error(res.msg);
        }
      })
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("@/assets/imgs/1111.png") no-repeat center center fixed;
  background-size: cover;
  position: relative;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 0;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: #4a69bd;
  margin-bottom: 15px;
}

.logo i {
  margin-right: 10px;
  font-size: 32px;
}

.login-title {
  font-size: 18px;
  color: #666;
  font-weight: normal;
}

:deep(.el-input__inner) {
  border-radius: 6px;
  height: 44px;
}

:deep(.el-button--primary) {
  background: linear-gradient(to right, #6a89cc, #4a69bd);
  border: none;
  border-radius: 6px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(to right, #5a79bc, #3a59ad);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(106, 137, 204, 0.3);
}

:deep(.el-select .el-input__inner) {
  height: 44px;
}

a {
  color: #4a69bd;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #3a59ad;
  text-decoration: underline;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  color: #6a89cc;
}
</style>