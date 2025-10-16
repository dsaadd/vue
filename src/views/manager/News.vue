<template>
  <div class="book-management-container">
    <!-- 搜索区域 -->
    <div class="search-card card">
      <div class="search-header">
        <h2>图书管理系统</h2>
        <p>管理您的图书信息</p>
      </div>
      <div class="search-form">
        <div class="search-input-group">
          <el-input
              v-model="data.title"
              :prefix-icon="Search"
              placeholder="请输入图书名称"
              class="search-input"
              clearable>
          </el-input>
          <el-button type="primary" @click="load" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="reset" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="data-card card">
      <div class="table-header">
        <div class="table-title">
          <h3>公告</h3>
          <span class="total-count">共 {{data.total}} 条记录</span>
        </div>
        <div v-if="user.role==='ADMIN'" class="table-actions">
          <el-button type="primary" @click="handlerAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新增图书
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table
            :data="data.tableData"
            stripe
            v-loading="data.loading"
            class="data-table"
            :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
          <el-table-column label="序号" prop="id" width="70" align="center"></el-table-column>
          <el-table-column label="封面" width="80" align="center">
            <template #default="scope">
              <div class="cover-container">
                <el-image
                    v-if="scope.row.cover"
                    :src="scope.row.cover"
                    :preview-src-list="[scope.row.cover]"
                    class="book-cover">
                  <template #error>
                    <div class="cover-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="no-cover">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标题" prop="title" min-width="150"></el-table-column>
          <el-table-column label="简介" prop="description" min-width="200" show-overflow-tooltip></el-table-column>
          <el-table-column label="内容" width="120" align="center">
            <template #default="scope">
              <el-button
                  type="primary"
                  link
                  @click="view(scope.row.content,scope.row.id)"
                  class="content-view-btn">
                <el-icon><View /></el-icon>
                查看内容
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="浏览次数" prop="count" width="100" align="center">
            <template #default="scope">
              <span class="count-badge">{{scope.row.count}}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="160" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="160" v-if="user.role==='ADMIN'">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                    type="primary"
                    size="small"
                    @click="handleEdit(scope.row)"
                    class="edit-btn">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDel(scope.row.id)"
                    class="delete-btn">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            background
            layout="prev, pager, next, jumper, total"
            @current-change="handelCurrentChange"
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :total="data.total"
            :page-sizes="[8, 16, 24, 32]"
            class="custom-pagination"/>
      </div>
    </div>

    <!-- 图书信息编辑/新增对话框 -->
    <el-dialog
        :title="data.form.id ? '编辑图书信息' : '新增图书信息'"
        v-model="data.formVisible"
        width="600px"
        class="book-form-dialog"
        destroy-on-close>
      <el-form
          :model="data.form"
          ref="formRef"
          :rules="rules"
          label-width="100px"
          label-position="right">
        <el-form-item label="图书标题" prop="title">
          <el-input v-model="data.form.title" placeholder="请输入图书标题" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书简介" prop="description">
          <el-input
              v-model="data.form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入图书简介"
              autocomplete="off"
              maxlength="200"
              show-word-limit/>
        </el-form-item>
        <el-form-item label="图书内容">
          <el-input
              v-model="data.form.content"
              type="textarea"
              :rows="6"
              placeholder="请输入图书内容"
              autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书封面">
          <div class="upload-container">
            <el-upload
                action="http://localhost:9090/files/upload"
                list-type="picture-card"
                :on-success="handleImgUploadSuccess"
                :before-upload="beforeUpload"
                :on-remove="handleRemove"
                :file-list="fileList"
                :limit="1">
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
          </div>
        </el-form-item>
        <el-form-item label="浏览次数">
          <el-input v-model="data.form.count" disabled autocomplete="off"/>
        </el-form-item>
      </el-form>
      <template #footer>
                <span class="dialog-footer">
                    <el-button @click="data.formVisible = false">取 消</el-button>
                    <el-button type="primary" @click="save" class="save-btn">保 存</el-button>
                </span>
      </template>
    </el-dialog>

    <!-- 图书内容详情对话框 -->
    <el-dialog
        v-model="data.contentVisible"
        title="图书内容详情"
        width="70%"
        class="content-dialog"
        destroy-on-close>
      <div class="content-container">
        <div class="content-text">{{data.content}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { Search, Plus, Refresh, Edit, Delete, View, Picture } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import { ElMessage, ElMessageBox } from "element-plus";

// 响应式数据
const data = reactive({
  title: '',
  tableData: [],
  pageNum: 1,
  pageSize: 8,
  total: 0,
  formVisible: false,
  contentVisible: false,
  content: '',
  form: {},
  loading: false
});

const user = JSON.parse(localStorage.getItem('login-user') || '{}');
const formRef = ref();

// 计算属性 - 用于上传组件
const fileList = computed(() => {
  return data.form.cover ? [{name: 'cover', url: data.form.cover}] : [];
});

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: '请输入图书标题', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入图书描述', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ]
});

