<template>

  <div>
    <div class="card" style="margin-bottom: 10px;">
      <el-input v-model="data.title" :prefix-icon="Search" style="width: 300px; margin-right: 10px"
                placeholder="请输入图书名称"></el-input>
      <el-button type="primary" style="margin-left: 10px;" @click="load">查询</el-button>
      <el-button type="info" @click="reset">重置</el-button>
    </div>
    <div class="card">
      <div style="margin-bottom: 10px;">
        <el-table :data="data.tableData">
          <el-table-column label="序号" prop="id" width="70"></el-table-column>
          <el-table-column label="图片">
            <template #default="scope">
              <el-image v-if="scope.row.photos" :src="scope.row.photos"
                        :preview-src-list="[scope.row.photos]"
                        style="width: 40px;height: 40px;border-radius: 4px;"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="书名" prop="name"></el-table-column>
          <el-table-column label="作者" prop="author"></el-table-column>
          <el-table-column label="价格" prop="price"></el-table-column>
          <el-table-column label="库存" prop="stock"></el-table-column>
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <el-button
                  v-if="scope.row.stock > 0"
                  type="primary"
                  size="small"
                  @click="handleReply">
                评论
              </el-button>
              <el-button
                  v-else
                  type="danger"
                  size="small"
                  disabled>
                已售罄
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="card">
        <el-pagination background layout="prev, pager,next" @current-change="handelCurrentChange"
                       v-model:current-page="data.pageNum" v-model:page-size="data.pageSize"
                       :total="data.total"/>
      </div>
    </div>
  </div>


 
      <el-dialog
          width="500px"
          v-model="data.formVisible"
          title="发表评论"
          destroy-on-close
          center
      >
        <el-form :model="data.form" ref="formRef" :rules="rules" label-width="80px">
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
                      <el-button type="primary" @click="save" :loading="data.submitting">发表评论</el-button>
                  </span>
        </template>
      </el-dialog>



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
  formVisible: false //新增框不显示
})

const user = JSON.parse(localStorage.getItem('login-user') || '{}')

//请求数据
const load = () => {
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
  }).catch(error => {
    console.error("加载图书数据失败:", error);
    ElMessage.error("加载图书数据失败，请检查网络或接口");
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

const handleReply = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
};
// 保存数据到后台
const save = () => {
  request.request({
    url: '/leavemsg/save/' + user.id,
    method: 'POST',
    data: data.form
  }).then(res => {
    if (res.code === '200') {
      load()    // 重新获取数据
      data.formVisible = false; // 关闭弹窗
      ElMessage.success("操作成功");
    } else {
      ElMessage.error(res.msg)
    }
  })
};
  </script>
