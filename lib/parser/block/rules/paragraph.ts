

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
    // !ctx.currentState.listActive &&
    return  !ctx.isListActive && line.trim().length > 0;
}

  execute(line: string,ctx: ParsingContext): Token[] {
    if (!ctx.isInParagraph) {
      // 标记为段落状态
      ctx.setInParagraph(true);
    }

    return [
        new Token({ type: TokenType.PARAGRAPH_OPEN, tag: 'p', nesting: 1, block: true }),
        new Token({ type: TokenType.TEXT, content: line.trim() }),
        new Token({ type: TokenType.PARAGRAPH_CLOSE, tag: 'p', nesting: -1, block: true })
      ] ;
  }
}