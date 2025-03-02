// 行内解析器状态管理

import { Token } from "../../tokens/token";
import { LexerState } from "./index";

/**
 * 行内解析器状态管理类
 * 负责管理行内解析器的状态，包括状态栈、缓冲区和位置信息
 * @author COOSONWEI
 */
export class InlineParserState {
  // 状态栈，用于管理嵌套的行内格式
  private stateStack: LexerState[] = [];
  
  // 文本缓冲区
  private buffer: string[] = [];
  
  // 当前解析位置
  private position: number = 0;
  
  // 解析结果tokens
  private tokens: Token[] = [];
  
  /**
   * 获取当前状态
   * @returns 当前状态
   */
  public getCurrentState(): LexerState {
    return this.stateStack.length > 0 
      ? this.stateStack[this.stateStack.length - 1] 
      : LexerState.DEFAULT;
  }
  
  /**
   * 进入新状态
   * @param state 要进入的状态
   */
  public pushState(state: LexerState): void {
    this.stateStack.push(state);
  }
  
  /**
   * 尝试离开指定状态
   * @param state 要离开的状态
   * @returns 是否成功离开状态
   */
  public travelState(state: LexerState): boolean {
    // 只允许关闭栈顶元素（符号要配对）
    if (this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1] === state) {
      this.stateStack.pop();
      return true;
    }
    return false;
  }
  
  /**
   * 添加文本到缓冲区
   * @param text 要添加的文本
   */
  public addToBuffer(text: string): void {
    this.buffer.push(text);
  }
  
  /**
   * 清空文本缓冲区并创建文本Token
   */
  public flushTextBuffer(): void {
    if (this.buffer.length > 0) {
      this.tokens.push(new Token({
        type: "text",
        content: this.buffer.join(''),
      }));
      this.buffer = [];
    }
  }
  
  /**
   * 添加Token到结果集
   * @param token 要添加的Token
   */
  public addToken(token: Token): void {
    this.tokens.push(token);
  }
  
  /**
   * 获取当前位置
   * @returns 当前位置
   */
  public getPosition(): number {
    return this.position;
  }
  
  /**
   * 设置当前位置
   * @param pos 新的位置
   */
  public setPosition(pos: number): void {
    this.position = pos;
  }
  
  /**
   * 前进指定步数
   * @param steps 步数，默认为1
   */
  public advance(steps: number = 1): void {
    this.position += steps;
  }
  
  /**
   * 获取所有Token
   * @returns Token数组
   */
  public getTokens(): Token[] {
    return this.tokens;
  }
  
  /**
   * 重置状态
   */
  public reset(): void {
    this.stateStack = [];
    this.buffer = [];
    this.position = 0;
    this.tokens = [];
  }
  
  /**
   * 处理未闭合的状态
   * 将未闭合的标签转换为文本
   */
  public solveRestState(): void {
    // 清理非默认状态
    while (this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1] !== LexerState.DEFAULT) {
      this.stateStack.pop();
    }
    
    // 清理默认状态
    for (let i = this.stateStack.length - 1; i >= 0; i--) {
      if (this.stateStack[i] === LexerState.DEFAULT) {
        this.stateStack.splice(i, 1);
      }
    }
    
    this.seekUnclosedToken();
  }
  
  /**
   * 查找并处理未闭合的Token
   */
  private seekUnclosedToken(): void {
    let i = this.stateStack.length - 1;
    while (i >= 0) {
      const stateItem = this.stateStack[i];
      if (!stateItem) {
        i--;
        continue;
      }
      
      let found = false;
      for (let j = this.tokens.length - 1; j >= 0; j--) {
        if (this.stateStack.length === 0) {
          return;
        }
        
        const tokenType = this.tokens[j].type.toLowerCase();
        const target = stateItem.toLowerCase().substring(3) + "_open";
        
        if (target === tokenType) {
          this.tokens[j].type = "text";
          this.stateStack.pop();
          found = true;
          break;
        }
      }
      
      i = found ? this.stateStack.length - 1 : i - 1;
    }
  }
}