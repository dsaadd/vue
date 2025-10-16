<template>
  <div class="comment-management-container">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-wrapper">
        <el-input
            v-model="data.content"
            :prefix-icon="Search"
            class="search-input"
            placeholder="请输入评论关键字"
            clearable
            size="large"
        ></el-input>
        <div class="button-group">
          <el-button type="primary" @click="load" :icon="Search" size="large">查询</el-button>
          <el-button type="info" @click="reset" :icon="Refresh" size="large">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容卡片 -->
    <el-card class="content-card" shadow="never">
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-left">
          <span class="table-title">评论管理</span>
          <span class="table-total">共 {{ data.total }} 条记录</span>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
            :data="data.tableData"
            stripe
            size="large"
            header-row-class-name="table-header"
            v-loading="data.loading"
            class="custom-table"
        >
          <el-table-column label="序号" width="80" align="center">
            <template #default="scope">
              <span class="serial-number">{{ scope.$index + 1 + (data.pageNum - 1) * data.pageSize }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评论人账号" prop="memberName" min-width="130" show-overflow-tooltip>
            <template #header>
              <div class="column-header">
                <el-icon><User /></el-icon>
                <span>评论人账号</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="评论内容" prop="content" min-width="200" show-overflow-tooltip>
            <template #header>
              <div class="column-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论内容</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="评论时间" prop="createTime" width="180" align="center">
            <template #header>
              <div class="column-header">
                <el-icon><Clock /></el-icon>
                <span>评论时间</span>
              </div>
            </template>
            <template #default="scope">
              <span class="time-text">{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评论回复" prop="reply" min-width="180" show-overflow-tooltip>
            <template #header>
              <div class="column-header">
                <el-icon><ChatLineRound /></el-icon>
                <span>评论回复</span>
              </div>
            </template>
            <template #default="scope">
              <span v-if="scope.row.reply" class="reply-content">{{ scope.row.reply }}</span>
              <span v-else class="no-reply">暂无回复</span>
            </template>
          </el-table-column>
          <el-table-column label="回复时间" prop="replyTime" width="180" align="center">
            <template #header>
              <div class="column-header">
                <el-icon><Clock /></el-icon>
                <span>回复时间</span>
              </div>
            </template>
            <template #default="scope">
              <span v-if="scope.row.replyTime" class="time-text">{{ scope.row.replyTime }}</span>
              <span v-else class="no-reply">-</span>
            </template>
          </el-table-column>
          <el-table-column label="回复人" prop="replyName" width="120" show-overflow-tooltip>
            <template #header>
              <div class="column-header">
                <el-icon><UserFilled /></el-icon>
                <span>回复人</span>
              </div>
            </template>
            <template #default="scope">
              <span v-if="scope.row.replyName" class="reply-name">{{ scope.row.replyName }}</span>
              <span v-else class="no-reply">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template #default="scope">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleReply(scope.row)" :icon="EditPen">回复</el-button>
                <el-button type="danger" size="small" @click="handleDel(scope.row.id)" :icon="Delete">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handelCurrentChange"
            @size-change="handleSizeChange"
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :total="data.total"
            :page-sizes="[8, 16, 32, 64]"
            class="custom-pagination"
        />
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog
        width="500px"
        v-model="data.formVisible"
        title="评论回复"
        destroy-on-close
        class="reply-dialog"
    >
      <div class="dialog-header">
        <el-icon class="dialog-icon"><EditPen /></el-icon>
        <span>回复评论</span>
      </div>
      <el-form :model="data.form" ref="formRef" label-width="100px" class="reply-form">
        <el-form-item label="评论人账号">
          <el-input v-model="data.form.memberName" autocomplete="off" disabled class="disabled-input"/>
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="data.form.content" type="textarea" :rows="3" autocomplete="off" disabled class="disabled-input"/>
        </el-form-item>
        <el-form-item label="评论时间">
          <el-input v-model="data.form.createTime" autocomplete="off" disabled class="disabled-input"/>
        </el-form-item>
        <el-form-item label="评论回复" prop="reply">
          <el-input
              v-model="data.form.reply"
              type="textarea"
              :rows="4"
              autocomplete="off"
              placeholder="请输入回复内容..."
              class="reply-textarea"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="data.formVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="save" size="large" class="submit-btn">回复</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {Search, Refresh, EditPen, Delete, User, ChatDotRound, Clock, ChatLineRound, UserFilled} from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";

//当前登录人的用户对象
const user = JSON.parse(localStorage.getItem('login-user') || '{}');

//初始值
const data = reactive({
  content: '',  //初始搜索条件是''
  tableData: [],
  pageNum: 1, //当前页码
  pageSize: 8, //每页个数
  total: 0,
  formVisible: false,
  loading: false
});

//点击编辑
const handleReply = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
}

//请求数据
const load = () => {
  data.loading = true;
  //发送了一个Get请求，查询房源信息
  request.get("/leavemsg/selectPage", {
    params: {
      pageNum: data.pageNum, //当前页码
      pageSize: data.pageSize, //每页大小
      content: data.content, //查询条件
    }
  }).then(res => {
    console.log("分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
  }).finally(() => {
    data.loading = false;
  })
};

// 保存数据到后台
const save = () => {
  request.request({
    url: '/leavemsg/reply/'+user.id,
    method: 'POST',
    data: data.form
  }).then(res => {
    if (res.code === '200') {
      load()    // 重新获取数据
      data.formVisible = false; // 关闭弹窗
      ElMessage.success("操作成功")
    } else {
      ElMessage.error(res.msg)
    }
  })
};

//删除
const handleDel = (id) => {
  ElMessageBox.confirm('您确认删除该留言数据吗？', '删除确认', {type: 'warning'}).then(res => {
    request.delete('/leavemsg/delete/' + id).then(res => {
      if (res.code === '200') {
        load();   // 重新获取数据
        ElMessage.success("操作成功");
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(res => {
  })
};

//翻页
const handelCurrentChange = (pageNum) => {
  data.pageNum = pageNum;
  load()
};

//每页大小变化
const handleSizeChange = (pageSize) => {
  data.pageSize = pageSize;
  data.pageNum = 1;
  load()
};

//重置
const reset = () => {
  data.content = '';
  load()
};

/**
 * 01-调用方法获取后台数据,视图打开自动调用该方法，加载房源信息
 */
load();

</script>

<style scoped>
.comment-management-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 84px);
}

.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  background: white;
}

:deep(.search-card .el-card__body) {
  padding: 24px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

:deep(.search-input .el-input__inner) {
  border-radius: 8px;
  height: 44px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 12px;
}

:deep(.button-group .el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 24px;
}

.content-card {
  border-radius: 12px;
  border: none;
  background: white;
}

:deep(.content-card .el-card__body) {
  padding: 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.table-total {
  font-size: 14px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 16px;
}

.table-container {
  padding: 0 24px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.table-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
}

:deep(.table-header th) {
  background: transparent !important;
  color: #475569;
  font-weight: 700;
  font-size: 14px;
  padding: 16px 12px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

:deep(.custom-table .el-table__row) {
  transition: all 0.3s ease;
}

:deep(.custom-table .el-table__row:hover td) {
  background-color: #f8fafc !important;
}

:deep(.custom-table td) {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.serial-number {
  color: #64748b;
  font-weight: 600;
}

.time-text {
  color: #64748b;
  font-size: 13px;
}

.reply-content {
  color: #475569;
  line-height: 1.5;
}

.no-reply {
  color: #94a3b8;
  font-style: italic;
}

.reply-name {
  color: #667eea;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.action-buttons .el-button) {
  border-radius: 6px;
  font-weight: 500;
}

.pagination-wrapper {
  padding: 24px;
  border-top: 1px solid #f1f5f9;
}

.custom-pagination {
  justify-content: center;
}

:deep(.custom-pagination .el-pagination__total) {
  color: #64748b;
  font-weight: 500;
}

:deep(.custom-pagination .btn-prev),
:deep(.custom-pagination .btn-next) {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

:deep(.custom-pagination .el-pager li) {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin: 0 4px;
}

:deep(.custom-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

/* 对话框样式 */
:deep(.reply-dialog .el-dialog__header) {
  padding: 0;
  margin-right: 0;
}

:deep(.reply-dialog .el-dialog__body) {
  padding: 20px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.dialog-icon {
  color: #667eea;
  font-size: 20px;
}

.reply-form {
  padding-right: 20px;
}

:deep(.reply-form .el-form-item__label) {
  font-weight: 600;
  color: #475569;
}

.disabled-input {
  opacity: 0.7;
}

:deep(.disabled-input .el-input__inner) {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

.reply-textarea {
  border-radius: 8px;
}

:deep(.reply-textarea .el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
}

:deep(.reply-textarea .el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
}

:deep(.dialog-footer .el-button) {
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 500;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-management-container {
    padding: 16px;
  }

  .search-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .button-group {
    justify-content: stretch;
  }

  .button-group .el-button {
    flex: 1;
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-left {
    justify-content: space-between;
  }

  .table-container {
    padding: 0 16px;
  }

  :deep(.custom-table) {
    font-size: 13px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  :deep(.action-buttons .el-button) {
    width: 100%;
  }
}
</style>
