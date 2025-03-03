import { Token, TokenType } from "../../../tokens/token";
import { InlineRule } from "../state";
import { InlineParser, LexerState } from "../index";
import { RULE_PRIORITIES } from "../../../command/priority";

/**
 * 加粗规则
 * @Author simms
 */
export class StrongRule extends InlineRule {
  priority = RULE_PRIORITIES.STRONG;
  state = LexerState.IN_STRONG;


  match(text: string, tokens: Token[], position: number): boolean {
    // 检查是否有两个连续的星号，并且不是转义字符
    if (position > 0 && text[position - 1] === '\\') {
      return false; // 转义字符，不匹配
    }
    console.log('当前 text 是', text);
    console.log('匹配加粗规则 结果是', text[position] === '*' && text[position + 1] === '*');
    return text[position] === '*' && text[position + 1] === '*';
  }

  execute(text: string, tokens: Token[], position: number): void {
    // 获取当前解析器实例
    const parser = this.getParser();
    const parserState = parser.getParserState();
    
    const start = position;
    parserState.advance(2); // 前进2个字符
    
    // 检查当前状态，如果已经在加粗状态中，则关闭加粗标签
    // 否则，打开新的加粗标签
    if (parser.getCurrentState() === LexerState.IN_STRONG) {
      parserState.travelState(LexerState.IN_STRONG);
      tokens.push(this.createNewToken(-1, start, start + 2));
    } else {
      // 确保在打开新标签前刷新文本缓冲区
      parserState.flushTextBuffer();
      parserState.pushState(LexerState.IN_STRONG);
      console.log('打开加粗标签', parserState.getCurrentState());
      tokens.push(this.createNewToken(1, start, start + 2));
    }
  }

  createNewToken(nesting: 1 | 0 | -1, start: number, end: number) {
    return new Token({
      type: nesting === -1 ? TokenType.STRONG_CLOSE : TokenType.STRONG_OPEN,
      nesting: nesting,
      map: [start, end],
      content: "**",
      tag: 'strong'
    });
  }
}
