
/**
 * 块级解析规则基类
 */

import { Token } from "..";
import { TokenType } from "../../../tokens/token";
import { BlockRule } from "../state";

export abstract class BaseBlockRule extends BlockRule {
    protected constructor(priority: number) {
      super({ priority });
    }
  
    // 内联解析
    protected parseInlineContent(text: string): Token[] {
        // TODO: 后续需要改为独立的内联解析器
      return [new Token({ type: TokenType.INLINE, content: text, children: [new Token({type: TokenType.TEXT, content: text})]})];
    }
  }