import { FSM } from "../lib/core/fsm/fsm";
import { ParserEvent, ParserState } from "../lib/core/fsm/state";
import { MarkdownParser } from "../lib/core/parser";
import { RendererManager } from "../lib/core/renderer/rendererManager";
import { Token, TokenType } from "../lib/tokens/token";
import * as fs from 'fs';
import * as path from 'path';

/**
 * 编写测试段落和空行的用例
 */
describe('MarkdownParser', () => {
  const parser = new MarkdownParser();
  const render = new RendererManager();

  /**
   * 状态机测试
   */
  test('从初始状态到段落状态的转换', () => {
    const fsm = new FSM(ParserState.INITIAL); // 使用字符串状态

    console.log(`Initial FSM State: ${fsm.getState()}`); // "INITIAL"

    fsm.trigger(ParserEvent.HEADING_MARKER);
    console.log(`After #: ${fsm.getState()}`); // "HEADING_1"

    fsm.trigger(ParserEvent.EMPTY_LINE);
    console.log(`After empty line: ${fsm.getState()}`); // "INITIAL"
  });


  // 读取 MD 文件内容
  function readMdFile(fileName: string): string {
    const filePath = path.join(__dirname, 'md-fixtures', fileName);
    return fs.readFileSync(filePath, 'utf8');
  }

  // 段落测试
  test('段落解析', () => {
    const mdContent = readMdFile('paragraphs.md');
    const tokens = parser.parse(mdContent);
    const renderResult = render.render(tokens);

    // console.log('p tokens:', tokens);
    // console.log('P renderResult ', renderResult);
    // 验证 Tokens
    expect(tokens).toEqual([
      new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
      new Token({ type: TokenType.TEXT, content: 'Hello World' }),
      new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
      new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
      new Token({ type: TokenType.TEXT, content: 'This is a paragraph' }),
      new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
      new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
      new Token({ type: TokenType.TEXT, content: '第二个内容' }),
      new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
    ])
  })

  // 标题测试
  test('标题解析', () => {
    const mdContent = readMdFile('headings.md');
    const tokens = parser.parse(mdContent);
    console.log('h tokens:', tokens);
    // const renderResult = render.render(tokens);
    // console.log('H renderResult ', renderResult);
    expect(tokens).toEqual([
      // h1
      new Token({ type: TokenType.HEADING_OPEN, tag: 'h1', nesting: 1, block: true }),
      new Token({ type: TokenType.TEXT, content: 'h1 Heading' }),
      new Token({ type: TokenType.HEADING_CLOSE, tag: 'h1', nesting: -1, block: true }),
      // h2
      new Token({ type: TokenType.HEADING_OPEN, tag: 'h2', nesting: 1, block: true }),
      new Token({ type: TokenType.TEXT, content: 'h2 Heading' }),
      new Token({ type: TokenType.HEADING_CLOSE, tag: 'h2', nesting: -1, block: true }),
      // h3到h6同理
      ...[3,4,5,6].map(level => ([ 
        new Token({ type: TokenType.HEADING_OPEN, tag: `h${level}`, nesting: 1, block: true }),
        new Token({ type: TokenType.TEXT, content: `h${level} Heading` }),
        new Token({ type: TokenType.HEADING_CLOSE, tag: `h${level}`, nesting: -1, block: true })
      ])).flat()
    ]);
  })


  test('列表解析测试', () => {
    const input = '- Item 1\n- Item 2\n\n1. First\n2. Second';
    const tokens = parser.parse(input);

    // 验证生成的Token数量
    expect(tokens.length).toBeGreaterThan(0);

    // 验证列表项的Token类型
    const listItemTokens = tokens.filter(t => t.type === TokenType.LIST_ITEM_OPEN);
    expect(listItemTokens.length).toBe(4); // 应该有4个列表项
    const html = render.render(tokens);
    // console.log('list tokens:', tokens);
    // console.log('list renderResult \n ', html);
    // 验证渲染结果
    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');
    expect(html.match(/<li>/g)!.length).toBe(4); // 应该有4个列表项
  });

  test('引用块解析测试', () => {
    const input = readMdFile('quote.md');
    const tokens = parser.parse(input);
    // console.log('blockquote tokens:', tokens);
    const html = render.render(tokens);
    // console.log('blockquote renderResult \n ', html);
  });
  

  // // 表格测试
  test('表格解析', () => {
    const mdContent = readMdFile('table.md');
    const tokens = parser.parse(mdContent);
    const renderResult = render.render(tokens);
    console.log('table tokens:', tokens);
    console.log('Table renderResult \n ', renderResult);
  })

  //   test('非token间嵌套加粗解析', () => {
  //     const input = readMdFile('inlineTest.md');
  //     const tokens = parser.parse(input);
  //     console.log(input, ' inline token is', tokens);
  // })

  // test('文本规则解析', () => {
  //   const mdContent = readMdFile('textRule.md');
  //   const tokens = parser.parse(mdContent);
  //   const renderResult = render.render(tokens);

  //   console.log('text rule tokens:', tokens);
  //   console.log('text rule renderResult:', renderResult);

  //   // 验证 Tokens
  //   expect(tokens).toEqual([
  //     new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
  //     new Token({ type: TokenType.TEXT, content: '这是一个普通文本。' }),
  //     new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
  //     new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
  //     new Token({ type: TokenType.TEXT, content: '这里有一些转义字符：* _ ~ ` \\ [ ] ( ) # + - . ! |' }),
  //     new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
  //     new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
  //     new Token({ type: TokenType.TEXT, content: '这是一个没有转义的' }),
  //     new Token({ type: TokenType.EM_OPEN, tag: 'em', nesting: 1, content: '*' }),
  //     new Token({ type: TokenType.TEXT, content: '斜体' }),
  //     new Token({ type: TokenType.EM_CLOSE, tag: 'em', nesting: -1, content: '*' }),
  //     new Token({ type: TokenType.TEXT, content: '文本。' }),
  //     new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }),
  //   ]);
  // });
});


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
//   test('行内格式解析和渲染', () => {
//     const markdown = "这是**粗体**文本，这是*斜体*文本，这是~~删除线~~文本";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<strong>粗体</strong>");
//     expect(html).toContain("<em>斜体</em>");
//     expect(html).toContain("<del>删除线</del>");
//   });

