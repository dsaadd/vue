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
                  @click="handleDel(scope.row.id)">
                我要借阅
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
</script>