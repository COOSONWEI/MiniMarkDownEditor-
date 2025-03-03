import { Token, TokenType } from "../../../tokens/token";
import { InlineRule } from "../state";
import { InlineParser, LexerState } from "../index";
import { RULE_PRIORITIES } from "../../../command/priority";

/**
 * 转义字符规则
 * @Author simms
 */
export class EscapeRule extends InlineRule {
    priority = RULE_PRIORITIES.ESCAPE || 1000; // 设置最高优先级，确保转义字符优先处理
    state = LexerState.DEFAULT;

    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '\\' && position + 1 < text.length;
    }

    execute(text: string, tokens: Token[], position: number): void {
        // 获取当前解析器实例
        const parser = this.getParser();
        const parserState = parser.getParserState();
        
        // 跳过转义字符
        parserState.advance(1);
        
        // 将被转义的字符作为普通文本添加到缓冲区
        if (position + 1 < text.length) {
            parserState.addToBuffer(text[position + 1]);
            parserState.advance(1);
        }
    }

    createNewToken(nesting: 1 | 0 | -1, start: number, end: number): Token {
        // 这个方法在当前规则中不会被使用，因为我们直接将转义后的字符添加到缓冲区
        return new Token({
            type: TokenType.TEXT,
            content: "",
            map: [start, end]
        });
    }
}