// 块级状态机

import { ParsingContext } from '../../core/state';
import { Token } from '../../tokens/token';

/**
 * 块级规则基础类
 */
export abstract class BlockRule {
  abstract match(line: string, ctx: ParsingContext): boolean;
  abstract execute(line: string, ctx: ParsingContext): Token[];
}

/**
 * 块级解析器基础类
 */
export class BlockParser {
  private rules: BlockRule[] = [];

  registerRule(rule: BlockRule): void {
    this.rules.push(rule);
  }

  parseLine(line: string, ctx: ParsingContext): Token[] {
    for (const rule of this.rules) {
      if (rule.match(line, ctx)) {
        return rule.execute(line, ctx);
      }
    }
    return []; // 默认处理
  }
}