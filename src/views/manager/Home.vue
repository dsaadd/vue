<template>
  <div class="home-container">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <el-card>
        <template #header>
          <div class="welcome-header">
            <div class="welcome-text">
              <h2  v-if="user.role==='ADMIN'">欢迎您，{{ user.username }}</h2>
              <h2  v-if="user.role==='TENANT'">欢迎您，{{ user.uname }}</h2>
              <p>{{ greetingText }}</p>
            </div>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 统计数据卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in statistics" :key="stat.title">
          <el-card shadow="hover" :body-style="{ padding: '20px' }">
            <div class="stat-card-content">
              <el-icon :size="30" :class="stat.icon"><component :is="stat.icon" /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 走马灯图片展示 -->
    <div class="carousel-section">
      <el-card>
        <el-carousel :interval="3000" type="card" height="300px">
          <el-carousel-item v-for="image in carouselImages" :key="image.id">
            <el-image
                :src="image.url"
                fit="cover"
                class="carousel-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="carousel-caption">
              <h3>{{ image.title }}</h3>
              <p>{{ image.description }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-card>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { Sunny, ShoppingCart, User, Goods, Money } from '@element-plus/icons-vue'
import request from "@/utils/request";

// 用户信息
const user = JSON.parse(localStorage.getItem('login-user') || '{}')

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，请注意休息！'
  if (hour < 9) return '早上好，开启活力的一天！'
  if (hour < 12) return '上午好，工作顺利！'
  if (hour < 14) return '中午好，请适当休息！'
  if (hour < 17) return '下午好，继续加油！'
  if (hour < 19) return '傍晚好，记得活动一下！'
  return '晚上好，不要太劳累！'
})

//初始值
const data = reactive({
  content: '',  //初始搜索条件是''
  todayOrders: 0,
  activeUsers: 0,
  totalProducts: 0,
  totalAmount: 0
});


// 统计数据
const statistics = ref([
  { title: '今日订单', value: 0, icon: 'ShoppingCart' },
  { title: '活跃用户', value: 0, icon: 'User' },
  { title: '餐品总数', value: 0, icon: 'Goods' },
  { title: '订单总金额', value: 0, icon: 'Money' }
])


const loadStatistics = async () => {
  try {
    const res = await request.get('/statistics/overview')
    statistics.value = [
      { title: '预定总数', value: res.data.bookHouse, icon: 'ShoppingCart' },
      { title: '活跃用户', value: res.data.activeUsers, icon: 'User' },
      { title: '评论总数', value: res.data.bookHouse, icon: 'Goods' },
      { title: '图书总数', value: res.data.totalHouse, icon: 'Money' }
    ]

  } catch (error) {
    console.error('获取统计数据失败：', error)
  }
}

// 走马灯图片
const carouselImages = ref([
  {
    id: 1,
    url: 'https://img2.baidu.com/it/u=78520549,2456267343&fm=253&app=138&f=JPEG?w=1067&h=800',
    title: '三室一厅招租',
    description: '三室一厅招租......'
  },
  {
    id: 2,
    url: 'https://img1.baidu.com/it/u=1293278147,2688711141&fm=253&app=138&f=JPEG?w=800&h=1068',
    title: '独立卫生间招租',
    description: '独立卫生间招租'
  },
  {
    id: 3,
    url: 'https://img1.baidu.com/it/u=4102652360,1981785264&fm=253&app=138&f=JPEG?w=1423&h=800',
    title: '学区房',
    description: '学区房....'
  },
  {
    id: 4,
    url: 'https://img1.baidu.com/it/u=1497192101,4029823485&fm=253&app=138&f=JPEG?w=1067&h=800',
    title: '小区环境优美',
    description: '小区环境优美小区环境优美'
  }
])


/**
 * 调用方法获取后台数据,视图打开自动调用该方法
 */
onMounted(() => {
  loadStatistics();
});

</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  flex-grow: 1;
}

.welcome-text h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.welcome-text p {
  margin: 5px 0 0;
  color: #909399;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #409EFF;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex-grow: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-title {
  color: #909399;
  font-size: 14px;
}

.carousel-section {
  margin-bottom: 20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 15px;
}

.carousel-caption h3 {
  margin: 0;
  font-size: 18px;
}

.carousel-caption p {
  margin: 5px 0 0;
  font-size: 14px;
  opacity: 0.8;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f5f7fa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-carousel__item {
  border-radius: 6px;
  overflow: hidden;
}
</style>