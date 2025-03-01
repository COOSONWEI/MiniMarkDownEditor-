import {InlineRule} from "../state";
import {Token, TokenType} from "../../../tokens/token";
import {InlineParser, LexerState} from "../index";

/**
 * 斜体规则
 * @Author simms
 */
export class DelRule extends InlineRule {
    priority = 80;
    state = LexerState.IN_DEL;

    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '~' && text[position + 1] === '~';
    }

    execute(text: string, tokens: Token[], position: number): void {
        InlineParser.position += 2;
        if (InlineParser.travelState(this.state)) {
            InlineParser.tokens.push(this.createNewToken(-1))
        } else {
            InlineParser.state.push(this.state);
            InlineParser.tokens.push(this.createNewToken(1)) // 问题所在
        }
        return;
    }

    createNewToken(nesting: 1 | 0 | -1): Token {
        return new Token({
            type: nesting === -1 ? TokenType.DEL_CLOSE : TokenType.DEL_OPEN,
            nesting: nesting,
            map: [InlineParser.position - 2, InlineParser.position - 1],
            content: "~~"
        });
    }
}