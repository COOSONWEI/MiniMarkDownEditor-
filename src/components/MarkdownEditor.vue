<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RendererManager, RendererType } from '../../lib/core/renderer/rendererManager';
// import { Token } from '../../lib/tokens/token';
import { MarkdownParser } from '../../lib/core/parser';

// 实例化解析器和渲染器
const parser = new MarkdownParser();
const rendererManager = new RendererManager();

// 定义状态
const markdownText = ref('');
const htmlPreview = ref('');
const isEditing = ref(true);

// 监听markdown文本变化，实时更新预览
watch(markdownText, (newValue) => {
  updatePreview(newValue);
});

// 更新预览内容
function updatePreview(markdown: string) {
  try {
    // 解析Markdown文本为Token数组
    const tokens = parser.parse(markdown);
    // 使用HTML渲染器渲染Token数组
    const html = rendererManager.renderWith(RendererType.HTML, tokens);
    htmlPreview.value = html;
  } catch (error) {
    console.error('渲染出错:', error);
    htmlPreview.value = `<div class="error">渲染错误: ${error}</div>`;
  }
}

// 切换编辑/预览模式
function toggleMode() {
  isEditing.value = !isEditing.value;
}

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里加载默认内容或从本地存储恢复之前的编辑内容
  markdownText.value = '# 欢迎使用 Markdown 编辑器\n\n这是一个简单的 Markdown 编辑器示例。\n\n## 功能特点\n\n- 实时预览\n- 支持基本 Markdown 语法\n- 分屏显示';
  updatePreview(markdownText.value);
});
</script>

<template>
  <div class="markdown-editor">
    <div class="toolbar">
      <h2>Markdown 编辑器</h2>
      <button @click="toggleMode">{{ isEditing ? '预览模式' : '编辑模式' }}</button>
    </div>
    
    <div class="editor-container" :class="{ 'preview-only': !isEditing }">
      <!-- 编辑区域 -->
      <div class="editor" v-show="isEditing">
        <textarea 
          v-model="markdownText" 
          placeholder="在这里输入Markdown文本..."
          spellcheck="false"
        ></textarea>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview" :class="{ 'full-width': !isEditing }">
        <div class="preview-content" v-html="htmlPreview"></div>
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

.toolbar button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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