import {InlineRule} from "../state";
import {Token, TokenType} from "../../../tokens/token";
import {InlineParser, LexerState} from "../index";
import { RULE_PRIORITIES } from "../../../command/priority";

/**
 * 删除线规则
 * @Author simms
 */
export class EmRule extends InlineRule {
    priority = RULE_PRIORITIES.EM;
    state = LexerState.IN_EM;

    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '*';
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
            parserState.pushState(LexerState.IN_EM);
            tokens.push(this.createNewToken(1, start, start + 1));
        }
        
    }

    createNewToken(nesting: 1 | 0 | -1, start: number, end: number) {
        return new Token({
            type: nesting === -1 ? TokenType.EM_CLOSE : TokenType.EM_OPEN,
            nesting: nesting,
            map: [start, end],
            content: "*"
        });
    }
}