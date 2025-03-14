<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownParser, RendererManager, RendererType, Token } from "mini-markdown-parser";

// 扩展Window接口以支持自定义属性
declare global {
  interface Window {
    _isRendering: boolean;
  }
}

const markdownInput = ref("# h1 Heading\n## h2 Heading\n### h3 Heading\n#### h4 Heading\n##### h5 Heading\n###### h6 Heading");
const htmlContent = ref("");
const previewMode = ref(false);
const parser = new MarkdownParser();
const renderer = new RendererManager();

// 移除computed属性，改为手动渲染函数
const renderMarkdown = () => {
  try {
    // 阻止浏览器可能的自动渲染
    if (window._isRendering) {
      console.log('已有渲染任务在进行中，跳过');
      return;
    }
    
    // 设置渲染状态锁
    window._isRendering = true;
    
    console.log('开始渲染，输入内容:', markdownInput.value);
    console.log('输入内容长度:', markdownInput.value.length);
    console.log('输入内容中的换行符数量:', (markdownInput.value.match(/\n/g) || []).length);
    
    // 记录解析前的状态
    console.log('解析前状态:', { 
      inputLength: markdownInput.value.length,
      inputLines: markdownInput.value.split('\n').length
    });
    
    const tokens = parser.parse(markdownInput.value);
    console.log('解析后的tokens数量:', tokens.length);
    console.log('解析后的tokens:', tokens);
    
    htmlContent.value = renderer.renderWith(RendererType.HTML, tokens);
    console.log('渲染成功:', htmlContent.value);
    
    // 释放渲染状态锁
    window._isRendering = false;
  } catch (error) {
    console.error('渲染错误:', error);
    htmlContent.value = `<div class="error">渲染错误: ${error}</div>`;
    // 确保错误情况下也释放锁
    window._isRendering = false;
  }
};

// 添加自定义窗口渲染状态变量
// @ts-ignore
window._isRendering = false;

// 初始渲染一次
renderMarkdown();

// 添加防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

// 防抖后的渲染函数，用于按钮手动触发时也可以防止连续点击导致问题
const debouncedRenderMarkdown = debounce(renderMarkdown, 300);

const togglePreviewMode = () => {
  previewMode.value = !previewMode.value;
};
</script>

<template>
  <div class="markdown-editor" :class="{ 'preview-only': previewMode }">
    <div class="toolbar">
      <h2>Markdown编辑器</h2>
      <div class="toolbar-buttons">
        <button @click="debouncedRenderMarkdown" class="render-btn">渲染</button>
        <button @click="togglePreviewMode">{{ previewMode ? '编辑模式' : '预览模式' }}</button>
      </div>
    </div>
    <div class="editor-container">
      <div class="editor" :class="{ 'full-width': !previewMode }">
        <textarea v-model="markdownInput" placeholder="输入Markdown内容..."></textarea>
      </div>
      <div class="preview" :class="{ 'full-width': previewMode }">
        <div class="preview-content" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.toolbar-buttons {
  display: flex;
  gap: 10px;
}

.toolbar button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.render-btn {
  background-color: #2196F3;
}

.render-btn:hover {
  background-color: #0b7dda;
}

.toolbar button:hover {
  background-color: #45a049;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor {
  flex: 1;
  border-right: 1px solid #ddd;
}

textarea {
  width: 100%;
  height: 100%;
  padding: 15px;
  border: none;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
}

.preview {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #fff;
}

.preview-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
}

.preview-only .editor {
  display: none;
}

.full-width {
  flex: 2;
}

/* Markdown 样式 */
.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4),
.preview-content :deep(h5),
.preview-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.preview-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.preview-content :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.preview-content :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.preview-content :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

.preview-content :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.preview-content :deep(pre code) {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 0;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffeeee;
  border-radius: 4px;
  border: 1px solid #ffcccc;
}
</style>