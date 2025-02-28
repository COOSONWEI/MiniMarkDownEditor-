import {Token, TokenType} from "../../../tokens/token";
import {InlineRule} from "../state";
import {InlineParser, LexerState} from "../index";

/**
 * 加粗规则
 * @Author simms
 */
export class StrongRule extends InlineRule {
    priority = 70;
    state = LexerState.IN_STRONG;


    match(text: string, tokens: Token[], position: number): boolean {
        return text[position] === '*' && text[position + 1] === '*'
    }

    execute(text: string, tokens: Token[], position: number): void {
        InlineParser.position += 2;
        if (InlineParser.travelState(this.state)) {
            InlineParser.tokens.push(this.createNewToken(-1))
        } else {
            InlineParser.state.push(this.state);
            InlineParser.tokens.push(this.createNewToken(1))
        }
    }

    createNewToken(nesting: 1 | 0 | -1): Token {
        return new Token(
            {
                type: nesting === -1 ? TokenType.STRONG_CLOSE : TokenType.STRONG_OPEN,
                nesting: nesting,
                map: [InlineParser.position - 2, InlineParser.position - 1],
                content: "**"
            });
    }
}


// 旧 正则表达式版本
/*class StrongRule extends InlineRule {
  protected static readonly Regex = /(\*\*|__)/g;

  match(text: string, ctx: ParsingContext): boolean {
    return StrongRule.Regex.test(text);
  }

  execute(text: string): Token[] {
    const tokens: Token[] = [];
    const stack: Array<{ type: '**' | '__', pos: number }> = [];
    const parts = text.split(/(\*\*|__)/g);
    let buffer: string[] = [];

    const flush = () => {
      if (buffer.length === 0) return;
      tokens.push(new Token({ type: TokenType.TEXT, content: buffer.join('') }));
      buffer = [];
    };

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '**' || part === '__') {
        if (stack.length > 0 && stack[stack.length - 1].type === part) {
          const open = stack.pop()!;
          flush();
          // 替换占位符为真实开标签
          tokens[open.pos] = new Token({
            type: TokenType.STRONG_OPEN,
            tag: 'strong',
            nesting: 1
          });
          tokens.push(new Token({
            type: TokenType.STRONG_CLOSE,
            tag: 'strong',
            nesting: -1
          }));
        } else {
          // 插入占位符并记录位置
          const placeholderPos = tokens.length;
          tokens.push(null as any);
          stack.push({ type: part, pos: placeholderPos });
        }
      } else if (part !== '') {
        buffer.push(part);
      }
    }

    // 处理未闭合标记
    stack.forEach(({ type, pos }) => {
      tokens[pos] = new Token({
        type: TokenType.TEXT,
        content: type
      });
    });
    if (stack.length > 0) {
      buffer.push(...stack.map(s => s.type));
    }
    flush();

    return tokens.filter(t => t !== null);
  }

  // 问题代码，有bug，会将未闭合的strong_open插入tokens
  // execute(text: string, ctx: ParsingContext): Token[] {
  //   const tokens: Token[] = [];
  //   const stack: ('**' | '__')[] = [];
  //   const parts = text.split(/(\*\*|__)/g);

  //   let buffer: string[] = [];

  //   // 作用就是合并buffer内的文字以text形式插入token栈
  //   const flush = () => {
  //     if (buffer.length === 0) return; // 如果文字缓冲区里为空则返回
  //     tokens.push(new Token({ type: TokenType.TEXT, content: buffer.join('') }));
  //     buffer = []; // 反之则推入文字到token，buffer.join('')的意思是拼接起来
  //   };

  //   for (const part of parts) {
  //     if (part === '**' || part === '__') {
  //       // 这里是为了确保符号是相同对应的
  //       if (stack.length > 0 && stack[stack.length - 1] === part) {
  //         flush();
  //         tokens.push(new Token({ type: TokenType.STRONG_CLOSE, tag: 'strong', nesting: -1 }));
  //         stack.pop();
  //       } else {
  //         flush();
  //         tokens.push(new Token({ type: TokenType.STRONG_OPEN, tag: 'strong', nesting: 1 }));
  //         stack.push(part);
  //       }
  //     } else {
  //       if (part !== '') {
  //         buffer.push(part);
  //       }
  //     }
  //   }

  //   // 处理未闭合标记
  //   if (stack.length > 0) {
  //     buffer.push(stack.join('')); // 未闭合的符合就合并作为文字插入buffer
  //   }
  //   flush(); // 插入token中

  //   return tokens;
  // }
}*/
