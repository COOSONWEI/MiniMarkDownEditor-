
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
    protected  inlineParser: InlineParser;

    // 内联解析
    public parseInlineContent(text: string): Token[] {
        
      // if (!this.inlineParser) {
      //   this.inlineParser = new InlineParser();
      //   this.inlineParser.registerRule(new StrongRule());
      //   this.inlineParser.registerRule(new EmRule());
      //   this.inlineParser.registerRule(new DelRule());
      // }
      // return this.inlineParser.parseInline(text);
      return [new Token({ type: TokenType.INLINE, content: text, children: [new Token({type: TokenType.TEXT, content: text})]})];
    }
  }