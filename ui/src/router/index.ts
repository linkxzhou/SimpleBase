import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { defaultDocsRoute } from '../docs/catalog'

/**
 * 路由元信息单一数据源：页面标题、菜单名、图标全部收敛到 meta。
 * NavMenu 遍历路由渲染（跳过 hidden），DefaultLayout 从 meta 取面包屑标题。
 * hidden：后端能力未就绪时隐藏入口（FaaS：后端无此模块）；文档路由也不进控制台菜单。
 *
 * 控制台与文档是兄弟布局，不能把 /docs 挂在 DefaultLayout 下，否则会继续渲染
 * 控制台侧栏，且 Transition + ProjectScope 会把文档正文吃成空白。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { title: '监控大盘' }
      },
      {
        path: 'databases',
        name: 'databases',
        component: () => import('../pages/Databases.vue'),
        meta: { title: '数据库管理' }
      },
      { path: 'sql', redirect: '/databases' },
      { path: 'data', redirect: '/databases' },
      {
        path: 's3',
        name: 's3',
        component: () => import('../pages/S3Manager.vue'),
        meta: { title: 'S3 对象存储' }
      },
      {
        path: 'faas',
        name: 'faas',
        component: () => import('../pages/FaaSManager.vue'),
        meta: { title: '云函数', hidden: true }
      },
      {
        path: 'agents',
        name: 'agents',
        component: () => import('../pages/AgentManager.vue'),
        meta: { title: 'Cloud Agent' }
      },
      { path: 'llm', redirect: '/agents' },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../pages/Settings.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('../pages/Logs.vue'),
        meta: { title: '日志管理' }
      }
    ]
  },
  {
    path: '/docs',
    component: () => import('../layouts/DocsLayout.vue'),
    meta: { hidden: true, title: '使用文档' },
    children: [
      {
        path: '',
        name: 'docs-home',
        redirect: {
          name: 'docs-page',
          params: { module: defaultDocsRoute.module, slug: defaultDocsRoute.slug }
        }
      },
      {
        path: ':module',
        name: 'docs-module',
        component: () => import('../pages/DocsWiki.vue'),
        meta: { hidden: true, title: '使用文档' }
      },
      {
        path: ':module/:slug',
        name: 'docs-page',
        component: () => import('../pages/DocsWiki.vue'),
        meta: { hidden: true, title: '使用文档' }
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  }
})
