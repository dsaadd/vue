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
        <el-button type="primary" @click="handlerAdd">新增</el-button>
      </div>
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
          <el-table-column label="图书标题" prop="name"></el-table-column>
          <el-table-column label="作者" prop="author"></el-table-column>
          <el-table-column label="价格" prop="price"></el-table-column>
          <el-table-column label="库存" prop="stock"></el-table-column>
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDel(scope.row.id)">删除</el-button>
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

  <el-dialog width="35%" v-model="data.formVisible" title="图书信息" destory-on-close>
    <el-form :model="data.form" ref="formRef" :rules="rules" label-width="100px" label-position="right"
             style="padding-right: 40px">
      <el-form-item label="图书标题" prop="name">
        <el-input v-model="data.form.name" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="图书作者" prop="author">
        <el-input v-model="data.form.author" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="图书图片">
        <el-upload action="http://localhost:9090/files/upload" list-type="picture"
                   :on-success="handleImgUploadSuccess">
          <el-button type="primary">上传图片</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="图书价格" prop="price">
        <el-input v-model.number="data.form.price" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="图书库存" prop="stock">
        <el-input v-model.number="data.form.stock" autocomplete="off"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">保 存</el-button>
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
  formVisible: false, //新增框不显示
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
  ]
})

// 加载图书数据
const load = () => {
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
.el-menu-item.is-active {
  background-color: #dcede9 !important;
}

.el-menu-item:hover {
  color: #11A983;
}

:deep(th) {
  color: #333;
}
</style>