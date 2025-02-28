

import { BlockRule } from '../state';
import { Token } from '../../../tokens/token';
import { TokenType } from '../../../tokens/token';
import { ParsingContext } from '../../../core/state';
import { RULE_PRIORITIES } from '../../../command/priority';

/**
 * 段落规则
 *
 * @author COOSONWEI
 */
export class ParagraphRule implements BlockRule {
  priority = RULE_PRIORITIES.PARAGRAPH; // 低优先级
  match(line: string, ctx: ParsingContext): boolean {
    // 空行不匹配段落规则
    if (line.trim().length === 0) {
      return false;
    }
    
    // 如果已经在段落中，继续匹配
    if (ctx.isInParagraph) {
      return true;
    }
    
    // 不是列表项且不是空行时匹配段落
    return !ctx.isListActive && !ctx.isHeadingActive && !ctx.isInBlockquote && !line.startsWith('```');
  }
  execute(line: string, ctx: ParsingContext): Token[] {
    const tokens: Token[] = [];
    const trimmedLine = line.trim();
    
    
    

    // if (trimmedLine.length === 0) {
    //   if (ctx.isInParagraph) {
    //     ctx.setInParagraph(false);
    //     tokens.push(new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }));
    //   }
    //   return tokens;
    // }

      // 如果当前处于段落中且遇到空行，则关闭段落
  if (trimmedLine.length === 0 && ctx.isInParagraph) {
    ctx.setInParagraph(false);
    tokens.push(new Token({
      type: TokenType.PARAGRAPH_CLOSE,
      tag: 'p',
      nesting: -1,
      block: true,
    }));
    return tokens;
  }

     // 如果不在段落中，则开启新段落
  if (!ctx.isInParagraph) {
    ctx.setInParagraph(true);
    tokens.push(new Token({
      type: TokenType.PARAGRAPH_OPEN,
      tag: 'p',
      nesting: 1,
      block: true,
    }));
  }

    // 添加文本内容
    tokens.push(new Token({ type: TokenType.TEXT, content: line.replace(/\n+$/g, '') }));

    return tokens;
  }
}