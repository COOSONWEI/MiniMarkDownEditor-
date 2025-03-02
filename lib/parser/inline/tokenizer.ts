


/**
 * 分词器进行分词
 * @author COOSONWEI
 */

import { Token, TokenType } from "../../tokens/token";
import { InlineContext, InlineState } from "./state";

export class InlineTokenizer {
    private ctx: InlineContext;
  
    constructor() {
      this.resetContext();
    }
  
    /**
     * 解析入口方法
     */
    tokenize(input: string): Token[] {
      this.resetContext();
      
      while (this.ctx.pos < input.length) {
        const char = input[this.ctx.pos];
        this.processCharacter(char);
        this.ctx.pos++;
      }
  
      this.flushBuffer(); // 处理剩余缓冲区内容
      console.log('处理完 buffer 后的 tokens: ', this.ctx.tokens);
      return this.ctx.tokens;
    }
  
    /**
     * 核心状态处理逻辑
     */
    private processCharacter(char: string): void {
      switch (this.ctx.state) {
        case InlineState.TEXT:
          this.handleText(char);
          break;
        case InlineState.ESCAPE:
          this.handleEscape(char);
          break;
        // 其他状态处理...
      }
    }
  
    /**
     * 文本状态处理
     */
    private handleText(char: string): void {
      if (char === '\\') {
        this.ctx.state = InlineState.ESCAPE;
      } else if (char === '*') {
        this.flushBuffer();
        // this.beginEmphasis();
      } else {
        this.ctx.buffer += char;
      }
    }
  
    /**
     * 转义字符处理
     */
    private handleEscape(char: string): void {
      this.ctx.buffer += char;
      this.ctx.state = InlineState.TEXT;
    }
  
    /**
     * 缓冲区内容输出为文本 Token
     */
    private flushBuffer(): void {
      if (this.ctx.buffer.length > 0) {
        this.ctx.tokens.push(
          new Token({type: TokenType.TEXT, content: this.ctx.buffer})
        );
        this.ctx.buffer = '';
      }
    }
    
  
    /**
     * 重置解析上下文
     */
    private resetContext(): void {
      this.ctx = {
        pos: 0,
        state: InlineState.TEXT,
        buffer: '',
        tokens: []
      };
    }
  }