<template>
  <div class="comment-container">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-wrapper">
        <el-input
            v-model="data.content"
            :prefix-icon="Search"
            class="search-input"
            placeholder="请输入评论关键字"
            clearable
        ></el-input>
        <div class="button-group">
          <el-button type="primary" @click="load" :icon="Search">查询</el-button>
          <el-button type="info" @click="reset" :icon="Refresh">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容卡片 -->
    <el-card class="content-card" shadow="never">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handlerAdd" :icon="Plus">我要评论</el-button>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
            :data="data.tableData"
            stripe
            border
            size="medium"
            header-row-class-name="table-header"
            v-loading="data.loading"
        >
          <el-table-column label="序号" prop="id" width="70" align="center"></el-table-column>
          <el-table-column label="评论人账号" prop="memberName" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column label="评论内容" prop="content" min-width="200" show-overflow-tooltip></el-table-column>
          <el-table-column label="评论时间" prop="createTime" width="160" align="center"></el-table-column>
          <el-table-column label="评论回复" prop="reply" min-width="180" show-overflow-tooltip></el-table-column>
          <el-table-column label="回复时间" prop="replyTime" width="160" align="center"></el-table-column>
          <el-table-column label="回复人" prop="replyName" width="120" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            background
            layout="total, prev, pager, next, sizes"
            @current-change="handelCurrentChange"
            @size-change="handleSizeChange"
            v-model:current-page="data.pageNum"
            v-model:page-size="data.pageSize"
            :total="data.total"
            :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 评论对话框 -->
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
  </div>
</template>

<script setup>
    import {reactive, ref} from "vue";
    import {Search} from "@element-plus/icons-vue";
    import request from "@/utils/request.js";
    import {ElMessage} from "element-plus";

    //当前登录人的用户对象
    const user = JSON.parse(localStorage.getItem('login-user') || '{}');

    //初始值
    const data = reactive({
        content: '',  //初始搜索条件是''
        tableData: [],
        pageNum: 1, //当前页码
        pageSize: 8, //每页个数
        total: 0,
        formVisible: false
    });

    //点击编辑
    const handleReply = (row) => {
        data.form = JSON.parse(JSON.stringify(row));
        data.formVisible = true;
    };

    //点击新增
    const handlerAdd = () => {
        data.form = {};
        data.formVisible = true; //打开对话框
    };

    //请求数据
    const load = () => {
        //发送了一个Get请求，查询我的留言数据
        request.get("/leavemsg/myleavemsg", {
            params: {
                pageNum: data.pageNum, //当前页码
                pageSize: data.pageSize, //每页大小
                content: data.content, //查询条件
                memberId: user.id
            }
        }).then(res => {
            console.log("分页数据:" + JSON.stringify(res.data));
            data.tableData = res.data?.list || [];
            data.total = res.data?.total || 0;
        })
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


    //翻页
    const handelCurrentChange = (pageNum) => {
        // 当翻页的时候重新加载数据即可
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
