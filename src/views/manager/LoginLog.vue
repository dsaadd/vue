<template>
  <div>
    <div class="card" style="line-height: 30px">
      <div v-if="user.role==='ADMIN'">欢迎您{{ user.username }}， 以下是您的登录日志信息：</div>
      <div v-if="user.role==='TENANT'">欢迎您{{ user.uname }}， 以下是您的登录日志信息：</div>
    </div>
    <br/>
    <div class="card">
      <div style="margin-bottom: 10px;">
        <el-table :data="data.tableData">
          <el-table-column label="序号" prop="id" width="70"></el-table-column>
          <el-table-column label="登录账户" prop="name"></el-table-column>
          <el-table-column label="登录IP" prop="ip"></el-table-column>
          <el-table-column label="登录地址" prop="address"></el-table-column>
          <el-table-column label="登录时间" prop="logintime"></el-table-column>
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
import {ElMessage} from "element-plus";

const user = JSON.parse(localStorage.getItem('login-user') || '{}')

//初始值
const data = reactive({
  content: '',  //初始搜索条件是''
  tableData: [],
  pageNum: 1, //当前页码
  pageSize: 8, //每页个数
  total: 0,
});


//请求数据
const load = () => {
  let username="";
  if(user.role=='ADMIN'){
    username=user.username;
  }else{
    username=user.uname;
  }
  //发送了一个Get请求，查询房源信息
  request.get("/loginlog/selectPage", {
    params: {
      pageNum: data.pageNum, //当前页码
      pageSize: data.pageSize, //每页大小
      username: username
    }
  }).then(res => {
    console.log("分页数据:" + JSON.stringify(res.data));
    data.tableData = res.data?.list || [];
    data.total = res.data?.total || 0;
  })
};

/**
 * 调用方法获取后台数据,视图打开自动调用该方法
 */
load();

</script>