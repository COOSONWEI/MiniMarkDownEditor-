// 行内解析器功能实现

import {Token, TokenType} from "../../tokens/token";
import {InlineRule} from "./state";

/**
 * 加粗规则（待解决多tokens嵌套问题）
 * @Author simms
 */
export enum LexerState {
    DEFAULT = 'DEFAULT',
    IN_STRONG = 'IN_STRONG',
    IN_EM = 'IN_EM',
    IN_DEL = 'IN_DEL',
    IN_IMAGE = 'IN_IMAGE',
    IN_LINK = 'IN_LINK'
}

export class InlineParser {
    private rules: InlineRule[] = [];   // lexer状态
    public static buffer: string[] = [];  // 文本流
    public static tokens: Token[] = []; // tokens结果
    public static position = 0; // 当前位置

    public static state: LexerState[] = [];

    public static getCurrentState(): LexerState {
        return InlineParser.state[InlineParser.state.length - 1];
    }

    public static travelState(state: LexerState): boolean {
        for (let i = state.length - 1; i >= 0; i--) {
            if (InlineParser.state[i] === state) {
                InlineParser.state.splice(i, 1);
                return true;
            }
        }
        return false;
    }


    public registerRule(rule: InlineRule): void {
        this.rules.push(rule);
        this.rules.sort((a, b) => b.priority - a.priority); // 按优先级排序
    }

    public parseInline(text: string): Token[] {
        return this.lexer(text);
    }

    private lexer(text: string): Token[] {
        while (InlineParser.position < text.length) {
            let isSpecial = false
            for (const rule of this.rules) {
                if (rule.match(text, InlineParser.tokens, InlineParser.position)) {
                    isSpecial = true;
                    InlineParser.flushTextBuffer();
                    rule.execute(text, InlineParser.tokens, InlineParser.position);
                    break;
                }
            }
            if (!isSpecial) {
                InlineParser.buffer.push(text[InlineParser.position]);
                if (InlineParser.getCurrentState() !== LexerState.DEFAULT) {
                    InlineParser.state.push(LexerState.DEFAULT);
                }
                InlineParser.position++;
            }
        }
        console.log("目前的state为：" + InlineParser.state);
        this.solveRestState();
        return InlineParser.tokens;
    }

    public static flushTextBuffer(): void {
        if (InlineParser.buffer.length > 0) {
            this.tokens.push(new Token({
                type: TokenType.TEXT,
                content: InlineParser.buffer.join(''),
            }))
            InlineParser.buffer = [];
        }
        return;
    }

    private solveRestState(): void {
        for (let i = InlineParser.state.length - 1; i >= 0; i--) {
            if (InlineParser.state[i] === LexerState.DEFAULT) {
                InlineParser.state.splice(i, 1);
            }
        }
        console.log("solveRestState中的" + InlineParser.state);
        this.seekUnclosedToken();
    }

    // 将tokens当做缓存，后续并入result的text
    private seekUnclosedToken(): void {
        let i = InlineParser.state.length - 1;
        while (i >= 0) {
            const stateItem = InlineParser.state[i];
            if (!stateItem) {
                i--;
                continue;
            }
            let found = false;
            for (let j = InlineParser.tokens.length - 1; j >= 0; j--) {
                if (InlineParser.state.length === 0) {
                    return;
                }
                const tokenType = InlineParser.tokens[j].type.toLowerCase();
                const target = stateItem.toLowerCase().substring(3) + "_open";
                if (target === tokenType) {
                    InlineParser.tokens[j].type = TokenType.TEXT;
                    InlineParser.state.pop();
                    console.log(InlineParser.state);
                    found = true;
                    break;
                }
            }
            i = found ? InlineParser.state.length - 1 : i - 1;
        }
    }
}
