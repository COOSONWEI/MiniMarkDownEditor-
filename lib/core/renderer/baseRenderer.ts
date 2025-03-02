// 基础渲染器接口定义

import { Token } from "../../tokens/token";

/**
 * 渲染器接口
 * 定义了渲染器应该具有的基本功能
 * @author COOSONWEI
 */
export interface Renderer {
  /**
   * 渲染Markdown文档
   * @param tokens 解析后的Token数组
   * @returns 渲染后的内容
   */
  render(tokens: Token[]): string;
  
  /**
   * 渲染单个Token
   * @param token 待渲染的Token
   * @param index 当前Token在数组中的索引
   * @param tokens 完整的Token数组
   * @returns 渲染后的内容
   */
  renderToken(token: Token, index: number, tokens: Token[]): string;
}

/**
 * 基础渲染器抽象类
 * 实现了基本的渲染逻辑，具体的渲染方法由子类实现
 * @author COOSONWEI
 */
export abstract class BaseRenderer implements Renderer {
  /**
   * 渲染规则映射表
   * 键为Token类型，值为对应的渲染方法
   */
  protected rules: Record<string, (token: Token, index: number, tokens: Token[]) => string> = {};
  
  /**
   * 渲染Markdown文档
   * @param tokens 解析后的Token数组
   * @returns 渲染后的内容
   */
  render(tokens: Token[]): string {
    let result = '';
    for (let i = 0; i < tokens.length; i++) {
      result += this.renderToken(tokens[i], i, tokens);
    }
    return result;
  }
  
  /**
   * 渲染单个Token
   * @param token 待渲染的Token
   * @param index 当前Token在数组中的索引
   * @param tokens 完整的Token数组
   * @returns 渲染后的内容
   */
  renderToken(token: Token, index: number, tokens: Token[]): string {
    // 如果Token被标记为隐藏，则不渲染
    if (token.hidden) {
      return '';
    }
    
    // 查找对应的渲染规则
    const rule = this.rules[token.type];
    if (rule) {
      return rule(token, index, tokens);
    }
    
    // 如果没有找到对应的规则，则递归渲染子节点
    if (token.children && token.children.length > 0) {
      let result = '';
      for (let i = 0; i < token.children.length; i++) {
        result += this.renderToken(token.children[i], i, token.children);
      }
      return result;
    }
    
    // 默认返回Token的内容
    return token.content || '';
  }
  
  /**
   * 注册渲染规则
   * @param type Token类型
   * @param rule 渲染规则函数
   */
  protected registerRule(type: string, rule: (token: Token, index: number, tokens: Token[]) => string): void {
    this.rules[type] = rule;
  }
}