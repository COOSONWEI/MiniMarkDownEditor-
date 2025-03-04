/**
 * 无序列表规则
 *
 * @author COOSONWEI
 */


import { RULE_PRIORITIES } from "../../../command/priority";
import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class ListRule extends BaseBlockRule {
    private unorderedRegex = /^([ \t]*)([-\*\+])\s+(.*)/;
    private orderedRegex = /^([ \t]*)(\d+)\.\s+(.*)/;
    private static regex = /^[\-\*\+]\s+(.*)/; // 正则表达式
    private static MAX_NESTING_LEVEL = 5; // 最大嵌套层级

    constructor() {
        super(RULE_PRIORITIES.LIST); // p<list<h
    }


    match(line: string, ctx: ParsingContext): boolean {
        // 如果已经达到最大嵌套层级，不再匹配新的列表项
        if (ctx.currentListLevel >= ListRule.MAX_NESTING_LEVEL) {
            return false;
        }
        return this.unorderedRegex.test(line) || this.orderedRegex.test(line);
    }


    execute(line: string, ctx: ParsingContext): Token[] {
        const tokens: Token[] = [];
        const trimmedLine = line.trim();
        
      
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
        ctx.setListActive(true)

       
        if (trimmedLine.length === 0 && ctx.isListActive) {
            ctx.setListActive(false);
            tokens.push(
                new Token({
                type: TokenType.LIST_CLOSE,
                tag: isOrdered ? 'ol' : 'ul',
                nesting: -1,
                block: true,
                  level: ctx.currentListLevel
            }));
            return tokens;
        }

        // 处理列表层级变化，确保不会超过最大层级
        if (currentLevel > 0) {
            // 如果缩进小于等于当前层级的缩进，关闭当前层级
            while (currentLevel > 0 && indent <= ctx.getCurrentListIndent() && ctx.currentListLevel > 0) {
                ctx.leaveListLevel();
                tokens.push(
                    new Token({
                        type: TokenType.LIST_CLOSE,
                        tag: isOrdered ? 'ol' : 'ul',
                        nesting: -1,
                        block: true,
                        level: ctx.currentListLevel
                    })
                );
            }
        }

        // 只有在未达到最大层级时才创建新的列表层级
        if (currentLevel < ListRule.MAX_NESTING_LEVEL && 
            (currentLevel === 0 || indent > ctx.getCurrentListIndent())) {
            ctx.enterListLevel(indent);
            tokens.push(
                new Token({
                    type: TokenType.LIST_OPEN,
                    tag: isOrdered ? 'ol' : 'ul',
                    nesting: 1,
                    block: true,
                    level: currentLevel
                })
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