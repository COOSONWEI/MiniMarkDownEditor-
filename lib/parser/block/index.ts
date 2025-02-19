// token 数据结构与处理逻辑

/**
 * 初始化 TokenType
 *
 * @author COOSONWEI
 */
export enum TokenType {
  paragraph_open = "paragraph_open",
  paragraph_close = "paragraph_close",
  text = "text"
}

/**
* Token 的数据结构
* 
* @author COOSONWEI
*/
export class Token {
  type: string;  // 类型
  tag?: string = ''; // html标签
  attrs?: Record<string, string>; // 标记的属性  [key, value]
  level: number = 0; // 层级(用于缩进处理)
  map?: [number, number]; // 对应的位置 [start, end]
  nesting: 1 | 0 | -1 = 0; // 嵌套深度（标签的开始和结束） 1: 新的嵌套层级 0: 该 tag 不影响整体的嵌套层级 -1: 结束一个嵌套层级
  content?: string; // 内容 text
  children: Token[] = []; // 子节点
  markup?: string; // markdown 语法标记
  info?: string; // tag 的额外信息 
  meta?: string; // 与标记相关的元数据
  block: boolean = false; // 是否为块级元素
  hidden: boolean = false; // 是否隐藏

  /**
   * 构造函数
   *
   * @param options 选项
   * @author COOSONWEI
   */
  constructor(options: {
      type: string;
      tag?: string;
      attrs?: Record<string, string>;
      level?: number;
      map?: [number, number];
      nesting?: 1 | 0 | -1;
      content?: string;
      children?: Token[];
      markup?: string;
      info?: string;
      meta?: string;
      block?: boolean;
      hidden?: boolean;
  }) {
      this.type = options.type;
      this.tag = options.tag;
      this.attrs = options.attrs;
      this.level = options.level ?? this.level;
      this.map = options.map;
      this.nesting = options.nesting ?? this.nesting;
      this.content = options.content;
      this.children = options.children ?? this.children;
      this.markup = options.markup;
      this.info = options.info;
      this.meta = options.meta;
      this.block = options.block ?? this.block;
      this.hidden = options.hidden ?? this.hidden;
  }
}

// 渲染函数
function renderTokensToHTML(tokens: Token[]): string {
  let html = '';
  for (const token of tokens) {
      switch (token.type) {
          case TokenType.paragraph_open:
              html += renderOpeningTag(token);
              break;
          case TokenType.text:
              html += token.content || '';
              break;
          case TokenType.paragraph_close:
              html += renderClosingTag(token);
              break;
          default:
              // 处理其他类型的 Token，这里简单递归处理子节点
              html += renderOpeningTag(token);
              html += renderTokensToHTML(token.children);
              html += renderClosingTag(token);
              break;
      }
  }
  return html;
}

// 渲染开始标签
function renderOpeningTag(token: Token): string {
  if (!token.tag) return '';
  let attrsString = '';
  if (token.attrs) {
      attrsString = Object.entries(token.attrs)
         .map(([key, value]) => `${key}="${value}"`)
         .join(' ');
  }
  return `<${token.tag}${attrsString ? ` ${attrsString}` : ''}>`;
}

// 渲染结束标签
function renderClosingTag(token: Token): string {
  if (!token.tag) return '';
  return `</${token.tag}>`;
}

// 示例使用
const sampleTokens: Token[] = [
  new Token({ type: TokenType.paragraph_open, tag: 'p' }),
  new Token({ type: TokenType.text, content: 'Hello World' }),
  new Token({ type: TokenType.paragraph_close, tag: 'p' }),
  new Token({ type: TokenType.paragraph_open, tag: 'p' }),
  new Token({ type: TokenType.text, content: 'This is a paragraph' }),
  new Token({ type: TokenType.paragraph_close, tag: 'p' })
];

const htmlOutput = renderTokensToHTML(sampleTokens);
console.log(htmlOutput);