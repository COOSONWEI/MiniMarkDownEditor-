
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
import { EscapeRule } from "../../inline/rules/escape";
import { TextRule } from "../../inline/rules/text";

export abstract class BaseBlockRule extends BlockRule {
    protected constructor(priority: number) {
      super({ priority });
    }
    protected  inlineParser: InlineParser = new InlineParser();

    // 内联解析
    public parseInlineContent(text: string): Token[] {
        
      if (!this.inlineParser) {
        this.inlineParser = new InlineParser();
        this.inlineParser.registerRule(new EscapeRule()); // 注册转义规则，必须放在最前面
        this.inlineParser.registerRule(new StrongRule());
        this.inlineParser.registerRule(new EmRule());
        this.inlineParser.registerRule(new DelRule());
        this.inlineParser.registerRule(new TextRule());
      }
      return this.inlineParser.parseInline(text);
    }
  }