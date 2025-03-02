import {InlineRule} from "../state";
import {Token, TokenType} from "../../../tokens/token";
import {InlineParser, LexerState} from "../index";
import { RULE_PRIORITIES } from "../../../command/priority";

/**
 * 斜体规则
 * @Author simms
 */
export class DelRule extends InlineRule {
    priority = RULE_PRIORITIES.DEL;
    state = LexerState.IN_DEL;

    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '~' && text[position + 1] === '~';
    }

    execute(text: string, tokens: Token[], position: number): void {
        // 获取当前解析器实例
        const parser = this.getParser();
        const parserState = parser.getParserState();
        
        const start = position;
        parserState.advance(2); // 前进2个字符
        
        if (parser.getCurrentState() === LexerState.IN_DEL) {
            parserState.travelState(LexerState.IN_DEL);
            tokens.push(this.createNewToken(-1, start, start + 2));
        } else {
            parserState.pushState(LexerState.IN_DEL);
            tokens.push(this.createNewToken(1, start, start + 2));
        }
        
    }

    createNewToken(nesting: 1 | 0 | -1, start: number, end: number) {
        return new Token({
            type: nesting === -1 ? TokenType.DEL_CLOSE : TokenType.DEL_OPEN,
            nesting: nesting,
            map: [start, end],
            content: "~~"
        });
    }
}