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

/**
 * 解析器基础类
 *
 * @author COOSONWEI
 */

export class MarkdownParser {
    private debug: boolean; // 是否开启调试模式


    private context = new ParsingContext();
    private blockParser = new BlockParser();


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
    }

    parse(markdown: string): Token[] {
        const lines = markdown.split('\n');
        const tokens: Token[] = [];
        this.context.setLines(lines); // 添加 lines 到 context   
        for (this.context.currentLine = 0; this.context.currentLine < lines.length; this.context.currentLine++) {
            const line = lines[this.context.currentLine];
            tokens.push(...this.parseLine(line));
        }


        return tokens;
    }

    // 解析行
    private parseLine(line: string): Token[] {

        const tokens = this.blockParser.parseLine(line, this.context);

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

    //自动补全未闭合的段落
    // private autoCloseOpenBlocks(tokens: Token[]): void {
    //     const openBlocks = new Map<Token, number>(); // 通过栈结构记录层级
      
    //     for (const token of tokens) {
    //       if (token.type === TokenType.PARAGRAPH_OPEN) {
    //         openBlocks.push(token);
    //       } else if (token.type === TokenType.PARAGRAPH_CLOSE) {
    //         if (openBlocks.length === 0) {
    //           console.warn(`Unexpected closing paragraph tag without matching open`);
    //         } else {
    //           openBlocks.pop();
    //         }
    //       }
    //     }
      
    //     // 补全剩余未闭合的块（按逆序闭合）
    //     while (openBlocks.length > 0) {
    //       const openToken = openBlocks.pop();
    //       // 添加错误日志（可选）
    //       console.warn(`Unclosed block detected:`, openToken);
      
    //       // 创建对应闭合标签
    //       const closeToken: Token = new Token({
    //         type: TokenType.PARAGRAPH_CLOSE,
    //         tag: openToken.tag,
    //         nesting: -1,
    //         block: true,
    //         // 可选：继承源位置的映射信息
    //         map: openToken.map ?? [openToken.map![0], tokens.length],
    //       });
      
    //       tokens.push(closeToken);
    //     }
    //   }
      
}
