import { Token } from "..";
import { RULE_PRIORITIES } from "../../../command/priority";
import { ParsingContext } from "../../../core/state";
import { BaseBlockRule } from "./base";

/**
 * 标题规则
 *
 * @author COOSONWEI
 */

export class HeadingRule extends BaseBlockRule {

    private static regex = /^(#{1,6})(?=\s)(.*)/; // 正则表达式

    constructor() {
        super(RULE_PRIORITIES.HEADING); // 优先级高于段落
    }

    match(line: string, ctx: ParsingContext): boolean {
        // console.log('Heading match:', HeadingRule.regex.test(line), line);
    
        // TODO: 需要进行一些优化
        return HeadingRule.regex.test(line);

    }

    execute(line: string, ctx: ParsingContext): Token[] {
        const trimmedLine = line.trim();
       
        const match = line.match(HeadingRule.regex)!;
        const level = Math.min(match[1].length, 6); // 最小就是 h6
        ctx.setInParagraph(false);
        ctx.setListActive(false);
        ctx.setHeadingActive(true);

        // if (trimmedLine.length === 0 && ctx.isHeadingActive) {
        //     ctx.setHeadingActive(false);
        //     return [
        //         new Token({
        //             type: `heading_close`,
        //             tag: `h${level}`,
        //             nesting: -1,
        //             block: true
        //         })
        //     ];
        // }

        return [
            new Token({
                type: `heading_open`,
                tag: `h${level}`,
                nesting: 1,
                block: true,
                level: ctx.indentLevel
            }),
            ...this.parseInlineContent(match[2].trim()), // 去除多余空格
            new Token({
                type: `heading_close`,
                tag: `h${level}`,
                nesting: -1,
                block: true,
                level: ctx.indentLevel
            })
        ];
    }
}