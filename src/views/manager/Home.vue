<template>
  <div class="home-container">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <el-card>
        <template #header>
          <div class="welcome-header">
            <div class="welcome-text">
              <h2>欢迎您，{{ user.username || user.uname }}</h2>
              <p>{{ greetingText }}</p>
            </div>
            <div class="library-info">
              <el-icon><Reading /></el-icon>
              <span>图书管理系统</span>
            </div>
          </div>
        </template>
        <div class="welcome-content">
          <p>今日推荐：探索知识的海洋，发现阅读的乐趣</p>
        </div>
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
        <template #header>
          <div class="card-header">
            <span>热门图书推荐</span>
          </div>
        </template>
        <el-carousel :interval="4000" type="card" height="320px">
          <el-carousel-item v-for="book in carouselBooks" :key="book.id">
            <el-image
                :src="book.cover"
                fit="cover"
                class="carousel-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Reading /></el-icon>
                  <div>封面加载失败</div>
                </div>
              </template>
            </el-image>
            <div class="carousel-caption">
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }} · {{ book.category }}</p>
              <div class="book-rating">
                <el-rate
                    v-model="book.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value} 分"
                />
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-card>
    </div>

    <!-- 图书评语模块 -->
    <div class="reviews-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>读者评语</span>
            <el-button type="primary" text @click="showAddReviewDialog">
              <el-icon><Edit /></el-icon>
              我要评价
            </el-button>
          </div>
        </template>

        <!-- 评语列表 -->
        <div class="reviews-list">
          <div
              v-for="review in bookReviews"
              :key="review.id"
              class="review-item"
          >
            <div class="review-header">
              <div class="reviewer-info">
                <el-avatar :size="40" :src="review.avatar" />
                <div class="reviewer-details">
                  <div class="reviewer-name">{{ review.reviewer }}</div>
                  <div class="review-date">{{ review.date }}</div>
                </div>
              </div>
              <div class="book-info">
                <span class="book-title">{{ review.bookTitle }}</span>
                <el-rate
                    v-model="review.rating"
                    disabled
                    size="small"
                />
              </div>
            </div>
            <div class="review-content">
              {{ review.content }}
            </div>
            <div class="review-actions">
              <el-button text size="small" @click="likeReview(review.id)">
                <el-icon><Star /></el-icon>
                有用 ({{ review.likes }})
              </el-button>
              <el-button text size="small" @click="shareReview(review)">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more">
          <el-button
              type="text"
              @click="loadMoreReviews"
              :loading="loadingMore"
          >
            加载更多评语
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 添加评语对话框 -->
    <el-dialog
        v-model="addReviewDialogVisible"
        title="添加图书评语"
        width="600px"
    >
      <el-form :model="newReview" label-width="80px">
        <el-form-item label="选择图书">
          <el-select
              v-model="newReview.bookId"
              placeholder="请选择图书"
              style="width: 100%"
          >
            <el-option
                v-for="book in availableBooks"
                :key="book.id"
                :label="book.title"
                :value="book.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="newReview.rating" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input
              v-model="newReview.content"
              type="textarea"
              :rows="4"
              placeholder="请写下您的阅读感受..."
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addReviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submitting">
          提交评语
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import {
  Reading,
  Collection,
  User,
  Document,
  Edit,
  Star,
  Share
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from "@/utils/request";

// 用户信息
const user = JSON.parse(localStorage.getItem('login-user') || '{}')

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，阅读是很好的休息方式！'
  if (hour < 9) return '早上好，开始一天的阅读之旅！'
  if (hour < 12) return '上午好，书中自有黄金屋！'
  if (hour < 14) return '中午好，适当的阅读让大脑更清醒！'
  if (hour < 17) return '下午好，继续在书海中探索！'
  if (hour < 19) return '傍晚好，记录今天的阅读收获！'
  return '晚上好，安静的夜晚适合深度阅读！'
})

// 统计数据 - 图书管理系统相关
const statistics = ref([
  { title: '图书总数', value: 0, icon: 'Collection' },
  { title: '今日借阅', value: 0, icon: 'Reading' },
  { title: '活跃读者', value: 0, icon: 'User' },
  { title: '待还图书', value: 0, icon: 'Document' }
])

const loadStatistics = async () => {
  try {
    const res = await request.get('/statistics/overview')
    statistics.value = [
      { title: '图书总数', value: res.data.totalBooks || 12543, icon: 'Collection' },
      { title: '今日借阅', value: res.data.todayBorrows || 156, icon: 'Reading' },
      { title: '活跃读者', value: res.data.activeReaders || 892, icon: 'User' },
      { title: '待还图书', value: res.data.overdueBooks || 67, icon: 'Document' }
    ]
  } catch (error) {
    console.error('获取统计数据失败：', error)
    // 默认数据
    statistics.value = [
      { title: '图书总数', value: 12543, icon: 'Collection' },
      { title: '今日借阅', value: 156, icon: 'Reading' },
      { title: '活跃读者', value: 892, icon: 'User' },
      {title: '待还图书', value: 67, icon: 'Document'}
    ]
  }
}

