// 解析器

import { ParsingContext } from './state';
import { Token, TokenType } from '../tokens/token';
import { BlockParser } from '../parser/block/state';
import { ParagraphRule } from '../parser/block/rules/paragraph';
import { EmptyLineRule } from '../parser/block/rules/empty';
import { HeadingRule } from '../parser/block/rules/heading';
import { ListRule } from '../parser/block/rules/list';
import { BlockQuoteRule } from '../parser/block/rules/quote';
import { HorizontalRule } from '../parser/block/rules/horizontal';
import { TableRule } from '../parser/block/rules/table';
import {InlineParser} from "../parser/inline";
import {StrongRule} from "../parser/inline/rules/strong";
import {EmRule} from "../parser/inline/rules/em";
import {DelRule} from "../parser/inline/rules/del";
import {EscapeRule} from "../parser/inline/rules/escape";
/**
 * 解析器基础类
 *
 * @author COOSONWEI
 */

export class MarkdownParser {
    private debug: boolean; // 是否开启调试模式


    private context = new ParsingContext();
    private blockParser = new BlockParser();
    private inlineParser = new InlineParser();

    constructor(options: { debug?: boolean } = {}) {
        this.debug = options.debug || false;
         // 注册规则
        this.blockParser.registerRule(new EmptyLineRule());
        this.blockParser.registerRule(new HeadingRule()); 
        this.blockParser.registerRule(new ListRule());
        this.blockParser.registerRule(new BlockQuoteRule());
        this.blockParser.registerRule(new HorizontalRule());
        this.blockParser.registerRule(new TableRule());
        this.blockParser.registerRule(new ParagraphRule());

        this.inlineParser.registerRule(new EscapeRule()); // 注册转义规则，必须放在最前面
        this.inlineParser.registerRule(new StrongRule());
        this.inlineParser.registerRule(new EmRule());
        this.inlineParser.registerRule(new DelRule());
    }

    parse(markdown: string): Token[] {
        const lines = markdown.split('\n');
        const tokens: Token[] = [];
        this.context.setLines(lines); // 添加 lines 到 context   
        for (this.context.currentLine = 0; this.context.currentLine < lines.length; this.context.currentLine++) {
            const line = lines[this.context.currentLine];
            tokens.push(...this.parseLine(line));
        }

        // 处理未闭合的段落
        if (this.context.isInParagraph) {
            tokens.push(new Token({
                type: TokenType.PARAGRAPH_CLOSE,
                tag: 'p',
                nesting: -1,
                block: true,
            }));
        }

        return tokens;
    }

    // 解析行
    private parseLine(line: string): Token[] {

        const tokens = this.blockParser.parseLine(line, this.context);
        // 解析行中的内联内容
        tokens.forEach((token) => {
            if (token.type === TokenType.INLINE) {
                // console.log('inline token content', token.content);
                token.children = this.inlineParser.parseInline(token.content ?? '');
                // console.log('inline token after', token);
                // console.log('inline Children token after', token.children);
            }
            if(token.type === TokenType.TEXT){
                // token.children = this.inlineParser.parseInline(token.content ?? '');
            }
        });
        
        // 调试输出
        if (this.debug) {
            console.log(`Line ${this.context.currentLine}:`, {
              line,
              state: this.context.currentState,
              tokens
            });
        }
        
        return tokens;
    }

    public testInline(text: string): Token[] {
        return this.inlineParser.parseInline(text);
    }
      
}
