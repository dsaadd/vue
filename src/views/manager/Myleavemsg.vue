<template>
  <div>
    <!-- 搜索区域 -->
    <div class="card" style="margin-bottom: 10px;">
      <el-input v-model="data.title" :prefix-icon="Search" style="width: 300px; margin-right: 10px"
                placeholder="请输入图书名称"></el-input>
      <el-button type="primary" style="margin-left: 10px;" @click="load">查询</el-button>
      <el-button type="info" @click="reset">重置</el-button>
    </div>

    <!-- 图书列表 -->
    <div class="card">
      <div style="margin-bottom: 10px;">
        <el-table :data="data.tableData">
          <el-table-column label="序号" prop="id" width="70" align="center"></el-table-column>
          <el-table-column label="图片" width="80" align="center">
            <template #default="scope">
              <el-image
                  v-if="scope.row.photos"
                  :src="scope.row.photos"
                  :preview-src-list="[scope.row.photos]"
                  style="width: 40px;height: 40px;border-radius: 4px;"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column label="作者" prop="author" width="120"></el-table-column>
          <el-table-column label="书名" prop="name" min-width="150"></el-table-column>
          <el-table-column label="评论内容" min-width="200">
            <template #default="scope">
              <div v-if="scope.row.comments && scope.row.comments.length > 0">
                <div v-for="(comment, index) in scope.row.comments.slice(0, 2)" :key="index"
                     class="comment-item">
                  <div class="comment-content">{{ comment.content }}</div>
                  <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
                </div>
                <el-button v-if="scope.row.comments.length > 2" type="text"
                           @click="showAllComments(scope.row)">
                  查看全部({{ scope.row.comments.length }})
                </el-button>
              </div>
              <span v-else class="no-comment">暂无评论</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template #default="scope">
              <el-button
                  type="primary"
                  size="small"
                  @click="handleComment(scope.row)">
                评论
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="card">
        <el-pagination
            background
            layout="prev, pager, next"
            @current-change="handelCurrentChange"
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :total="data.total"
        />
      </div>
    </div>

    <!-- 评论对话框 -->
    <el-dialog
        width="500px"
        v-model="data.formVisible"
        :title="'评论《' + (data.currentBook?.name || '') + '》'"
        destroy-on-close
        center
    >
      <el-form :model="data.form" label-width="80px">
        <el-form-item label="评论内容">
          <el-input
              v-model="data.form.content"
              type="textarea"
              :rows="5"
              placeholder="请输入您的评论内容..."
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">取消</el-button>
          <el-button type="primary" @click="saveComment">发表评论</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 全部评论对话框 -->
    <el-dialog
        width="600px"
        v-model="data.allCommentsVisible"
        :title="'《' + (data.selectedBook?.name || '') + '》的全部评论'"
        destroy-on-close
    >
      <div class="all-comments">
        <div v-for="(comment, index) in data.selectedBook?.comments" :key="index"
             class="comment-item full-width">
          <div class="comment-header">
            <span class="comment-user">{{ comment.memberName || '匿名用户' }}</span>
            <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <el-divider v-if="index < data.selectedBook.comments.length - 1" />
        </div>
        <div v-if="!data.selectedBook?.comments || data.selectedBook.comments.length === 0"
             class="no-comments">
          暂无评论
        </div>
      </div>
      <template #footer>
        <el-button @click="data.allCommentsVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import { ElMessage } from "element-plus";

// 响应式数据
const data = reactive({
  title: '',           // 搜索条件
  tableData: [],       // 表格数据
  pageNum: 1,          // 当前页码
  pageSize: 8,         // 每页个数
  total: 0,            // 总条数
  formVisible: false,  // 评论对话框显示状态
  allCommentsVisible: false, // 全部评论对话框显示状态
  form: {              // 评论表单
    content: '',
    bookId: null
  },
  currentBook: null,   // 当前评论的图书
  selectedBook: null   // 查看全部评论的图书
})

// 获取当前登录用户
const user = JSON.parse(localStorage.getItem('login-user') || '{}')

// 加载图书数据
const load = () => {
  request.get("/book/selectPageAvailable", {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.title
    }
  }).then(res => {
    console.log("分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;

    // 加载每本书的评论
    data.tableData.forEach(book => {
      loadBookComments(book);
    });
  }).catch(error => {
    console.error("加载图书数据失败:", error);
    ElMessage.error("加载图书数据失败，请检查网络或接口");
  })
};

// 加载图书评论
const loadBookComments = (book) => {
  request.get("/leavemsg/book/" + book.id, {
    params: {
      pageNum: 1,
      pageSize: 10 // 只加载前10条评论
    }
  }).then(res => {
    if (res.code === '200') {
      // 将评论添加到图书对象中
      book.comments = res.data?.list || [];
    }
  }).catch(error => {
    console.error("加载评论失败:", error);
  });
};

// 处理评论按钮点击
const handleComment = (book) => {
  data.currentBook = book;
  data.form = {
    content: '',
    bookId: book.id
  };
  data.formVisible = true;
};

// 保存评论
const saveComment = () => {
  if (!data.form.content || data.form.content.trim() === '') {
    ElMessage.warning("请输入评论内容");
    return;
  }

  request.request({
    url: '/leavemsg/save/' + user.id,
    method: 'POST',
    data: data.form
  }).then(res => {
    if (res.code === '200') {
      data.formVisible = false;
      ElMessage.success("评论发表成功");

      // 立即将新评论添加到当前图书的评论列表中
      if (data.currentBook) {
        const newComment = {
          content: data.form.content,
          createTime: new Date().toISOString(),
          memberName: user.username || '我'
        };

        // 如果当前图书还没有评论数组，先创建一个
        if (!data.currentBook.comments) {
          data.currentBook.comments = [];
        }

        // 将新评论添加到评论列表的开头
        data.currentBook.comments.unshift(newComment);

        // 如果当前查看全部评论的对话框打开且是同一本书，也更新那里的数据
        if (data.allCommentsVisible && data.selectedBook &&
            data.selectedBook.id === data.currentBook.id) {
          data.selectedBook.comments.unshift(newComment);
        }
      }
    } else {
      ElMessage.error(res.msg || "评论发表失败");
    }
  }).catch(error => {
    console.error("发表评论失败:", error);
    ElMessage.error("发表评论失败，请检查网络或接口");
  })
};

// 显示全部评论
const showAllComments = (book) => {
  data.selectedBook = book;
  data.allCommentsVisible = true;
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 翻页处理
const handelCurrentChange = (pageNum) => {
  data.pageNum = pageNum;
  load();
};

// 重置搜索
const reset = () => {
  data.title = '';
  load();
};

// 页面加载时获取数据
load();
</script>

<style scoped>
.card {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comment-item {
  margin-bottom: 8px;
  padding: 5px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.comment-item.full-width {
  background: none;
  padding: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-user {
  font-weight: bold;
  color: #409eff;
}

.comment-content {
  color: #333;
  line-height: 1.4;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.no-comment {
  color: #999;
  font-style: italic;
}

.all-comments {
  max-height: 400px;
  overflow-y: auto;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
