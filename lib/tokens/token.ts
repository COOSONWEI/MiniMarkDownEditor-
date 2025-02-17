// token 数据结构与处理逻辑

class Token {
    type: string;
    tag?: string;
    attrs: [string, string][];
    map: [number, number];
    nesting: 1 | 0 | -1;
    content?: string;
    children: Token[];
    markup?: string;
    info?: string;
    meta?: string;
    block?: boolean;
    hidden?: boolean;
}