// 查看图书内容
const view = (content, id) => {
  data.loading = true;
  request.request({
    url: '/news/updateCount',
    method: 'PUT',
    data: { id }
  }).then(res => {
    if (res.code === '200') {
      data.content = content;
      data.contentVisible = true;
      load();
    } else {
      ElMessage.error(res.msg);
    }
  }).finally(() => {
    data.loading = false;
  });
};

// 加载数据
const load = () => {
  data.loading = true;
  request.get("/news/selectPage", {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      title: data.title,
    }
  }).then(res => {
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
  }).finally(() => {
    data.loading = false;
  });
};

// 翻页
const handelCurrentChange = (pageNum) => {
  data.pageNum = pageNum;
  load();
};

// 重置搜索条件
const reset = () => {
  data.title = '';
  data.pageNum = 1;
  load();
};

// 初始化加载
load();

// 新增图书
const handlerAdd = () => {
  data.form = {
    title: '',
    description: '',
    content: '',
    cover: '',
    count: 0
  };
  data.formVisible = true;
};

// 保存图书信息
const save = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.request({
        url: data.form.id ? '/news/update' : '/news/add',
        method: data.form.id ? 'PUT' : 'POST',
        data: data.form
      }).then(res => {
        if (res.code === '200') {
          load();
          data.formVisible = false;
          ElMessage.success("操作成功");
        } else {
          ElMessage.error(res.msg);
        }
      });
    }
  });
};

// 编辑图书
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
};

// 删除图书
const handleDel = (id) => {
  ElMessageBox.confirm('确定要删除这条图书信息吗？', '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    request.delete('/news/delete/' + id).then(res => {
      if (res.code === '200') {
        load();
        ElMessage.success("删除成功");
      } else {
        ElMessage.error(res.msg);
      }
    });
  }).catch(() => {
    // 用户取消操作
  });
};

// 图片上传成功处理
const handleImgUploadSuccess = (res) => {
  data.form.cover = res.data;
  ElMessage.success("图片上传成功");
};

// 图片上传前验证
const beforeUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGOrPNG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 移除已上传的图片
const handleRemove = () => {
  data.form.cover = '';
};
</script>

<style scoped>
.book-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.search-card {
  padding: 20px;
  margin-bottom: 20px;
}

.search-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.search-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.search-form {
  margin-top: 20px;
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.search-btn, .reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.data-card {
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.total-count {
  color: #909399;
  font-size: 14px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-container {
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
}

.cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.book-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.no-cover, .cover-error {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #c0c4cc;
}

.content-view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.count-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.edit-btn, .delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.custom-pagination {
  justify-content: center;
}

.book-form-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.upload-container {
  width: 100%;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.content-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.content-container {
  max-height: 60vh;
  overflow-y: auto;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #606266;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
