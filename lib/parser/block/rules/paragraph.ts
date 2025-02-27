

import { BlockRule } from '../state';
import { Token } from '../../../tokens/token';
import { TokenType } from '../../../tokens/token';
import { ParsingContext } from '../../../core/state';

/**
 * 段落规则
 *
 * @author COOSONWEI
 */
export class ParagraphRule implements BlockRule {
  priority = 10; // 低优先级
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
    return !ctx.isListActive && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('```');
  }
  execute(line: string, ctx: ParsingContext): Token[] {
    const tokens: Token[] = [];
    const trimmedLine = line.trim();
    
    if (trimmedLine.length === 0) {
      if (ctx.isInParagraph) {
        ctx.setInParagraph(false);
        tokens.push(new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true }));
      }
      return tokens;
    }

    if (!ctx.isInParagraph) {
      // 开始新段落
      ctx.setInParagraph(true);
      tokens.push(new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }));
    }

    // 添加文本内容
    tokens.push(new Token({ type: TokenType.TEXT, content: trimmedLine }));

    return tokens;
  }
}