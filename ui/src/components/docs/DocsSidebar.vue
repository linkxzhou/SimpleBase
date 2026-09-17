<template>
  <nav class="docs-nav" aria-label="文档目录">
    <div v-for="mod in docsCatalog.modules" :key="mod.id" class="docs-nav-module">
      <div class="docs-nav-module-title">{{ mod.title }}</div>
      <router-link
        v-for="page in mod.pages"
        :key="page.slug"
        :to="docsPath(mod.id, page.slug)"
        class="docs-nav-link"
        :class="{ 'is-active': isActive(mod.id, page.slug) }"
        @click="emit('navigate')"
      >
        {{ page.title }}
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { docsCatalog, docsPath } from '../../docs/catalog'

defineEmits<{ (e: 'navigate'): void }>()

const route = useRoute()

function isActive(moduleId: string, slug: string) {
  return route.params.module === moduleId && route.params.slug === slug
}
</script>

<style scoped>
.docs-nav {
  padding: var(--sb-space-4) var(--sb-space-3) var(--sb-space-6);
}

.docs-nav-module + .docs-nav-module {
  margin-top: var(--sb-space-4);
}

.docs-nav-module-title {
  padding: 0 var(--sb-space-2);
  margin-bottom: var(--sb-space-2);
  color: var(--sb-text-muted);
  font-size: var(--sb-fs-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.docs-nav-link {
  display: block;
  padding: 6px var(--sb-space-2);
  border-radius: var(--sb-radius-sm);
  color: var(--sb-text-secondary);
  font-size: var(--sb-fs-sm);
  line-height: var(--sb-lh-normal);
  text-decoration: none;
  transition: var(--sb-transition);
}

.docs-nav-link:hover {
  color: var(--sb-primary);
  background: rgba(31, 30, 29, 0.04);
}

.docs-nav-link.is-active {
  color: var(--sb-primary);
  background: var(--sb-primary-light);
  font-weight: 600;
}
</style>
