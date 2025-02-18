import { MarkdownParser } from "../lib/core/parser";
import { Token, TokenType } from "../lib/tokens/token";


/**
 * 编写测试段落和空行的用例
 */
describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  test('解析段落和空行', () => {
    const input = `Hello World\n\nThis is a paragraph`;
    const tokens = parser.parse(input);
    console.log(tokens);
    expect(tokens).toEqual([
        new Token({ type: TokenType.paragraph_open, tag: 'p', level: 1 }),
        new Token({ type: TokenType.text,  content: 'Hello World' }),
        new Token({ type: TokenType.paragraph_close, tag: 'p', level: -1 }),
        new Token({ type: TokenType.paragraph_open, tag: 'p', level: 1 }),
        new Token({ type: TokenType.text,  content: 'This is a paragraph' }),
        new Token({ type: TokenType.paragraph_close, tag: 'p', level: -1 })
    ]);
  });
});