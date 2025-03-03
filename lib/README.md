# mini-markdown-parser

一个轻量级的Markdown解析和渲染库，支持基本的Markdown语法解析和多种渲染输出格式。

## 特性

- 轻量级设计，无外部依赖
- 支持基本Markdown语法（标题、列表、引用、表格等）
- 可扩展的渲染器系统，支持HTML和代码输出
- 基于TypeScript开发，提供完整类型定义
- 模块化设计，易于扩展和定制

## 安装

```bash
npm install mini-markdown-parser
# 或
yarn add mini-markdown-parser
```

## 基本使用

```typescript
import { MarkdownParser, RendererManager, RendererType } from 'mini-markdown-parser';

// 创建解析器实例
const parser = new MarkdownParser();

// 创建渲染器管理器
const rendererManager = new RendererManager();

// 解析Markdown文本
const markdown = '# 标题\n\n这是一个**粗体**文本';
const tokens = parser.parse(markdown);

// 使用HTML渲染器渲染
const html = rendererManager.renderWith(RendererType.HTML, tokens);
console.log(html);
// 输出: <h1>标题</h1><p>这是一个<strong>粗体</strong>文本</p>
```

## 高级用法

### 自定义渲染器

您可以创建自定义渲染器来满足特定的输出需求：

```typescript
import { BaseRenderer, Token, RendererType, RendererManager } from 'mini-markdown-parser';

// 创建自定义渲染器
class MyCustomRenderer extends BaseRenderer {
  constructor() {
    super();
    // 定义自定义渲染规则
    this.rules = {
      // 实现特定token的渲染逻辑
      // ...
    };
  }
}

// 注册自定义渲染器
const rendererManager = new RendererManager();
rendererManager.registerRenderer('custom' as RendererType, new MyCustomRenderer());

// 使用自定义渲染器
const html = rendererManager.renderWith('custom' as RendererType, tokens);
```

## API文档

### MarkdownParser

主要的解析器类，用于将Markdown文本解析为Token数组。

```typescript
const parser = new MarkdownParser({ debug?: boolean });
const tokens = parser.parse(markdownText);
```

### RendererManager

渲染器管理类，用于管理和使用不同类型的渲染器。

```typescript
const rendererManager = new RendererManager();

// 注册新渲染器
rendererManager.registerRenderer(type, rendererInstance);

// 设置默认渲染器
rendererManager.setDefaultRenderer(type);

// 使用特定渲染器渲染
const output = rendererManager.renderWith(type, tokens);

// 使用默认渲染器渲染
const output = rendererManager.render(tokens);
```

## 许可证

MIT