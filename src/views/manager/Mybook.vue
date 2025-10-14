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
                    <el-table-column label="状态">
                        <template #default="scope">
                            <el-tag type="success" effect="dark">借阅中</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="160">
                        <template #default="scope">
                            <el-button type="primary" size="small" @click="handleTuiRent(scope.row.id)">归还</el-button>
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

    // 获取当前登录用户信息
    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem('login-user');
            if (!userStr) {
                ElMessage.warning('请先登录');
                return null;
            }
            return JSON.parse(userStr);
        } catch (error) {
            console.error('获取用户信息异常:', error);
            return null;
        }
    };

    const user = getCurrentUser() || {};

    //请求数据 - 适配后端selectPageMyBook接口
    const load = () => {
        // 发送GET请求，查询用户借阅的图书信息
        request.get("/book/selectPageMyBook", {
            params: {
                pageNum: data.pageNum,     // 当前页码
                pageSize: data.pageSize,   // 每页大小
                name: data.title,          // 查询条件 - 后端参数名是name而不是title
                member_id: user.id || user.userId || user.user_id  // 用户ID
            }
        }).then(res => {
            console.log("分页数据:" + JSON.stringify(res.data));
            // 根据后端返回的数据结构设置表格数据
            data.tableData = res.data?.list || [];
            data.total = res.data?.total || 0;
        }).catch(error => {
            console.error("加载借阅图书数据失败:", error);
            ElMessage.error("加载借阅图书数据失败，请检查网络或接口");
        })
    };

    //翻页
    const handelCurrentChange = (pageNum) => {
        data.pageNum = pageNum;
        load();
    };

    //重置
    const reset = () => {
        data.title = '';
        load();
    };

    // 页面加载时获取数据
    load();

    //归还图书
    const handleTuiRent = (id) => {
        ElMessageBox.confirm('您确认归还该图书吗？', '归还确认', {type: 'warning'}).then(() => {
            // 根据后端接口调整，应该调用图书归还接口
            request.request({
                url: '/book/updateStatusTui',  // 可以使用现有的退租接口名称，后端可能已适配
                method: 'PUT',
                data: {
                    "id": id, 
                    "member_id": "",           // 清空用户ID
                    "action": "return"         // 添加操作类型
                }
            }).then(res => {
                if (res.code === '200') {
                    load();    // 重新获取数据
                    ElMessage.success("归还成功");
                } else {
                    ElMessage.error(res.msg || "归还失败");
                }
            }).catch(error => {
                console.error("归还请求失败:", error);
                ElMessage.error("归还请求失败，请检查网络或接口");
            })
        }).catch(() => {
            console.log('用户取消归还');
        })
    }
</script>