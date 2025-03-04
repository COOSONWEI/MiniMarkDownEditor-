
import { Token, TokenType } from "../../../tokens/token";
import { InlineRule } from "../state";
import { RULE_PRIORITIES } from "../../../command/priority";
import { LexerState } from "..";


export class TextRule extends InlineRule {
    priority = RULE_PRIORITIES.TEXT || 0; // 设置最低优先级，确保其他规则优先处理
    state = LexerState.DEFAULT;

    match(text: string, tokens: Token[], position: number): boolean {
        // 文本规则总是匹配，因为它处理所有未被其他规则处理的字符
        return true;
    }

    execute(text: string, tokens: Token[], position: number): void {
        const parser = this.getParser();
        const parserState = parser.getParserState();
        const char = text[position];

        // 处理转义字符
        if (char === '\\') {
            if (position + 1 < text.length) {
                const nextChar = text[position + 1];
                const specialChars = ['*', '_', '~', '`', '\\', '[', ']', '(', ')', '#', '+', '-', '.', '!', '|'];
                
                if (specialChars.includes(nextChar)) {
                    parserState.addToBuffer(nextChar);
                    parserState.advance(2); // 跳过转义字符和被转义的字符
                    return;
                }
            }
        }

        // 处理普通文本字符
        parserState.addToBuffer(char);
        parserState.advance(1);
    }

    createNewToken(nesting: 1 | 0 | -1, start: number, end: number): Token {
        return new Token({
            type: TokenType.TEXT,
            content: "",
            map: [start, end]
        });
    }
}