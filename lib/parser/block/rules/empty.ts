
import { RULE_PRIORITIES } from "../../../command/priority";
import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BlockRule } from "../state";

/**
 * 空行规则
 *
 * @author COOSONWEI
 */
export class EmptyLineRule implements BlockRule {
    priority = RULE_PRIORITIES.EMPTY_LINE; // 高优先级
  
    match(line: string, ctx: ParsingContext): boolean {
      return line.trim().length === 0;
    }
    execute(line: string, ctx: ParsingContext): Token[] {
      // 遇到空行段落自动闭合
      if (ctx.isInParagraph) {
        ctx.setInParagraph(false);
        return [new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1 , block: true})];
      }
      ctx.reset(); // 重置其他状态
      return [];
    
    }
  }