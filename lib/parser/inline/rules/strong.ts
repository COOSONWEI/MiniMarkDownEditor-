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
    return text[position] === '*' && text[position + 1] === '*'
  }

  execute(text: string, tokens: Token[], position: number): void {
    // 获取当前解析器实例
    const parser = this.getParser();
    const parserState = parser.getParserState();
    
    const start = position;
    parserState.advance(2); // 前进2个字符
    
    if (parser.getCurrentState() === LexerState.IN_STRONG) {
      parserState.travelState(LexerState.IN_STRONG);
      tokens.push(this.createNewToken(-1, start, start + 2));
    } else {
      parserState.pushState(LexerState.IN_STRONG);
      tokens.push(this.createNewToken(1, start, start + 2));
    }
  }

  createNewToken(nesting: 1 | 0 | -1, start: number, end: number) {
    return new Token({
      type: nesting === -1 ? TokenType.STRONG_CLOSE : TokenType.STRONG_OPEN,
      nesting: nesting,
      map: [start, end],
      content: "**"
    });
  }
}
