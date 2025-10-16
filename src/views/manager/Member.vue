<template>
  <div class="user-management-container">
    <div class="search-card card">
      <div class="search-header">
        <h3>用户信息管理</h3>
        <p>管理系统注册用户信息</p>
      </div>
      <div class="search-form">
        <el-input
            v-model="data.nickname"
            :prefix-icon="Search"
            class="search-input"
            placeholder="请输入用户昵称"
            clearable
        ></el-input>
        <el-button type="primary" class="search-btn" @click="load">查询</el-button>
        <el-button type="info" @click="reset">重置</el-button>
      </div>
    </div>

    <div class="content-card card">
      <div class="table-header">
        <el-button type="primary" class="add-btn" @click="handlerAdd">
          <i class="el-icon-plus"></i>
          新增用户
        </el-button>
      </div>

      <div class="table-container">
        <el-table
            :data="data.tableData"
            class="user-table"
            :header-cell-style="{background: '#f8f9fa', color: '#495057', fontWeight: '600'}"
            v-loading="data.loading"
        >
          <el-table-column label="序号" prop="id" width="70" align="center"></el-table-column>
          <el-table-column label="用户头像" width="80" align="center">
            <template #default="scope">
              <div class="user-avatar">
                <el-image
                    v-if="scope.row.photos"
                    :src="scope.row.photos"
                    :preview-src-list="[scope.row.photos]"
                    fit="cover"
                >
                  <template #error>
                    <div class="avatar-slot">
                      <i class="el-icon-user"></i>
                    </div>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户账号" prop="uname" min-width="120"></el-table-column>
          <el-table-column label="用户昵称" prop="nickname" min-width="120"></el-table-column>
          <el-table-column label="用户手机号" prop="phone" width="130"></el-table-column>
          <el-table-column label="注册日期" prop="createtime" width="120" align="center">
            <template #default="scope">
              <span class="create-time">{{ formatDate(scope.row.createtime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template #default="scope">
              <el-button type="primary" size="small" class="edit-btn" @click="handleEdit(scope.row)">
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-button type="danger" size="small" class="delete-btn" @click="handleDel(scope.row.id)">
                <i class="el-icon-delete"></i>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="data.tableData.length === 0 && !data.loading" class="empty-state">
          <i class="el-icon-user"></i>
          <p>暂无用户数据</p>
        </div>
      </div>

      <div class="pagination-container" v-if="data.tableData.length > 0">
        <el-pagination
            background
            layout="prev, pager, next, total"
            @current-change="handelCurrentChange"
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :total="data.total"
        />
      </div>
    </div>

    <!-- 用户信息模态框 -->
    <el-dialog
        width="500px"
        v-model="data.formVisible"
        :title="data.form.id ? '编辑用户' : '新增用户'"
        class="user-form-dialog"
        destroy-on-close
    >
      <el-form :model="data.form" ref="formRef" :rules="rules" label-width="100px" label-position="right" style="padding-right: 20px">
        <el-form-item label="用户账号" prop="uname">
          <el-input v-model="data.form.uname" autocomplete="off" placeholder="请输入用户账号"/>
        </el-form-item>
        <el-form-item label="用户密码" prop="upass" v-if="!data.form.id">
          <el-input show-password v-model="data.form.upass" autocomplete="off" placeholder="请输入用户密码"/>
        </el-form-item>
        <el-form-item label="用户头像">
          <div class="upload-container">
            <el-upload
                action="http://localhost:9090/files/upload"
                list-type="picture-card"
                :on-success="handleImgUploadSuccess"
                :file-list="data.form.photos ? [{url: data.form.photos}] : []"
                :limit="1"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <div class="upload-tip">点击上传用户头像</div>
          </div>
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="data.form.nickname" autocomplete="off" placeholder="请输入用户昵称"/>
        </el-form-item>
        <el-form-item label="用户手机号">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入用户手机号"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" class="save-btn" @click="save">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";

//初始值
const data = reactive({
  nickname: '',  //初始搜索条件是''
  tableData: [],
  pageNum: 1, //当前页码
  pageSize: 8, //每页个数
  total: 0,
  formVisible: false, //新增框不显示
  loading: false,
  form: {}
})

const formRef = ref()

const rules = reactive({
  uname: [
    {required: true, message: '会员账号不能为空', trigger: 'blur'}
  ],
  upass: [
    {required: true, message: '会员密码不能为空', trigger: 'blur'}
  ]
})

//请求数据
const load = () => {
  data.loading = true;
  //发送了一个Get请求，查询用户信息
  request.get("/member/selectPage", {
    params: {
      pageNum: data.pageNum, //当前页码
      pageSize: data.pageSize, //每页大小
      nickname: data.nickname, //查询条件
    }
  }).then(res => {
    console.log("分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
    data.loading = false;
  }).catch(error => {
    console.error("加载用户数据失败:", error);
    ElMessage.error("加载用户数据失败，请检查网络或接口");
    data.loading = false;
  })
};

//翻页
const handelCurrentChange = (pageNum) => {
  data.pageNum = pageNum;
  load()
};

//重置
const reset = () => {
  data.nickname = '';
  data.pageNum = 1;
  load()
};

//格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * 01-调用方法获取后台数据,视图打开自动调用该方法，加载用户信息
 */
load();

//点击新增
const handlerAdd = () => {
  data.form = {};
  data.formVisible = true; //打开对话框
};

// 保存数据到后台
const save = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.request({
        url: data.form.id ? '/member/update' : '/member/add',
        method: data.form.id ? 'PUT' : 'POST',
        data: data.form
      }).then(res => {
        if (res.code === '200') {
          load()    // 重新获取数据
          data.formVisible = false  // 关闭弹窗
          ElMessage.success("操作成功")
        } else {
          ElMessage.error(res.msg)
        }
      }).catch(error => {
        console.error("保存用户信息失败:", error);
        ElMessage.error("保存用户信息失败，请检查网络或接口");
      })
    }
  })
}