//   // 测试列表解析和渲染
//   test('列表解析和渲染', () => {
//     const markdown = "- 项目1\n- 项目2\n  - 子项目1\n  - 子项目2";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<ul>");
//     expect(html).toContain("<li>项目1</li>");
//     expect(html).toContain("<li>项目2</li>");
//   });

//   // 测试有序列表解析和渲染
//   test('有序列表解析和渲染', () => {
//     const markdown = "1. 第一项\n2. 第二项\n3. 第三项";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<ol>");
//     expect(html).toContain("<li>第一项</li>");
//     expect(html).toContain("<li>第二项</li>");
//     expect(html).toContain("<li>第三项</li>");
//   });

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
//   test('复杂嵌套内容解析和渲染', () => {
//     const markdown = "# 带有**粗体**和*斜体*的标题\n\n> 引用中的**粗体**文本\n\n- 列表项中的*斜体*文本\n- 包含~~删除线~~的列表项";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("<h1>带有<strong>粗体</strong>和<em>斜体</em>的标题</h1>");
//     expect(html).toContain("<blockquote>\n<p>引用中的<strong>粗体</strong>文本</p>\n</blockquote>");
//     expect(html).toContain("<li>列表项中的<em>斜体</em>文本</li>");
//     expect(html).toContain("<li>包含<del>删除线</del>的列表项</li>");
//   });

//   // 测试转义字符
//   test('转义字符解析和渲染', () => {
//     const markdown = "这是一个\\*星号\\*，而不是斜体";
//     const { tokens, html } = parseAndRender(markdown);

//     // 验证HTML输出
//     expect(html).toContain("这是一个*星号*，而不是斜体");
//     expect(html).not.toContain("<em>");
//   });
// });