import { FSM } from "../lib/core/fsm/fsm";
import { ParserEvent, ParserState } from "../lib/core/fsm/state";
import { MarkdownParser } from "../lib/core/parser";
import { ParsingContext } from "../lib/core/state";
import { BlockParser } from "../lib/parser/block/state";
import { Token, TokenType } from "../lib/tokens/token";
import * as fs from 'fs';
import * as path from 'path';

/**
 * 编写测试段落和空行的用例
 */
describe('MarkdownParser', () => {
  const parser = new MarkdownParser();


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
    console.log('p tokens:', tokens);
  })
});