//点击编辑
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
}

//删除
const handleDel = (id) => {
  ElMessageBox.confirm('您确认删除该用户吗？', '删除确认', {type: 'warning'}).then(res => {
    request.delete('/member/delete/' + id).then(res => {
      if (res.code === '200') {
        load()    // 重新获取数据
        ElMessage.success("删除成功")
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(error => {
      console.error("删除用户失败:", error);
      ElMessage.error("删除用户失败，请检查网络或接口");
    })
  }).catch(res => {
    // 用户取消删除
  })
}

//文件上传成功之后，回显图片地址
const handleImgUploadSuccess = (res) => {
  console.log(res.data);
  data.form.photos = res.data;
  ElMessage.success("头像上传成功");
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-card {
  padding: 24px;
}

.search-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.search-header {
  margin-bottom: 20px;
}

.search-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.search-header p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.search-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.search-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6390);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.content-card {
  padding: 0;
}

.table-header {
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.add-btn:hover {
  background: linear-gradient(135deg, #27ae60, #219653);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.table-container {
  padding: 20px;
}

.user-table {
  width: 100%;
}

.user-avatar {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.user-avatar .el-image {
  width: 100%;
  height: 100%;
}

.avatar-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.create-time {
  color: #7f8c8d;
  font-size: 13px;
}

.edit-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6390);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #bdc3c7;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

.pagination-container {
  padding: 20px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: center;
}

/* 用户表单对话框样式 */
.user-form-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #eaeaea;
  padding: 15px 20px;
}

.user-form-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.upload-container {
  text-align: center;
}

.upload-tip {
  margin-top: 8px;
  color: #7f8c8d;
  font-size: 12px;
}

.save-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.save-btn:hover {
  background: linear-gradient(135deg, #27ae60, #219653);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management-container {
    padding: 10px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
    margin-bottom: 10px;
  }

  .table-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
