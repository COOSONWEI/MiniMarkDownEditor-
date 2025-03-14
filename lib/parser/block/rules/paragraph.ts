import { Token } from '../../../tokens/token';
import { TokenType } from '../../../tokens/token';
import { ParsingContext } from '../../../core/state';
import { RULE_PRIORITIES } from '../../../command/priority';
import { BaseBlockRule } from './base';
import { InlineTokenizer } from '../../inline/tokenizer';

/**
 * 段落规则
 *
 * @author COOSONWEI
 */
export class ParagraphRule extends BaseBlockRule {

  constructor() {
    super(RULE_PRIORITIES.PARAGRAPH);
  }
  match(line: string, ctx: ParsingContext): boolean {
    // 空行不匹配段落规则
    if (line.trim().length === 0) {
      // 优化：如果当前在段落中且遇到空行，仍然匹配，以便可以正确关闭段落
      if (ctx.isInParagraph) {
        return true;
      }
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

    // 优化空行处理逻辑
    if (trimmedLine.length === 0) {
      // 确保空行处理不会产生多余的tokens
      if (ctx.isInParagraph) {
        ctx.setInParagraph(false);
        tokens.push(new Token({
          type: TokenType.PARAGRAPH_CLOSE,
          tag: 'p',
          nesting: -1,
          block: true,
        }));
      }
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
    // tokens.push(new Token({ type: TokenType.TEXT, content: line.replace(/\n+$/g, '') }));
    // 就进行内联处理
    //  const inlineTokens = new InlineTokenizer().tokenize(line);
    const inlineTokens = this.parseInlineContent(line);
    console.log('正在处理文本中的内容');
    tokens.push(...inlineTokens);
    console.log('文本处理完毕', inlineTokens);
    return tokens;
  }
}