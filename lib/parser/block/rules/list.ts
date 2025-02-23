/**
 * 无序列表规则
 *
 * @author COOSONWEI
 */


import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class ListRule extends BaseBlockRule {
    private unorderedRegex = /^([ \t]*)([-\*\+])\s+(.*)/;
    private orderedRegex = /^([ \t]*)(\d+)\.\s+(.*)/;
    private static regex = /^[\-\*\+]\s+(.*)/; // 正则表达式

    constructor() {
        super(14); // p<list<h
    }


    match(line: string, ctx: ParsingContext): boolean {
        return this.unorderedRegex.test(line) || this.orderedRegex.test(line);
    }


    execute(line: string, ctx: ParsingContext): Token[] {
        const tokens: Token[] = [];
        let match: RegExpMatchArray | null;
        let indent: number;
        let isOrdered: boolean;

        if ((match = line.match(this.unorderedRegex))) {
            indent = match[1].length;
            isOrdered = false;
        } else if ((match = line.match(this.orderedRegex))) {
            indent = match[1].length;
            isOrdered = true;
        } else {
            return [];
        }

        const content = match[3];
        const currentLevel = ctx.currentListLevel;

        // 处理列表层级变化
        while (
            currentLevel > 0 &&
            indent <= ctx.getCurrentListIndent()
        ) {
            ctx.leaveListLevel();
            tokens.push(
                new Token({
                    type: TokenType.LIST_CLOSE,
                    tag: isOrdered ? 'ol' : 'ul',
                    nesting: -1,
                    block: true,
                    level: currentLevel
                }
                )
            );
        }


        if (
            currentLevel === 0 ||
            indent > ctx.getCurrentListIndent()
        ) {
            ctx.enterListLevel(indent);
            tokens.push(
                new Token({
                    type: TokenType.LIST_OPEN,
                    tag: isOrdered ? 'ol' : 'ul',
                    nesting: -1,
                    block: true,
                    level: currentLevel
                }
                )
            );
        }

        // 添加列表项
        tokens.push(
            new Token({type: TokenType.LIST_ITEM_OPEN, tag: 'li', nesting: 1, block: true}),
            new Token({type: TokenType.TEXT, content: content.trim()}),
            new Token({type: TokenType.LIST_ITEM_CLOSE, tag: 'li', nesting: -1})
        );

        return tokens;
    }

}