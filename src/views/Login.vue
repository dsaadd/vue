<!--<template>-->
<!--  <div>-->
<!--    <div class="login-container">-->
<!--      <div style="width: 350px" class="login-box">-->
<!--        <div style="font-weight: bold; font-size: 24px; text-align: center;margin-bottom: 30px;">智能房屋租赁平台-->
<!--        </div>-->
<!--        <el-form :model="data.form" ref="formRef" :rules="rules">-->
<!--          <el-form-item prop="username">-->
<!--            <el-input prefix-icon="User" type="text" v-model="data.form.username" placeholder="请输入登录账号"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item prop="password">-->
<!--            <el-input prefix-icon="Lock" show-password v-model="data.form.password" placeholder="请输入登录密码"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item prop="usercode">-->
<!--            <el-input prefix-icon="Lock" v-model="data.form.usercode" type="text" placeholder="输入验证码" style="width: 170px"/>-->
<!--            <img :src="data.url" alt="" style="height: 25px;margin-left: 10px;cursor: pointer;"-->
<!--                 @click="changeVerify"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item prop="role">-->
<!--            <el-select style="width: 100%" v-model="data.form.role">-->
<!--              <el-option value="ADMIN" label="管理员"></el-option>-->
<!--              <el-option value="TENANT" label="会员"></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-button type="primary" style="width: 100%;" @click="login">登 录</el-button>-->
<!--          <div style="margin-top: 30px;text-align: right;">还没有账号? 请 <a href="/register">会员注册</a></div>-->
<!--        </el-form>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->

<!--import {reactive, ref} from "vue";-->
<!--import request from "@/utils/request.js";  //发送异步请求库-->
<!--import {ElMessage} from "element-plus";   // 弹出提示框架库-->
<!--import router from "@/router";         //路由配置-->

<!--const data = reactive({-->
<!--  form: {role: 'ADMIN'},  //默认管理员-->
<!--  url: import.meta.env.VITE_BASE_URL + '/createVerify'-->
<!--})-->

<!--//表单验证规则-->
<!--const rules = reactive({-->
<!--  username: [-->
<!--    {required: true, message: '请输入登录账号', trigger: 'blur'}-->
<!--  ],-->
<!--  password: [-->
<!--    {required: true, message: '请输入密码', trigger: 'blur'}-->
<!--  ],-->
<!--  usercode: [{required: true, message: '请输入验证码', trigger: 'blur'}]-->
<!--})-->

<!--//提交登录请求验证表单-->
<!--const formRef = ref();-->

<!--//提交登录请求-->
<!--const login = () => {-->
<!--  //异步请求，发送Ajax-->
<!--  formRef.value.validate((valid) => {-->
<!--    if (valid) {-->
<!--      //校验验证码是否正确-->
<!--      request.post('/checkVerify?verify=' + data.form.usercode).then(result => {-->
<!--        console.log(JSON.stringify(result));-->
<!--        if (result) {-->
<!--          //验证码校验成功-->
<!--          if (data.form.role == 'TENANT') {-->
<!--            //如果输入正确，发送post请求-->
<!--            request.post('/member/login', {-->
<!--              "uname": data.form.username,-->
<!--              "upass": data.form.password-->
<!--            }).then(res => {-->
<!--              console.log(JSON.stringify(res));-->
<!--              if (res.code === '200') {-->
<!--                //向浏览器缓存中存储登录信息-->
<!--                localStorage.setItem('login-user', JSON.stringify(res.data));-->
<!--                //弹出一个提示框-->
<!--                ElMessage.success('会员登录成功!');-->
<!--                //路由到主页-->
<!--                router.push('/home');-->
<!--              } else {-->
<!--                //登录失败弹出错误消息！-->
<!--                ElMessage.error(res.msg);-->
<!--              }-->
<!--            });-->
<!--          } else {-->
<!--            //如果输入正确，发送post请求-->
<!--            request.post('/admins/login', data.form).then(res => {-->
<!--              console.log(JSON.stringify(res));-->
<!--              if (res.code === '200') {-->
<!--                //向浏览器缓存中存储登录信息-->
<!--                localStorage.setItem('login-user', JSON.stringify(res.data));-->
<!--                //弹出一个提示框-->
<!--                ElMessage.success('管理员登录成功!');-->
<!--                //路由到主页-->
<!--                router.push('/home');-->
<!--              } else {-->
<!--                //登录失败弹出错误消息！-->
<!--                ElMessage.error(res.msg);-->
<!--              }-->
<!--            });-->
<!--          }-->
<!--        } else {-->
<!--          ElMessage.error("验证码输入错误");-->
<!--        }-->
<!--      })-->
<!--    }-->
<!--  })-->
<!--}-->

