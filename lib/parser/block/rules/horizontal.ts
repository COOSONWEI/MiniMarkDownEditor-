import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class HorizontalRule extends BaseBlockRule {
    private static regex = /^(?:\*\*\*+|---+)$/; // 匹配至少三个*或-

    constructor() {
        super(13); // 优先级高于段落(10)但低于列表(14)
    }

    match(line: string, ctx: ParsingContext): boolean {
        return HorizontalRule.regex.test(line.trim()) 
    }

    execute(line: string, ctx: ParsingContext): Token[] {
        // 重置上下文状态
        ctx.setInParagraph(false);
        ctx.setListActive(false);
        ctx.setHeadingActive(false);

        return [
            new Token({
                type: TokenType.HORIZONTAL_RULE,
                tag: 'hr',
                nesting: 0, // 自闭合标签
                block: true,
                markup: line[0].repeat(3) // 保留原始符号
            })
        ];
    }
}
