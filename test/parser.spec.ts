import { MarkdownParser } from "../lib/core/parser";
import { Token, TokenType } from "../lib/tokens/token";
import * as fs from 'fs';
import * as path from 'path';

/**
 * 编写测试段落和空行的用例
 */
describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  // 读取 MD 文件内容
  function readMdFile(fileName: string): string {
    const filePath = path.join(__dirname, 'md-fixtures', fileName);
    return fs.readFileSync(filePath, 'utf8');
}

  test('解析段落和空行', () => {
    const input = readMdFile('paragraphs.md');
    const tokens = parser.parse(input);
    // console.log('p token is',tokens);
    expect(tokens).toEqual([
      new Token({ type: TokenType.paragraph_open, tag: 'p', nesting: 1, block: true }),
      new Token({ type: TokenType.text, content: 'Hello World' }),
      new Token({ type: TokenType.paragraph_close, tag: 'p', nesting: -1, block: true  }),
      new Token({ type: TokenType.paragraph_open, tag: 'p', nesting: 1, block: true  }),
      new Token({ type: TokenType.text, content: 'This is a paragraph' }),
      new Token({ type: TokenType.paragraph_close, tag: 'p', nesting: -1, block: true })
    ]);
  });

  //标题测试
  test('解析标题', () => {
    
    const input = readMdFile('headings.md');
    const tokens = parser.parse(input);

    // console.log('heading tokens is',tokens);
    
    // 检查是否包含标题标记
    expect(tokens).toContainEqual(
      new Token({ type: TokenType.heading_open, tag: 'h1', nesting: 1, block: true }),
    );
  })

  // 列表测试
  test('解析列表', () => {
    const input = readMdFile('list.md');
    const tokens = parser.parse(input);
    console.log('list tokens is',tokens);

  })

});