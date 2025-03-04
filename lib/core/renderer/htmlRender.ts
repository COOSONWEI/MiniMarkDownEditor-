// HTML渲染器实现

import { Token, TokenType } from "../../tokens/token";
import { BaseRenderer } from "./baseRenderer";

/**
 * HTML渲染器
 * 将Markdown解析后的Token转换为HTML
 * @author COOSONWEI
 */
export class HtmlRenderer extends BaseRenderer {
  constructor() {
    super();
    this.initRules();
  }

  /**
   * 初始化渲染规则
   */
  private initRules(): void {
    // 段落规则
    this.registerRule(TokenType.PARAGRAPH_OPEN, (token) => `<p${this.renderAttrs(token)}>`);
    this.registerRule(TokenType.PARAGRAPH_CLOSE, () => '</p>\n');

    // 标题规则
    this.registerRule(TokenType.HEADING_OPEN, (token) => {
      const level = token.tag?.charAt(1) || '1';
      return `<h${level}${this.renderAttrs(token)}>`;
    });
    this.registerRule(TokenType.HEADING_CLOSE, (token) => {
      const level = token.tag?.charAt(1) || '1';
      return `</h${level}>\n`;
    });

    // 文本规则
    this.registerRule(TokenType.TEXT, (token) => this.escapeHtml(token.content || ''));

    // 行内规则
    this.registerRule(TokenType.INLINE, (token, index, tokens) => {
      let result = '';
      if (token.children && token.children.length > 0) {
        for (let i = 0; i < token.children.length; i++) {
          result += this.renderToken(token.children[i], i, token.children);
        }
      }
      return result;
    });

    // 强调规则
    this.registerRule(TokenType.EM_OPEN, () => '<em>');
    this.registerRule(TokenType.EM_CLOSE, () => '</em>');

    // 加粗规则
    this.registerRule(TokenType.STRONG_OPEN, () => '<strong>');
    this.registerRule(TokenType.STRONG_CLOSE, () => '</strong>');

    // 删除线规则
    this.registerRule(TokenType.DEL_OPEN, () => '<del>');
    this.registerRule(TokenType.DEL_CLOSE, () => '</del>');

    // 列表规则
    this.registerRule(TokenType.LIST_OPEN, (token) => {
      const isOrdered = token.tag === 'ol';
      return isOrdered ? '<ol>\n' : '<ul>\n';
    });
    this.registerRule(TokenType.LIST_CLOSE, (token) => {
      const isOrdered = token.tag === 'ol';
      return isOrdered ? '</ol>\n' : '</ul>\n';
    });
    this.registerRule(TokenType.LIST_ITEM_OPEN, () => '<li>');
    this.registerRule(TokenType.LIST_ITEM_CLOSE, () => '</li>\n');

    // 引用规则
    this.registerRule(TokenType.BLOCKQUOTE_OPEN, () => '<blockquote>\n');
    this.registerRule(TokenType.BLOCKQUOTE_CLOSE, () => '</blockquote>\n');

    // 水平线规则
    this.registerRule(TokenType.HORIZONTAL_RULE, () => '<hr>\n');

    // 表格规则
    this.registerRule(TokenType.TABLE_OPEN, () => '<table>\n');
    this.registerRule(TokenType.TABLE_CLOSE, () => '</table>\n');
    this.registerRule(TokenType.TABLE_HEADER_OPEN, () => '<thead>\n');
    this.registerRule(TokenType.TABLE_HEADER_CLOSE, () => '</thead>\n');
    this.registerRule(TokenType.TABLE_BODY_OPEN, () => '<tbody>\n');
    this.registerRule(TokenType.TABLE_BODY_CLOSE, () => '</tbody>\n');
    this.registerRule(TokenType.TABLE_ROW_OPEN, () => '<tr>\n');
    this.registerRule(TokenType.TABLE_ROW_CLOSE, () => '</tr>\n');
    this.registerRule(TokenType.TABLE_CELL_OPEN, (token) => {
      const isHeader = token.tag === 'th';
      const tag = isHeader ? 'th' : 'td';
      return `<${tag}${this.renderAttrs(token)}>`;
    });
    this.registerRule(TokenType.TABLE_CELL_CLOSE, (token) => {
      const isHeader = token.tag === 'th';
      const tag = isHeader ? 'th' : 'td';
      return `</${tag}>\n`;
    });

    // 链接规则
    this.registerRule(TokenType.LINK_OPEN, (token) => {
      const href = token.attrs?.href || '';
      const title = token.attrs?.title ? ` title="${this.escapeHtml(token.attrs.title)}"` : '';
      return `<a href="${this.escapeHtml(href)}"${title}>`;
    });
    this.registerRule(TokenType.LINK_CLOSE, () => '</a>');

    // 图片规则
    this.registerRule(TokenType.IMAGE_OPEN, (token) => {
      const src = token.attrs?.src || '';
      const alt = token.attrs?.alt || '';
      const title = token.attrs?.title ? ` title="${this.escapeHtml(token.attrs.title)}"` : '';
      return `<img src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}"${title}`;
    });
    this.registerRule(TokenType.IMAGE_CLOSE, () => '/>');
  }

  /**
   * 渲染Token的属性
   * @param token 待渲染的Token
   * @returns 属性字符串
   */
  private renderAttrs(token: Token): string {
    if (!token.attrs || Object.keys(token.attrs).length === 0) {
      return '';
    }

    let result = '';
    for (const [key, value] of Object.entries(token.attrs)) {
      if (key === 'href' || key === 'src' || key === 'title' || key === 'alt') {
        continue; // 这些属性在特定规则中单独处理
      }
      result += ` ${key}="${this.escapeHtml(value)}"`;
    }
    return result;
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
