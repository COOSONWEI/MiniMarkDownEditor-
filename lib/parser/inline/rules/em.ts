import {InlineRule} from "../state";
import {Token, TokenType} from "../../../tokens/token";
import {InlineParser, LexerState} from "../index";

/**
 * 删除线规则
 * @Author simms
 */
export class EmRule extends InlineRule {
    priority = 60;
    state = LexerState.IN_EM;

    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '*';
    }

    execute(text: string, tokens: Token[], position: number): void {
        InlineParser.position++
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
            type: nesting === -1 ? TokenType.EM_CLOSE : TokenType.EM_OPEN,
            nesting: nesting,
            map: [InlineParser.position - 1, InlineParser.position - 1],
            content: "*"
        });
    }
}