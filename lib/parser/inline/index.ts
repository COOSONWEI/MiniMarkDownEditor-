// 行内解析器功能实现

import {Token, TokenType} from "../../tokens/token";
import { InlineParserState } from "./parserState";
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

// TODO: 解决多tokens嵌套问题

export class InlineParser {
    private rules: InlineRule[] = [];   // 解析规则列表
    private parserState: InlineParserState; // 解析器状态管理

    constructor() {
        this.parserState = new InlineParserState();
    }

    /**
     * 获取当前状态
     * @returns 当前状态
     */
    public getCurrentState(): LexerState {
        return this.parserState.getCurrentState();
    }

    /**
     * 尝试离开指定状态
     * @param state 要离开的状态
     * @returns 是否成功离开状态
     */
    public travelState(state: LexerState): boolean {
        return this.parserState.travelState(state);
    }


    /**
     * 注册解析规则
     * @param rule 要注册的规则
     */
    public registerRule(rule: InlineRule): void {
        rule.setParser(this); // 设置解析器实例引用
        this.rules.push(rule);
        this.rules.sort((a, b) => b.priority - a.priority); // 按优先级排序
    }

    /**
     * 解析行内内容
     * @param text 要解析的文本
     * @returns 解析后的Token数组
     */
    public parseInline(text: string): Token[] {
        // 重置状态，确保每次解析都是从干净的状态开始
        this.parserState.reset();
        return this.lexer(text);
    }

    /**
     * 词法分析器
     * @param text 要分析的文本
     * @returns 分析后的Token数组
     */
    private lexer(text: string): Token[] {
        while (this.parserState.getPosition() < text.length) {
            let isSpecial = false;
            for (const rule of this.rules) {
                if (rule.match(text, this.parserState.getTokens(), this.parserState.getPosition())) {
                    isSpecial = true;
                    this.parserState.flushTextBuffer();
                    rule.execute(text, this.parserState.getTokens(), this.parserState.getPosition());
                    break;
                }
            }
            if (!isSpecial) {
                this.parserState.addToBuffer(text[this.parserState.getPosition()]);
                this.parserState.advance();
            }
        }
        
        // 处理未闭合的状态
        this.parserState.solveRestState();
        return this.parserState.getTokens();
    }

    /**
     * 获取解析器状态管理实例
     * @returns 解析器状态管理实例
     */
    public getParserState(): InlineParserState {
        return this.parserState;
    }
    
    /**
     * 设置解析器状态管理实例
     * @param state 新的状态管理实例
     */
    public setParserState(state: InlineParserState): void {
        this.parserState = state;
    }
}