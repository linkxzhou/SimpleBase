import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'

const uiDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(uiDir, '..')
const docsDir = path.resolve(repoRoot, 'docs')

// SIMPLEBASE_DEV_API_PROXY 由 ./build.sh dev 注入，默认本机 8080
const apiTarget = process.env.SIMPLEBASE_DEV_API_PROXY || 'http://127.0.0.1:8080'
const wsTarget = apiTarget.replace(/^http/, 'ws')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@docs': docsDir
    }
  },
  server: {
    port: 5173,
    fs: {
      // docs/ 在 Vite 根目录（ui/）之外，开发服务器必须显式放行，否则 glob 得到空模块。
      allow: [searchForWorkspaceRoot(process.cwd()), repoRoot, docsDir]
    },
    proxy: {
      '/v1': { target: apiTarget, changeOrigin: true },
      '/health': { target: apiTarget, changeOrigin: true },
      '/ws': { target: wsTarget, changeOrigin: true, ws: true }
    }
  }
})
