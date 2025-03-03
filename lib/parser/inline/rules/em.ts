import {InlineRule} from "../state";
import {Token, TokenType} from "../../../tokens/token";
import {InlineParser, LexerState} from "../index";
import { RULE_PRIORITIES } from "../../../command/priority";

/**
 * 斜体规则
 * @Author simms
 */
export class EmRule extends InlineRule {
    priority = RULE_PRIORITIES.EM;
    state = LexerState.IN_EM;

    match(text: string, tokens: Token[], position: number): boolean {
        // 检查是否是单个星号，并且不是转义字符
        if (position > 0 && text[position - 1] === '\\') {
            return false; // 转义字符，不匹配
        }
        // 确保不是两个连续的星号（那是加粗语法）
        return text[position] === '*' && (position + 1 >= text.length || text[position + 1] !== '*');
    }

    execute(text: string, tokens: Token[], position: number): void {
        // 获取当前解析器实例
        const parser = this.getParser();
        const parserState = parser.getParserState();
        
        const start = position;
        parserState.advance(1); // 前进1个字符
        
        if (parser.getCurrentState() === LexerState.IN_EM) {
            parserState.travelState(LexerState.IN_EM);
            tokens.push(this.createNewToken(-1, start, start + 1));
        } else {
            // 确保在打开新标签前刷新文本缓冲区
            parserState.flushTextBuffer();
            parserState.pushState(LexerState.IN_EM);
            tokens.push(this.createNewToken(1, start, start + 1));
        }
    }

    createNewToken(nesting: 1 | 0 | -1, start: number, end: number) {
        return new Token({
            type: nesting === -1 ? TokenType.EM_CLOSE : TokenType.EM_OPEN,
            nesting: nesting,
            map: [start, end],
            content: "*",
            tag: 'em'
        });
    }
}