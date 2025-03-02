// 代码块渲染器实现

import { Token, TokenType } from "../../tokens/token";
import { BaseRenderer } from "./baseRenderer";

/**
 * 代码块渲染器
 * 专门用于渲染Markdown中的代码块，支持语法高亮
 * @author COOSONWEI
 */
export class CodeRenderer extends BaseRenderer {
  constructor() {
    super();
    this.initRules();
  }

  /**
   * 初始化渲染规则
   */
  private initRules(): void {
    // 代码块开始规则
    this.registerRule(TokenType.CODE_OPEN, (token) => {
      const language = token.info || '';
      return `<pre><code${language ? ` class="language-${this.escapeHtml(language)}"` : ''}>`;
    });
    
    // 代码块结束规则
    this.registerRule(TokenType.CODE_CLOSE, () => '</code></pre>\n');
    
    // 行内代码规则 - 如果项目中有这个Token类型
    this.registerRule('code_inline', (token) => {
      return `<code>${this.escapeHtml(token.content || '')}</code>`;
    });
  }

  /**
   * 转义HTML特殊字符
   * @param str 待转义的字符串
   * @returns 转义后的字符串
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}