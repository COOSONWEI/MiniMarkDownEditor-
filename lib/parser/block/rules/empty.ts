
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
      console.log('执行空行规则，当前状态:', ctx.currentState);
      const tokens: Token[] = [];
      
      // 处理段落状态
      if (ctx.isInParagraph) {
        ctx.setInParagraph(false);
        tokens.push(new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true}));
      }
      
      // 处理列表状态
      if (ctx.isListActive) {
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
      }
      
      // 处理标题状态
      if (ctx.isHeadingActive) {
        ctx.setHeadingActive(false);
      }
      
      // 处理引用状态
      if (ctx.isInBlockquote) {
        ctx.currentState.inBlockquote = false;
      }
      
      // 确保不会重复调用状态重置
      if (ctx.getPreviousState()?.state !== 'root') {
        console.log('重置状态');
        // 避免重复重置，只有在非根状态时才重置
        ctx.reset();
      }
      
      return tokens;
    }
  }