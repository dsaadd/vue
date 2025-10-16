<template>
  <div class="book-rental-container">
    <div class="search-card card">
      <div class="search-header">
        <h3>图书管理</h3>
        <p>管理图书馆内的所有图书信息</p>
      </div>
      <div class="search-form">
        <el-input
            v-model="data.title"
            :prefix-icon="Search"
            class="search-input"
            placeholder="请输入图书名称"
            clearable
        ></el-input>
        <el-button type="primary" class="search-btn" @click="load">查询</el-button>
        <el-button type="info" @click="reset">重置</el-button>
        <el-button type="primary" class="add-btn" @click="handlerAdd">新增</el-button>
      </div>
    </div>

    <div class="content-card card">
      <div class="table-container">
        <el-table
            :data="data.tableData"
            class="book-table"
            :header-cell-style="{background: '#f8f9fa', color: '#495057', fontWeight: '600'}"
            v-loading="data.loading"
        >
          <el-table-column label="序号" prop="id" width="70" align="center"></el-table-column>
          <el-table-column label="封面" width="90" align="center">
            <template #default="scope">
              <div class="book-cover">
                <el-image
                    v-if="scope.row.photos"
                    :src="scope.row.photos"
                    :preview-src-list="[scope.row.photos]"
                    fit="cover"
                >
                  <template #error>
                    <div class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="图书标题" prop="name" min-width="180">
            <template #default="scope">
              <div class="book-title">{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="作者" prop="author"></el-table-column>
          <el-table-column label="价格" prop="price">
            <template #default="scope">
              <span class="price">¥{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="80" align="center">
            <template #default="scope">
              <el-tag
                  :type="scope.row.stock > 5 ? 'success' : scope.row.stock > 0 ? 'warning' : 'danger'"
                  class="stock-tag"
              >
                {{ scope.row.stock }}本
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <el-button type="primary" size="small" class="edit-btn" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" class="delete-btn" @click="handleDel(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="data.tableData.length === 0 && !data.loading" class="empty-state">
          <i class="el-icon-search"></i>
          <p>没有找到相关图书</p>
          <el-button type="primary" @click="reset">查看全部图书</el-button>
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
            :page-sizes="[8, 16, 24]"
        />
      </div>
    </div>

    <el-dialog width="35%" v-model="data.formVisible" title="图书信息" destory-on-close class="book-form-dialog">
      <el-form :model="data.form" ref="formRef" :rules="rules" label-width="100px" label-position="right" style="padding-right: 40px">
        <el-form-item label="图书标题" prop="name">
          <el-input v-model="data.form.name" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书作者" prop="author">
          <el-input v-model="data.form.author" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书图片">
          <div class="upload-container">
            <el-upload action="http://localhost:9090/files/upload" list-type="picture" :on-success="handleImgUploadSuccess">
              <el-button type="primary">上传图片</el-button>
            </el-upload>
            <div class="upload-tip">支持JPG、PNG等常见图片格式</div>
          </div>
        </el-form-item>
        <el-form-item label="图书价格" prop="price">
          <el-input v-model.number="data.form.price" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书库存" prop="stock">
          <el-input v-model.number="data.form.stock" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="图书简介" prop="des">
          <el-input v-model="data.form.des" type="textarea" :rows="4" placeholder="请输入图书简介" autocomplete="off"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">取 消</el-button>
          <el-button type="primary" class="save-btn" @click="save">保 存</el-button>
        </span>
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
  title: '',  //初始搜索条件是''
  tableData: [],
  pageNum: 1, //当前页码
  pageSize: 8, //每页个数
  total: 0,
  formVisible: false, //新增框不显示
  loading: false,
  form: {} // 表单数据
})


const formRef = ref()

// 图书验证规则
const rules = reactive({
  name: [
    {required: true, message: '请输入图书标题', trigger: 'blur'}
  ],
  author: [
    {required: true, message: '请输入图书作者', trigger: 'blur'}
  ],
  price: [
    {required: true, message: '请输入图书价格', trigger: 'blur'},
    {type: 'number', message: '价格必须是数字', trigger: 'blur'}
  ],
  stock: [
    {required: true, message: '请输入图书库存', trigger: 'blur'},
    {type: 'number', message: '库存必须是数字', trigger: 'blur'}
  ],
  // 新增图书简介规则，设为可选
  des: [
    {message: '请输入图书简介', trigger: 'blur'}
  ]
})

// 加载图书数据
const load = () => {
  data.loading = true;
  //发送了一个Get请求，查询图书信息
  request.get("/book/selectPage", {
    params: {
      pageNum: data.pageNum, //当前页码
      pageSize: data.pageSize, //每页大小
      name: data.title, //查询条件
    }
  }).then(res => {
    console.log("图书分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
  }).catch(err => {
    console.error('加载失败:', err)
    ElMessage.error("加载失败，请检查网络或后端服务")
  }).finally(() => {
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
  data.title = '';
  data.pageNum = 1;
  load()
};

// 初始加载数据
load();

//点击新增
const handlerAdd = () => {
  data.form = {};
  data.formVisible = true; //打开对话框
};

// 保存图书数据到后台
const save = () => {
  // 先进行表单验证
  formRef.value.validate((valid) => {
    if (valid) {
      request.request({
        url: data.form.id ? '/book/update' : '/book/add',
        method: data.form.id ? 'PUT' : 'POST',
        data: data.form
      }).then(res => {
        if (res.code === '200') {
          load()    // 重新获取数据
          data.formVisible = false  // 关闭弹窗
          ElMessage.success("操作成功")
        } else {
          ElMessage.error(res.msg || "操作失败")
        }
      }).catch(err => {
        console.error('保存失败:', err)
        ElMessage.error("保存失败，请检查网络或后端服务")
      })
    } else {
      return false;
    }
  });
}

//点击编辑
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
}

//删除
const handleDel = (id) => {
  ElMessageBox.confirm('您确认删除吗？', '删除确认', {type: 'warning'}).then(res => {
    request.delete('/book/delete/' + id).then(res => {
      if (res.code === '200') {
        load()    // 重新获取数据
        ElMessage.success("操作成功")
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      console.error('删除失败:', err)
      ElMessage.error("删除失败，请检查网络或后端服务")
    })
  }).catch(res => {
  })
}

//文件上传成功之后，回显图片地址
const handleImgUploadSuccess = (res) => {
  console.log(res.data);
  data.form.photos = res.data
}
</script>

<style scoped>
.book-rental-container {
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

.search-btn, .add-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.search-btn:hover, .add-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6390);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.content-card {
  padding: 0;
}

.table-container {
  padding: 20px;
}

.book-table {
  width: 100%;
}

.book-cover {
  width: 60px;
  height: 80px;
  margin: 0 auto;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.book-cover:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.book-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #bdc3c7;
  font-size: 24px;
}

.book-title {
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.4;
}

.price {
  font-weight: 600;
  color: #e74c3c;
  font-size: 15px;
}

.stock-tag {
  border-radius: 12px;
  padding: 4px 10px;
  font-weight: 500;
  min-width: 60px;
}

.edit-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
  margin-right: 8px;
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

/* 图书表单对话框样式 */
.book-form-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #eaeaea;
  padding: 15px 20px;
}

.book-form-dialog :deep(.el-dialog__body) {
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
  .book-rental-container {
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

  .book-cover {
    width: 50px;
    height: 65px;
  }
}
</style>
