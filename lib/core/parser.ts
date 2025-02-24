// 解析器

import { ParsingContext } from './state';
import { Token } from '../tokens/token';
import { BlockParser } from '../parser/block/state';
import { ParagraphRule } from '../parser/block/rules/paragraph';
import { EmptyLineRule } from '../parser/block/rules/empty';
import { HeadingRule } from '../parser/block/rules/heading';
import { ListRule } from '../parser/block/rules/list';
import { BlockQuoteRule } from '../parser/block/rules/quote';

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
        this.blockParser.registerRule(new ParagraphRule());
    }

    parse(markdown: string): Token[] {
        const lines = markdown.split('\n');
        const tokens: Token[] = [];

        for (this.context.currentLine = 0; this.context.currentLine < lines.length; this.context.currentLine++) {
            const line = lines[this.context.currentLine];
            tokens.push(...this.parseLine(line));
        }


        return tokens;
    }

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
}