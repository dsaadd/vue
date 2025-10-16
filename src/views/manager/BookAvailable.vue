<template>
  <div class="book-rental-container">
    <div class="search-card card">
      <div class="search-header">
        <h3>图书借阅</h3>
        <p>浏览并借阅您感兴趣的图书</p>
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
          <el-table-column label="书名" prop="name" min-width="180">
            <template #default="scope">
              <div class="book-title">{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <!-- 新增图书详情按钮列 -->
          <el-table-column label="详情" width="100" align="center">
            <template #default="scope">
              <el-button
                  type="info"
                  size="small"
                  class="detail-btn"
                  @click="handleDetail(scope.row)"
              >
                <i class="el-icon-document"></i>
                详情
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="作者" prop="author" width="120"></el-table-column>
          <el-table-column label="价格" prop="price" width="100" align="center">
            <template #default="scope">
              <span class="price">¥{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="100" align="center">
            <template #default="scope">
              <el-tag
                  :type="scope.row.stock > 5 ? 'success' : scope.row.stock > 0 ? 'warning' : 'danger'"
                  class="stock-tag"
              >
                {{ scope.row.stock }}本
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="140">
            <template #default="scope">
              <el-button
                  v-if="scope.row.stock > 0"
                  type="primary"
                  size="small"
                  class="borrow-btn"
                  @click="handleDel(scope.row.id)"
              >
                <i class="el-icon-reading"></i>
                借阅
              </el-button>
              <el-button
                  v-else
                  type="danger"
                  size="small"
                  disabled
                  class="sold-out-btn"
              >
                <i class="el-icon-warning"></i>
                已售罄
              </el-button>
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

    <!-- 图书详情对话框 -->
    <el-dialog
        v-model="data.detailDialogVisible"
        :title="data.selectedBook ? data.selectedBook.name : '图书详情'"
        width="600px"
        class="book-detail-dialog"
    >
      <div v-if="data.selectedBook" class="book-detail-content">
        <div class="detail-row">
          <div class="detail-cover">
            <el-image
                v-if="data.selectedBook.photos"
                :src="data.selectedBook.photos"
                fit="cover"
                class="detail-image"
            >
              <template #error>
                <div class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
          </div>
          <div class="detail-info">
            <div class="detail-item">
              <span class="label">书名：</span>
              <span class="value">{{ data.selectedBook.name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">作者：</span>
              <span class="value">{{ data.selectedBook.author }}</span>
            </div>
            <div class="detail-item">
              <span class="label">价格：</span>
              <span class="value price">¥{{ data.selectedBook.price }}</span>
            </div>
            <div class="detail-item">
              <span class="label">库存：</span>
              <el-tag
                  :type="data.selectedBook.stock > 5 ? 'success' : data.selectedBook.stock > 0 ? 'warning' : 'danger'"
                  class="stock-tag"
              >
                {{ data.selectedBook.stock }}本
              </el-tag>
            </div>
            <div class="detail-item" v-if="data.selectedBook && data.selectedBook.des">
              <span class="label">简介：</span>
              <span class="value">{{ data.selectedBook.des }}</span>
            </div>
            <div class="detail-item" v-else>
              <span class="label">简介：</span>
              <span class="value no-description">暂无图书简介</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="data.detailDialogVisible = false">关闭</el-button>
        <el-button
            type="primary"
            v-if="data.selectedBook && data.selectedBook.stock > 0"
            @click="handleDel(data.selectedBook.id)"
        >
          立即借阅
        </el-button>
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
  detailDialogVisible: false, // 详情对话框显示状态
  selectedBook: null // 选中的图书
})

const user = JSON.parse(localStorage.getItem('login-user') || '{}')

//请求数据
const load = () => {
  data.loading = true;
  //发送了一个Get请求，查询图书信息
  request.get("/book/selectPageAvailable", {
    params: {
      pageNum: data.pageNum, //当前页码
      pageSize: data.pageSize, //每页大小
      name: data.title, //查询条件
      stock: 1 //查询库存大于0的图书
    }
  }).then(res => {
    console.log("分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
    data.loading = false;
  }).catch(error => {
    console.error("加载图书数据失败:", error);
    ElMessage.error("加载图书数据失败，请检查网络或接口");
    data.loading = false;
  })
};

//翻页
const handelCurrentChange = (pageNum) => {
  data.pageNum = pageNum; // 更新页码
  load()
};

//重置
const reset = () => {
  data.title = '';
  load()
};

/**
 * 01-调用方法获取后台数据,视图打开自动调用该方法，加载图书信息
 */
load();

//借阅图书
const handleDel = (id) => {
  ElMessageBox.confirm('您确认借阅该图书吗？', '借阅确认', {type: 'warning'}).then(res => {
    request.request({
      url: '/book/updateStatus1',
      method: 'PUT',
      data: {
        "id": id,
        "member_id": user.id,
        "action": "borrow" // 借阅操作
      }
    }).then(res => {
      if (res.code === '200') {
        load()    // 重新获取数据
        data.detailDialogVisible = false; // 关闭详情对话框
        ElMessage.success("借阅成功")
      } else {
        ElMessage.error(res.msg || "借阅失败")
      }
    }).catch(error => {
      console.error("借阅请求失败:", error);
      ElMessage.error("借阅请求失败，请检查网络或接口");
    })
  }).catch(res => {})
}

// 查看图书详情
const handleDetail = (book) => {
  data.selectedBook = book;
  data.detailDialogVisible = true;
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
  color: #909399;
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

.borrow-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.borrow-btn:hover {
  background: linear-gradient(135deg, #27ae60, #219653);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.sold-out-btn {
  border-radius: 6px;
  opacity: 0.7;
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

  .detail-row {
    flex-direction: column;
  }

  .detail-cover {
    text-align: center;
    margin-bottom: 20px;
  }
}
</style>
