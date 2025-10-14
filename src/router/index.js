import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Manager',
      component: () => import('@/views/Manager.vue'),
      redirect: '/home',
      children: [
        { path: 'home', name: 'Home', component: () => import('@/views/manager/Home.vue')},
        { path: 'member', name: 'Member', component: () => import('@/views/manager/Member.vue')},
        { path: 'house', name: 'House', component: () => import('@/views/manager/Book.vue')},
        { path: 'news', name: 'News', component: () => import('@/views/manager/News.vue')},
        { path: 'hosueAvailable', name: 'HosueAvailable', component: () => import('@/views/manager/BookAvailable.vue')},
        { path: 'myhosue', name: 'Myhosue', component: () => import('@/views/manager/Mybook.vue')},
        { path: 'person', name: 'Person', component: () => import('@/views/manager/Person.vue')},
        { path: 'leavemsg', name: 'Leavemsg', component: () => import('@/views/manager/Leavemsg.vue')},
        { path: 'myleavemsg', name: 'Myleavemsg', component: () => import('@/views/manager/Myleavemsg.vue')},
        {path: 'loginLog', name: 'loginLog', component: () => import('@/views/manager/LoginLog.vue')}
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue')
    }
  ]
})


//路由之前进行校验合法性
router.beforeEach(to => {
  // 直接放行的路由 如:登录、注册路由名字直接放开，不进行拦截处理
  if (to.name === 'Login'||to.name === 'Register') {
    return true;
  }
  // 如果没有登录不允许路由到主界面home
  // 统一登录身份认证,  在没有登录的情况不允许进入需要登录身份认证的页面
  // 具体实现方式: 登录成功后，保存token,  在全局前置导航守卫处统一判断
  const token = localStorage.getItem('login-user');
  if (token) {
    //如果之前登录过，那么放行
    return true // 放行
  } else {
    //如果之前没有登录过那么先去登录
    return { path: '/login' } //重定向到/路由登录界面
  }
})

export default router
