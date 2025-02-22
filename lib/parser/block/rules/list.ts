/**
 * 无序列表规则
 *
 * @author COOSONWEI
 */


import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class ListRule extends BaseBlockRule {
    private static regex = /^[\-\*\+]\s+(.*)/; // 正则表达式
    private listStack: number[] = []; // 列表层级栈

    constructor() {
        super(14); // p<list<h
    }

    match(line: string, ctx: ParsingContext): boolean {
        const isList = ListRule.regex.test(line);
        const indent = line.search(/\S/); // 计算缩进
        console.log('ctx.isInParagraph:', ctx.isInParagraph);
        console.log('ctx.isListActive:', ctx.isListActive);
        // 处理空栈时的判断
        const lastIndent = this.listStack.at(-1) ?? -1;
        return isList && (indent > lastIndent || this.listStack.length === 0) && !ctx.isListActive;
    }
    

    execute(line: string, ctx: ParsingContext): Token[] {
        const indent = line.search(/\S/);
        const tokens: Token[] = [];
        console.log('执行 list 解析');
        
        // 状态标记
        ctx.setListActive(true);
        ctx.setInParagraph(false);
        ctx.setHeadingActive(false);

        // 处理层级变化
        while (this.listStack.length > 0 && indent < this.listStack.at(-1)) {
            this.listStack.pop();
            tokens.push(new Token({type: TokenType.list_close, tag: 'ul', nesting: -1}));
        }

        if (this.listStack.length === 0 || indent > this.listStack.at(-1)) {
            this.listStack.push(indent);
            tokens.push(new Token({type: TokenType.list_open, tag: 'ul', nesting: 1}));
        }

        // 非空判断
        const matchResult = line.match(ListRule.regex);
        if (!matchResult) {
            return [];
        }
        const content = matchResult[1];  // 增加 trim 处理首尾空格

        // 添加列表项
        tokens.push(
            new Token({type: TokenType.list_item_open, tag: 'li', nesting: 1}),
            new Token({  // 直接生成文本token
                type: TokenType.inline,
                content: content,
                children: this.parseInlineContent(content)  // 假设此方法解析内联元素
            }),
            new Token({type: TokenType.list_item_close, tag: 'li', nesting: -1})
        );

        return tokens;
    }

}