<!--//验证码切换-->
<!--const changeVerify = () => {-->
<!--  data.url = import.meta.env.VITE_BASE_URL + '/createVerify?' + Math.random()-->
<!--}-->

<!--</script>-->

<!--<style scoped>-->
<!--.login-container {-->
<!--  min-height: 100vh;-->
<!--  overflow: hidden;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  background-image: url("@/assets/imgs/1111.png");-->
<!--  background-size: cover;-->
<!--}-->

<!--.login-box {-->
<!--  background-color: #fff;-->
<!--  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);-->
<!--  border: 1px solid #ddd;-->
<!--  padding: 30px;-->
<!--  border-radius: 5px;-->
<!--  background-color: rgba(255, 255, 255, 0.8);-->
<!--}-->
<!--</style>-->


<template>
  <div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="logo">
            <i class="el-icon-notebook-2"></i>
            <span>图书租赁系统</span>
          </div>
          <div class="login-title">欢迎登录</div>
        </div>
        <el-form :model="data.form" ref="formRef" :rules="rules">
          <el-form-item prop="username">
            <el-input prefix-icon="User" type="text" v-model="data.form.username" placeholder="请输入登录账号"/>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="Lock" show-password v-model="data.form.password" placeholder="请输入登录密码"/>
          </el-form-item>
          <el-form-item prop="usercode">
            <el-input prefix-icon="Lock" v-model="data.form.usercode" type="text" placeholder="输入验证码" style="width: 170px"/>
            <img :src="data.url" alt="" style="height: 25px;margin-left: 10px;cursor: pointer;"
                 @click="changeVerify"/>
          </el-form-item>
          <el-form-item prop="role">
            <el-select style="width: 100%" v-model="data.form.role">
              <el-option value="ADMIN" label="管理员"></el-option>
              <el-option value="TENANT" label="用户"></el-option>
            </el-select>
          </el-form-item>
          <el-button type="primary" style="width: 100%;" @click="login">登 录</el-button>
          <div style="margin-top: 30px;text-align: right;">还没有账号? 请 <a href="/register">用户注册</a></div>
        </el-form>
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
  form: {role: 'ADMIN'},
  url: import.meta.env.VITE_BASE_URL + '/createVerify'
})

const rules = reactive({
  username: [
    {required: true, message: '请输入登录账号', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'}
  ],
  usercode: [{required: true, message: '请输入验证码', trigger: 'blur'}]
})

const formRef = ref();

const login = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/checkVerify?verify=' + data.form.usercode).then(result => {
        console.log(JSON.stringify(result));
        if (result) {
          if (data.form.role == 'TENANT') {
            request.post('/member/login', {
              "uname": data.form.username,
              "upass": data.form.password
            }).then(res => {
              console.log(JSON.stringify(res));
              if (res.code === '200') {
                localStorage.setItem('login-user', JSON.stringify(res.data));
                ElMessage.success('用户登录成功!');
                router.push('/home');
              } else {
                ElMessage.error(res.msg);
              }
            });
          } else {
            request.post('/admins/login', data.form).then(res => {
              console.log(JSON.stringify(res));
              if (res.code === '200') {
                localStorage.setItem('login-user', JSON.stringify(res.data));
                ElMessage.success('管理员登录成功!');
                router.push('/home');
              } else {
                ElMessage.error(res.msg);
              }
            });
          }
        } else {
          ElMessage.error("验证码输入错误");
        }
      })
    }
  })
}

const changeVerify = () => {
  data.url = import.meta.env.VITE_BASE_URL + '/createVerify?' + Math.random()
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

/* 其他样式保持不变 */
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