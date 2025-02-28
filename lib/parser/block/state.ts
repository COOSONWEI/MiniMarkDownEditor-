// 块级状态机

import { ParsingContext } from '../../core/state';
import { Token } from '../../tokens/token';
import { ParserState, ParserEvent } from '../../core/fsm/state';
import { FSM } from '../../core/fsm/fsm';

/**
 * 块级规则基础类
 */
export abstract class BlockRule {
  // 越大优先级越高
  priority: number = 10; // 默认优先级

  /**
   * 构造函数
   *
   * @param options 选项
   */
  constructor(options?: { priority?: number }) {
    this.priority = options?.priority || this.priority;
  }
  abstract match(line: string, ctx: ParsingContext): boolean; // 匹配规则
  abstract execute(line: string, ctx: ParsingContext): Token[]; // 执行规则（返回 Token 数组）
}

/**
 * 块级解析器基础类
 */
export class BlockParser {
  private rules: BlockRule[] = []; // 规则列表
  
  private fsm: FSM; // 状态机
  private context: ParsingContext;
  constructor() {
    this.fsm = new FSM(ParserState.INITIAL);
    this.context = new ParsingContext();
  }
  // 注册规则
  registerRule(rule: BlockRule): void {
    // 按优先级降序插入
    this.rules.push(rule);
    console.log(`注册的规则有: ${this.rules.map(r => r.constructor.name).join(', ')}`);
    this.rules.sort((a, b) => b.priority - a.priority);
    console.log(`排序后注册的规则有: ${this.rules.map(r => r.constructor.name).join(', ')}`);
  }

  // 解析行
  parseLine(line: string, ctx: ParsingContext): Token[] {
    // 根据行内容判断事件类型
    let event = this.determineEvent(line);
    

    // 然后执行匹配的规则
    for (const rule of this.rules) {
      if (rule.match(line, ctx)) {
        console.log(`执行的规则是: ${rule.constructor.name}`);
        const tokens = rule.execute(line, ctx);

        // 处理空行的特殊情况
        if (tokens.length === 0 && event === ParserEvent.EMPTY_LINE) {
          ctx.setInParagraph(false);
          ctx.setListActive(false);
          ctx.setHeadingActive(false);
        }

        return tokens;
      }
    }
    return []; // 默认处理
  }

  // 根据行内容确定事件类型
  private determineEvent(line: string): ParserEvent {
    if (!line.trim()) return ParserEvent.EMPTY_LINE;
    if (line.startsWith('#')) return ParserEvent.HEADING_MARKER;
    if (line.match(/^[\-\*\+]\s/)) return ParserEvent.LIST_MARKER;
    if (line.startsWith('>')) return ParserEvent.QUOTE_MARKER;
    if (line.startsWith('```')) return ParserEvent.CODE_MARKER;
    if (line.includes('|')) return ParserEvent.TABLE_MARKER;
    return ParserEvent.TEXT;
  }
}