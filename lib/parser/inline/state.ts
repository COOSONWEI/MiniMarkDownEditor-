// 行内状态机

import {Token} from "../../tokens/token";
import {LexerState} from "./index";


/**
 * 行级规则基础类
 */
export abstract class InlineRule {
  priority: number = 0;
  state: LexerState;
  private parser: any; // InlineParser实例

  /**
   * 设置解析器实例
   * @param parser 解析器实例
   */
  setParser(parser: any): void {
    this.parser = parser;
  }

  /**
   * 获取解析器实例
   * @returns 解析器实例
   */
  getParser(): any {
    return this.parser;
  }

  abstract match(text: string, tokens: Token[],position: number): boolean;

  abstract execute(text: string, tokens: Token[],position: number): void;

  abstract createNewToken(nesting: 1 | 0 | -1, start: number, end: number): Token;
}

// 行内状态枚举
export enum InlineState {
  TEXT = 'text',         // 基础文本状态
  ESCAPE = 'escape',     // 转义字符处理
  STRONG_OPEN = 'strong_open', // 加粗开始
  STRONG_CLOSE = 'strong_close', // 加粗结束  
  EM_START = 'em_start', // 强调开始检测
  EM_END = 'em_end',     // 强调结束检测
  CODE = 'code'          // 行内代码块状态
}

export interface InlineContext {
  pos: number;            // 当前扫描位置
  state: InlineState;     // 当前状态
  buffer: string;         // 临时文本缓存
  tokens: Token[]; // 待生成Token
}