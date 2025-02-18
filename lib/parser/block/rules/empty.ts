import { Token } from "../../../tokens/token";
import { BlockRule } from "../state";

/**
 * 空行规则
 *
 * @author COOSONWEI
 */
export class EmptyLineRule implements BlockRule {
    priority = 100; // 高优先级
  
    match(line: string): boolean {
      return line.trim().length === 0;
    }
  
    execute(): Token[] {
      return []; // 忽略空行
    }
  }