<template>
  <div class="user-profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">个人信息设置</span>

        </div>
      </template>

      <div class="form-content">
        <el-form :model="data.form" ref="formRef" label-width="100px" class="profile-form">
          <!-- 头像上传区域 -->
          <div class="avatar-section">
            <el-form-item label="用户头像">
              <div class="avatar-upload-wrapper">
                <el-upload
                    class="avatar-uploader"
                    action="http://localhost:9090/files/upload"
                    :show-file-list="false"
                    :on-success="handleImgUploadSuccess"
                >
                  <div class="avatar-preview">
                    <img v-if="data.form.photos" :src="data.form.photos" class="avatar-image">
                    <div v-else class="avatar-placeholder">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                      <span class="upload-text">上传头像</span>
                    </div>
                  </div>
                </el-upload>
                <div class="avatar-tips">建议尺寸 120×120px，支持 jpg、png 格式</div>
              </div>
            </el-form-item>
          </div>

          <!-- 表单字段区域 -->
          <div class="form-fields">
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item label="用户账号" prop="uname">
                  <el-input
                      v-model="data.form.uname"
                      autocomplete="off"
                      disabled
                      placeholder="用户账号"
                      class="custom-input"
                  />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="用户密码" prop="upass">
                  <el-input
                      show-password
                      v-model="data.form.upass"
                      autocomplete="off"
                      placeholder="请输入密码"
                      class="custom-input"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item label="用户昵称">
                  <el-input
                      v-model="data.form.nickname"
                      autocomplete="off"
                      placeholder="请输入昵称"
                      class="custom-input"
                  />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="手机号">
                  <el-input
                      v-model="data.form.phone"
                      autocomplete="off"
                      placeholder="请输入手机号"
                      class="custom-input"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 保存按钮单独一行并右对齐 -->
            <el-row>
              <el-col :span="24">
                <el-form-item class="save-button-container">
                  <el-button type="primary" @click="update" :icon="Check" size="large">保存修改</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {reactive} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";
import {Plus} from "@element-plus/icons-vue"

const data = reactive({
  form: JSON.parse(localStorage.getItem('login-user') || "{}")
})

const handleImgUploadSuccess = (res) => {
  data.form.photos = res.data;
}

const update = () => {
  request.put('/member/update', data.form).then(res => {
    if (res.code === '200') {
      localStorage.removeItem('login-user');
      ElMessage.success("操作成功,请重新登录");
      router.push('/login');
    } else {
      ElMessage.error(res.msg)
    }
  })
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
