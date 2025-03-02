import {Token, TokenType} from "../../../tokens/token";
import {InlineRule} from "../state";
import {InlineParser, LexerState} from "../index";

/**
 * 加粗规则
 * @Author simms
 */
export class StrongRule extends InlineRule {
    priority = 70;
    state = LexerState.IN_STRONG;


    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '*' && text[position + 1] === '*'
    }

    execute(text: string, tokens: Token[], position: number): void {
        InlineParser.position += 2;
        if (InlineParser.travelState(this.state)) {
            InlineParser.tokens.push(this.createNewToken(-1))
        } else {
            InlineParser.state.push(this.state);
            InlineParser.tokens.push(this.createNewToken(1))
        }
    }

    createNewToken(nesting: 1 | 0 | -1): Token {
        return new Token(
            {
                type: nesting === -1 ? TokenType.STRONG_CLOSE : TokenType.STRONG_OPEN,
                nesting: nesting,
                map: [InlineParser.position - 2, InlineParser.position - 1],
                content: "**"
            });
    }
}
