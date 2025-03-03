// import { MarkdownParser } from "../lib/core/parser";
// import { RendererManager, RendererType } from "../lib/core/renderer/rendererManager";
// import { Token, TokenType } from "../lib/tokens/token";
// import * as fs from 'fs';
// import * as path from 'path';

// describe('Markdown解析器和HTML渲染器综合测试', () => {
//   const parser = new MarkdownParser();
//   const rendererManager = new RendererManager();

//   // 辅助函数：解析并渲染Markdown文本
//   function parseAndRender(markdown: string) {
//     const tokens = parser.parse(markdown);
//     const html = rendererManager.renderWith(RendererType.HTML, tokens);
//     return { tokens, html };
//   }

//   // 测试段落解析和渲染
//   test('段落解析和渲染', () => {
//     const markdown = "这是第一个段落\n\n这是第二个段落";
//     const { tokens, html } = parseAndRender(markdown);
//     console.log('段落的tokens: ', tokens);
//     console.log('paragraph html: ', html);
//     // 验证tokens
//     expect(tokens.length).toBe(6); // 2个段落，每个段落3个token (open, text, close)
//     expect(tokens[0].type).toBe(TokenType.PARAGRAPH_OPEN);
//     expect(tokens[1].type).toBe(TokenType.TEXT);
//     expect(tokens[1].content).toBe("这是第一个段落");
//     expect(tokens[2].type).toBe(TokenType.PARAGRAPH_CLOSE);

//     // 验证HTML输出
//     expect(html).toBe("<p>这是第一个段落</p>\n<p>这是第二个段落</p>\n");

//   });

//   // 测试标题解析和渲染
//   test('标题解析和渲染', () => {
//     const markdown = "# 一级标题\n## 二级标题\n### 三级标题";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证tokens
//     expect(tokens.length).toBe(9); // 3个标题，每个标题3个token (open, text, close)
//     expect(tokens[0].type).toBe(TokenType.HEADING_OPEN);
//     expect(tokens[0].tag).toBe('h1');
//     expect(tokens[1].content).toBe("一级标题");

//     // 验证HTML输出
//     expect(html).toContain("<h1>一级标题</h1>");
//     expect(html).toContain("<h2>二级标题</h2>");
//     expect(html).toContain("<h3>三级标题</h3>");
//   });

//   // 测试行内格式解析和渲染
//   // test('行内格式解析和渲染', () => {
//   //   const markdown = "这是**粗体**文本，这是*斜体*文本，这是~~删除线~~文本";
//   //   const { tokens, html } = parseAndRender(markdown);

//   //   // 验证HTML输出
//   //   expect(html).toContain("<strong>粗体</strong>");
//   //   expect(html).toContain("<em>斜体</em>");
//   //   expect(html).toContain("<del>删除线</del>");
//   // });

//   // 测试列表解析和渲染
//   // test('列表解析和渲染', () => {
//   //   const markdown = "- 项目1\n- 项目2\n  - 子项目1\n  - 子项目2";
//   //   const { tokens, html } = parseAndRender(markdown);

//   //   // 验证HTML输出
//   //   expect(html).toContain("<ul>");
//   //   expect(html).toContain("<li>项目1</li>");
//   //   expect(html).toContain("<li>项目2</li>");
//   // });

//   // 测试有序列表解析和渲染
//   // test('有序列表解析和渲染', () => {
//   //   const markdown = "1. 第一项\n2. 第二项\n3. 第三项";
//   //   const { tokens, html } = parseAndRender(markdown);

//   //   // 验证HTML输出
//   //   expect(html).toContain("<ol>");
//   //   expect(html).toContain("<li>第一项</li>");
//   //   expect(html).toContain("<li>第二项</li>");
//   //   expect(html).toContain("<li>第三项</li>");
//   // });

//   // 测试引用块解析和渲染
//   test('引用块解析和渲染', () => {
//     const markdown = ">这是一个引用\n>>这是嵌套引用";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<blockquote>");
//     expect(html).toContain("这是一个引用");
//     expect(html).toContain("这是嵌套引用");
//   });

//   // 测试水平线解析和渲染
//   test('水平线解析和渲染', () => {
//     const markdown = "上面的内容\n---\n下面的内容";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<hr>");
//     expect(html).toContain("<p>上面的内容</p>");
//     expect(html).toContain("<p>下面的内容</p>");
//   });

//   // 测试表格解析和渲染
//   test('表格解析和渲染', () => {
//     const markdown = "|标题1|标题2|\n|---|---|\n|内容1|内容2|";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<table>");
//     expect(html).toContain("<thead>");
//     expect(html).toContain("<tbody>");
//     expect(html).toContain("<tr>");
//     expect(html).toContain("<th>");
//     expect(html).toContain("<td>");
//   });

//   // 测试复杂嵌套内容
//   // test('复杂嵌套内容解析和渲染', () => {
//   //   const markdown = "# 带有**粗体**和*斜体*的标题\n\n> 引用中的**粗体**文本\n\n- 列表项中的*斜体*文本\n- 包含~~删除线~~的列表项";
//   //   const { tokens, html } = parseAndRender(markdown);

//   //   // 验证HTML输出
//   //   expect(html).toContain("<h1>带有<strong>粗体</strong>和<em>斜体</em>的标题</h1>");
//   //   expect(html).toContain("<blockquote>\n<p>引用中的<strong>粗体</strong>文本</p>\n</blockquote>");
//   //   expect(html).toContain("<li>列表项中的<em>斜体</em>文本</li>");
//   //   expect(html).toContain("<li>包含<del>删除线</del>的列表项</li>");
//   // });

//   // 测试转义字符
//   test('转义字符解析和渲染', () => {
//     const markdown = "这是一个\\*星号\\*，而不是斜体";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("这是一个*星号*，而不是斜体");
//     expect(html).not.toContain("<em>");
//   });
// });