

import { BlockRule } from '../state';
import { Token } from '../../../tokens/token';
import { TokenType } from '../../../tokens/token';

/**
 * 段落规则
 *
 * @author COOSONWEI
 */
export class ParagraphRule implements BlockRule {
  match(line: string): boolean {
    return line.trim().length > 0; // 非空行即为段落
  }

  execute(line: string): Token[] {
    return [
        new Token({ type: TokenType.paragraph_open, tag: 'p', level: 1 }),
        new Token({ type: TokenType.text, content: line.trim() }),
        new Token({ type: TokenType.paragraph_close, tag: 'p', level: -1 })
      ];
  }
}