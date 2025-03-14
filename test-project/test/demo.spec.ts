import { MarkdownParser, Token, TokenType } from "mini-markdown-parser";

describe('MarkdownParser from package', () => {
  test('should parse simple paragraph', () => {
    const parser = new MarkdownParser();
    const markdown = "Hello World";
    const tokens = parser.parse(markdown);
    
    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.PARAGRAPH_OPEN);
    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].content).toBe("Hello World");
    expect(tokens[2].type).toBe(TokenType.PARAGRAPH_CLOSE);
  });
});