<template>
  <div class="docs-shell">
    <header class="docs-topbar">
      <div class="docs-topbar-left">
        <MenuOutlined
          v-if="isMobile"
          class="docs-icon-btn"
          aria-label="打开目录"
          @click="drawerOpen = true"
        />
        <router-link to="/docs" class="docs-brand">
          <span class="docs-brand-logo">S</span>
          <span class="docs-brand-text">SimpleBase 文档</span>
        </router-link>
      </div>
      <div class="docs-topbar-right">
        <router-link to="/" class="docs-back">返回控制台</router-link>
      </div>
    </header>

    <a-drawer
      v-if="isMobile"
      v-model:open="drawerOpen"
      placement="left"
      :width="280"
      :closable="false"
      class="docs-drawer"
    >
      <DocsSidebar @navigate="drawerOpen = false" />
    </a-drawer>

    <div class="docs-body">
      <aside v-if="!isMobile" class="docs-sider">
        <DocsSidebar />
      </aside>
      <main class="docs-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { MenuOutlined } from '@ant-design/icons-vue'
import DocsSidebar from '../components/docs/DocsSidebar.vue'

const drawerOpen = ref(false)
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) drawerOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.docs-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
  color: var(--sb-text);
}

.docs-topbar {
  position: sticky;
  top: 0;
  z-index: var(--sb-z-header);
  height: var(--sb-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--sb-space-5);
  background: rgba(250, 249, 245, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--sb-border-soft);
}

[data-theme='dark'] .docs-topbar {
  background: rgba(26, 25, 24, 0.92);
}

.docs-topbar-left,
.docs-topbar-right {
  display: flex;
  align-items: center;
  gap: var(--sb-space-3);
}

.docs-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--sb-text);
  text-decoration: none;
}

.docs-brand-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--sb-radius-sm);
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font-serif);
  font-weight: 600;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.docs-brand-text {
  font-family: var(--sb-font-serif);
  font-size: var(--sb-fs-lg);
  font-weight: 700;
}

.docs-back {
  color: var(--sb-text-secondary);
  font-size: var(--sb-fs-sm);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: var(--sb-radius-sm);
  border: 1px solid var(--sb-border-soft);
  transition: var(--sb-transition);
}

.docs-back:hover {
  color: var(--sb-primary);
  border-color: var(--sb-primary);
}

.docs-icon-btn {
  color: var(--sb-text-secondary);
  font-size: 18px;
  cursor: pointer;
}

.docs-icon-btn:hover {
  color: var(--sb-primary);
}

.docs-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.docs-sider {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--sb-border-soft);
  background: rgba(250, 249, 245, 0.55);
  overflow: auto;
  position: sticky;
  top: var(--sb-header-height);
  height: calc(100vh - var(--sb-header-height));
}

[data-theme='dark'] .docs-sider {
  background: rgba(26, 25, 24, 0.55);
}

.docs-main {
  flex: 1;
  min-width: 0;
}

.docs-drawer :deep(.ant-drawer-body) {
  padding: 0;
}

@media (max-width: 768px) {
  .docs-topbar {
    padding: 0 var(--sb-space-3);
  }
  .docs-brand-text {
    font-size: var(--sb-fs-md);
  }
}
</style>
