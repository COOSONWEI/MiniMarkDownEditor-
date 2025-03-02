// 行内状态机

import {Token} from "../../tokens/token";
import {LexerState} from "./index";


/**
 * 行级规则基础类
 */
export abstract class InlineRule {
  priority: number = 0;
  state: LexerState;

  abstract match(text: string, tokens: Token[],position: number): boolean;

  abstract execute(text: string, tokens: Token[],position: number): void;

  abstract createNewToken(nesting: 1 | 0 | -1): Token;
}