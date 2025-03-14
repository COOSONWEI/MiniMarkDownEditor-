import { FSM } from "../core/fsm/fsm";
import { ParserEvent, ParserState } from "../core/fsm/state";
import { MarkdownParser } from "../core/parser";
import { RendererManager } from "../core/renderer/rendererManager";
import { Token, TokenType } from "../tokens/token";
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

  // // 标题测试
  // test('标题解析', () => {
  //   const mdContent = readMdFile('headings.md');
  //   const tokens = parser.parse(mdContent);
  //   const renderResult = render.render(tokens);

  //   console.log('h tokens:', tokens);
  //   console.log(
  //     'H renderResult ',
  //     renderResult
  //   );
  //   // 验证 Tokens
   
  // })

  // // 列表测试
  // test('列表解析', () => {
  //   const mdContent = readMdFile('list.md');
  //   const tokens = parser.parse(mdContent);
  //   // console.log('list tokens:', tokens);
  //   const renderResult = render.render(tokens);

  //   console.log('List tokens:', tokens);
  //   console.log(
  //     'List renderResult \n ',
  //     renderResult
  //   );
  // })
  // // 表格测试
  // test('表格解析', () => {
  //   const mdContent = readMdFile('table.md');
  //   const tokens = parser.parse(mdContent);
  //   console.log('table tokens:', tokens);
  //   const renderResult = render.render(tokens);
  //   console.log('table renderResult:', renderResult);
  //   // console.log('table tokens:', tokens);
  // })

});
