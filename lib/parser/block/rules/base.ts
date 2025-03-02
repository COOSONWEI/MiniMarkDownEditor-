
/**
 * 块级解析规则基类
 */

import { Token } from "..";
import { TokenType } from "../../../tokens/token";
import { InlineParser } from "../../inline";
import { BlockRule } from "../state";
import {StrongRule} from "../../inline/rules/strong";
import { EmRule } from "../../inline/rules/em";
import { DelRule } from "../../inline/rules/del";

export abstract class BaseBlockRule extends BlockRule {
    protected constructor(priority: number) {
      super({ priority });
    }
  
    // 内联解析
    public parseInlineContent(text: string): Token[] {
        // TODO: 后续需要改为独立的内联解析器
      const inlineParser = new InlineParser();
      const strongRule = new StrongRule();
      inlineParser.registerRule(strongRule);
      inlineParser.registerRule(new EmRule());
      inlineParser.registerRule(new DelRule());
      console.log('当前处理的内联文本为：' + text);
      return inlineParser.parseInline(text);
      // return [new Token({ type: TokenType.INLINE, content: text, children: [new Token({type: TokenType.TEXT, content: text})]})];
    }
  }