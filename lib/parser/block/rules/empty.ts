import { ParsingContext } from "../../../core/state";
import { Token } from "../../../tokens/token";
import { BlockRule } from "../state";

/**
 * 空行规则
 *
 * @author COOSONWEI
 */
export class EmptyLineRule implements BlockRule {
    priority = 50; // 高优先级
  
    match(line: string, ctx: ParsingContext): boolean {
      return line.trim().length === 0;
    }
    execute(line: string, ctx: ParsingContext): Token[] {
      // 重置相关状态
      ctx.setInParagraph(false);
      ctx.setListActive(false);
      ctx.setHeadingActive(false);
      return []; // 空行不生成 token
    }
  }