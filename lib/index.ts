// mini-markdown-parser 库的入口文件

// 导出核心解析器
export { MarkdownParser } from "./core/parser";

// 导出渲染器相关
export { RendererManager, RendererType } from "./core/renderer/rendererManager";
export { BaseRenderer } from "./core/renderer/baseRenderer";
export { HtmlRenderer } from "./core/renderer/htmlRender";
export { CodeRenderer } from "./core/renderer/codeRenderer";

// 导出Token相关
export { Token, TokenType } from "./tokens/token";

// 导出其他可能需要的类型和接口
export { ParsingContext } from "./core/state";

// 整个 lib 的入口文件

import { MarkdownParser } from "./core/parser";

/**
 * 入口测试 - 仅在Node.js环境中执行
 */
// 检查是否在Node.js环境中
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  process.stdin.setEncoding('utf8');

  let input = '';

  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  
  process.stdin.on('end', () => {
    const parser = new MarkdownParser();
    const tokens = parser.parse(input);
    console.log(JSON.stringify(tokens, null, 2));
  });
}
