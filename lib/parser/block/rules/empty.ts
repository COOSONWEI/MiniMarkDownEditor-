
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
      if (ctx.getPreviousState()?.state === 'paragraph') {
        ctx.setInParagraph(false);
        return [new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1 , block: true})];
      }
      if (ctx.getPreviousState()?.state === 'list') {
        const tokens = [];
        const orderedRegex = /^([ \t]*)(\d+)\.\s+(.*)/;
        while (ctx.currentListLevel > 0) {
          ctx.leaveListLevel();
          tokens.push(new Token({
            type: TokenType.LIST_CLOSE,
            tag: orderedRegex.test(line) ? 'ol' : 'ul',
            nesting: -1,
            block: true,
            level: ctx.currentListLevel
          }));
        }
        ctx.setListActive(false);
        ctx.resetListLevel();
        return tokens;
      }
      ctx.reset(); // 重置其他状态
      return [];
    
    }
  }