// 轮播图 - 使用新的图片链接
const carouselBooks = ref([
  {
    id: 1,
    cover: 'https://ts3.tc.mm.bing.net/th/id/OIP-C.euMYRD2GDWJs40zJIYAT_wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3',
    title: '三体全集',
    author: '刘慈欣',
    category: '科幻小说',
    rating: 4.8
  },
  {
    id: 2,
    cover: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.FbZn53AMUVpXTEAZVyoNAwHaKh?w=136&h=194&c=7&r=0&o=7&cb=12&dpr=1.6&pid=1.7&rm=3',
    title: '活着',
    author: '余华',
    category: '现当代文学',
    rating: 4.9
  },
  {
    id: 3,
    cover: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.NH8M5hIwmaHhVm4wugfC6gHaHa?w=213&h=213&c=7&r=0&o=7&cb=12&dpr=1.6&pid=1.7&rm=3',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    category: '历史社科',
    rating: 4.7
  },
  {
    id: 4,
    cover: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.st__wy8jjNuUs2fW7RNzUQHaHa?w=200&h=200&c=7&r=0&o=7&cb=12&dpr=1.6&pid=1.7&rm=3',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    category: '世界文学',
    rating: 4.8
  },
  {
    id: 5,
    cover: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.fjL3flPwDSEl-R8stx4vVQHaHa?w=211&h=211&c=7&r=0&o=7&cb=12&dpr=1.6&pid=1.7&rm=3',
    title: '解忧杂货店',
    author: '东野圭吾',
    category: '推理小说',
    rating: 4.6
  }
])

// 图书评语相关
const bookReviews = ref([
  {
    id: 1,
    reviewer: '张三',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    bookTitle: '三体全集',
    bookId: 1,
    rating: 5,
    content: '这是一部令人震撼的科幻巨作！刘慈欣的想象力让人叹为观止，黑暗森林理论让我重新思考了宇宙文明的关系。',
    date: '2024-01-15',
    likes: 24
  },
  {
    id: 2,
    reviewer: '李四',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    bookTitle: '活着',
    bookId: 2,
    rating: 5,
    content: '余华的文字朴实而有力，读完后久久不能平静。福贵的一生让我深刻体会到生命的坚韧和珍贵。',
    date: '2024-01-14',
    likes: 18
  },
  {
    id: 3,
    reviewer: '王五',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    bookTitle: '人类简史',
    bookId: 3,
    rating: 4,
    content: '从认知革命到科学革命，这本书提供了一个全新的视角来看待人类历史。虽然有些观点比较激进，但确实发人深省。',
    date: '2024-01-13',
    likes: 15
  },
  {
    id: 4,
    reviewer: '赵六',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    bookTitle: '百年孤独',
    bookId: 4,
    rating: 5,
    content: '魔幻现实主义的巅峰之作！马尔克斯的叙事如同编织一张精美的魔毯，布恩迪亚家族的故事让人着迷。',
    date: '2024-01-12',
    likes: 22
  }
])

// 可选择的图书列表
const availableBooks = ref([
  {id: 1, title: '三体全集'},
  {id: 2, title: '活着'},
  {id: 3, title: '人类简史'},
  {id: 4, title: '百年孤独'},
  {id: 5, title: '解忧杂货店'}
])

// 对话框状态
const addReviewDialogVisible = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)

// 新评语表单
const newReview = reactive({
  bookId: null,
  rating: 5,
  content: ''
})

// 显示添加评语对话框
const showAddReviewDialog = () => {
  newReview.bookId = null
  newReview.rating = 5
  newReview.content = ''
  addReviewDialogVisible.value = true
}

// 提交评语
const submitReview = async () => {
  if (!newReview.bookId) {
    ElMessage.warning('请选择要评价的图书')
    return
  }
  if (!newReview.content.trim()) {
    ElMessage.warning('请输入评语内容')
    return
  }

  submitting.value = true
  try {
    // 模拟API调用
    const selectedBook = availableBooks.value.find(book => book.id === newReview.bookId)
    const newReviewItem = {
      id: Date.now(),
      reviewer: user.username || '匿名用户',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      bookTitle: selectedBook.title,
      bookId: newReview.bookId,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    }

    bookReviews.value.unshift(newReviewItem)
    addReviewDialogVisible.value = false
    ElMessage.success('评语提交成功！')
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 点赞评语
const likeReview = (reviewId) => {
  const review = bookReviews.value.find(r => r.id === reviewId)
  if (review) {
    review.likes++
    ElMessage.success('感谢您的反馈！')
  }
}

// 分享评语
const shareReview = (review) => {
  // 这里可以集成实际的分享功能
  ElMessage.info(`分享评语：${review.bookTitle} - ${review.content.substring(0, 20)}...`)
}

// 加载更多评语
const loadMoreReviews = () => {
  loadingMore.value = true
  // 模拟加载更多数据
  setTimeout(() => {
    const newReviews = [
      {
        id: bookReviews.value.length + 1,
        reviewer: '新读者',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        bookTitle: '解忧杂货店',
        bookId: 5,
        rating: 4,
        content: '东野圭吾的温情之作，几个看似独立的故事最终巧妙地联系在一起，让人感受到人性的温暖。',
        date: '2024-01-11',
        likes: 12
      }
    ]
    bookReviews.value.push(...newReviews)
    loadingMore.value = false
    ElMessage.success('加载了更多评语')
  }, 1000)
}

/**
 * 调用方法获取后台数据
 */
onMounted(() => {
  loadStatistics()
})
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
  justify-content: space-between;
  align-items: center;
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

.library-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  font-weight: bold;
}

.welcome-content {
  padding: 10px 0;
  color: #606266;
  font-style: italic;
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
  border-radius: 4px;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.carousel-caption h3 {
  margin: 0;
  font-size: 18px;
}

.carousel-caption p {
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.9;
}

.book-rating {
  margin-top: 8px;
}

/* 评语模块样式 */
.reviews-section {
  margin-bottom: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.review-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: bold;
  color: #303133;
}

.review-date {
  font-size: 12px;
  color: #909399;
}

.book-info {
  text-align: right;
}

.book-title {
  display: block;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.review-content {
  line-height: 1.6;
  color: #606266;
  margin-bottom: 12px;
}

.review-actions {
  display: flex;
  gap: 16px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
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
