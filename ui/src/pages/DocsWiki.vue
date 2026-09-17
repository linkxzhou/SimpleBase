<template>
  <div class="docs-page">
    <a-skeleton v-if="loading" active :paragraph="{ rows: 10 }" />

    <SbEmptyState
      v-else-if="error"
      :description="error"
      action-text="回到文档首页"
      @action="goHome"
    />

    <div v-else class="docs-page-split">
      <article class="docs-article" :key="moduleId + '/' + slug" v-html="html" />
      <aside v-if="toc.length" class="docs-toc">
        <div class="docs-toc-title">本页目录</div>
        <a
          v-for="item in toc"
          :key="item.id"
          class="docs-toc-link"
          :class="{ 'is-h3': item.level === 3 }"
          :href="'#' + item.id"
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  defaultDocsRoute,
  docsPath,
  findModule,
  findPage,
  firstPageOf,
  loadMarkdownFile,
  loaderCount
} from '../docs/catalog'
import { renderMarkdown } from '../docs/markdown'
import type { DocsTocItem } from '../docs/types'
import SbEmptyState from '../components/SbEmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const html = ref('')
const toc = ref<DocsTocItem[]>([])

const moduleId = computed(() => String(route.params.module || ''))
const slug = computed(() => String(route.params.slug || ''))

watch(
  () => [moduleId.value, slug.value] as const,
  ([mod, pageSlug], _prev, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    void load(mod, pageSlug, () => cancelled)
  },
  { immediate: true }
)

async function load(mod: string, pageSlug: string, isCancelled: () => boolean) {
  if (!mod) {
    await router.replace({
      name: 'docs-page',
      params: { module: defaultDocsRoute.module, slug: defaultDocsRoute.slug }
    })
    return
  }

  if (!pageSlug) {
    const moduleMeta = findModule(mod)
    const first = moduleMeta ? firstPageOf(moduleMeta) : undefined
    if (first) {
      await router.replace({ name: 'docs-page', params: { module: mod, slug: first.slug } })
      return
    }
  }

  loading.value = true
  error.value = ''
  html.value = ''
  toc.value = []

  const resolved = findPage(mod, pageSlug)
  if (!resolved) {
    loading.value = false
    error.value = `找不到文档：/docs/${mod}/${pageSlug || ''}`
    return
  }

  if (loaderCount() === 0) {
    loading.value = false
    error.value = '文档 Markdown 未打包进前端（Vite glob 为空）。请确认 docs/ 相对 ui 可解析。'
    return
  }

  try {
    const source = await loadMarkdownFile(resolved.page.file)
    if (isCancelled()) return
    if (source == null) {
      error.value = `目录中有 ${resolved.page.file}，但构建未包含该文件`
      return
    }
    const rendered = renderMarkdown(source, resolved.page.file)
    html.value = rendered.html
    toc.value = rendered.toc
    await waitTick()
    if (route.hash) scrollToHeading(route.hash.replace(/^#/, ''))
    else window.scrollTo({ top: 0 })
  } catch (e) {
    if (isCancelled()) return
    error.value = e instanceof Error ? e.message : '文档渲染失败'
  } finally {
    if (!isCancelled()) loading.value = false
  }
}

function goHome() {
  void router.push(docsPath(defaultDocsRoute.module, defaultDocsRoute.slug))
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (route.hash !== `#${id}`) {
    history.replaceState(null, '', `${route.path}#${id}`)
  }
}

function waitTick() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}
</script>

<style scoped>
.docs-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--sb-space-6) var(--sb-space-6) var(--sb-space-8);
}

.docs-page-split {
  display: flex;
  gap: var(--sb-space-7);
  align-items: flex-start;
}

.docs-article {
  flex: 1;
  min-width: 0;
  font-size: var(--sb-fs-md);
  line-height: var(--sb-lh-relaxed);
  color: var(--sb-text);
}

.docs-article :deep(h1),
.docs-article :deep(h2),
.docs-article :deep(h3),
.docs-article :deep(h4) {
  font-family: var(--sb-font-serif);
  font-weight: 600;
  line-height: var(--sb-lh-tight);
  color: var(--sb-text);
  scroll-margin-top: calc(var(--sb-header-height) + var(--sb-space-4));
}

.docs-article :deep(h1) {
  margin: 0 0 var(--sb-space-4);
  font-size: var(--sb-fs-3xl);
}

.docs-article :deep(h2) {
  margin: var(--sb-space-7) 0 var(--sb-space-3);
  font-size: var(--sb-fs-2xl);
  padding-bottom: var(--sb-space-2);
  border-bottom: 1px solid var(--sb-border-soft);
}

.docs-article :deep(h3) {
  margin: var(--sb-space-5) 0 var(--sb-space-2);
  font-size: var(--sb-fs-xl);
}

.docs-article :deep(p) {
  margin: 0 0 var(--sb-space-4);
}

.docs-article :deep(a) {
  color: var(--sb-primary);
  text-decoration: none;
}

.docs-article :deep(a:hover) {
  text-decoration: underline;
}

.docs-article :deep(ul),
.docs-article :deep(ol) {
  margin: 0 0 var(--sb-space-4);
  padding-left: var(--sb-space-5);
}

.docs-article :deep(li + li) {
  margin-top: var(--sb-space-1);
}

.docs-article :deep(blockquote) {
  margin: 0 0 var(--sb-space-4);
  padding: var(--sb-space-3) var(--sb-space-4);
  border-left: 3px solid var(--sb-primary);
  background: var(--sb-bg-soft);
  color: var(--sb-text-secondary);
}

.docs-article :deep(pre) {
  margin: 0 0 var(--sb-space-4);
  padding: var(--sb-space-3) var(--sb-space-4);
  background: var(--sb-bg-soft);
  border: 1px solid var(--sb-border-soft);
  border-radius: var(--sb-radius-sm);
  overflow: auto;
}

.docs-article :deep(code) {
  font-family: var(--sb-font-mono);
  font-size: var(--sb-fs-xs);
}

.docs-article :deep(:not(pre) > code) {
  padding: 1px 6px;
  background: var(--sb-bg-soft);
  border-radius: var(--sb-radius-xs);
}

.docs-article :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 var(--sb-space-4);
  font-size: var(--sb-fs-sm);
}

.docs-article :deep(th),
.docs-article :deep(td) {
  border: 1px solid var(--sb-border-soft);
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
}

.docs-article :deep(th) {
  background: var(--sb-bg-soft);
  font-weight: 600;
}

.docs-article :deep(hr) {
  border: 0;
  border-top: 1px solid var(--sb-border-soft);
  margin: var(--sb-space-6) 0;
}

.docs-toc {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--sb-header-height) + var(--sb-space-4));
  max-height: calc(100vh - var(--sb-header-height) - var(--sb-space-8));
  overflow: auto;
  padding-left: var(--sb-space-3);
  border-left: 1px solid var(--sb-border-soft);
}

.docs-toc-title {
  color: var(--sb-text-muted);
  font-size: var(--sb-fs-xs);
  font-weight: 600;
  margin-bottom: var(--sb-space-2);
}

.docs-toc-link {
  display: block;
  color: var(--sb-text-secondary);
  font-size: var(--sb-fs-xs);
  line-height: var(--sb-lh-normal);
  text-decoration: none;
  padding: 4px 0;
}

.docs-toc-link.is-h3 {
  padding-left: var(--sb-space-3);
}

.docs-toc-link:hover {
  color: var(--sb-primary);
}

@media (max-width: 960px) {
  .docs-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .docs-page {
    padding: var(--sb-space-4) var(--sb-space-4) var(--sb-space-6);
  }
}
</style>
