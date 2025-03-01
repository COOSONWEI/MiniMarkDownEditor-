// token 数据结构与处理逻辑

/**
 * 初始化 TokenType
 *
 * @author COOSONWEI
 */
export enum TokenType {
    PARAGRAPH_OPEN = "paragraph_open", // 段落开始
    PARAGRAPH_CLOSE = "paragraph_close", // 段落结束
    TEXT = "text", // 文本
    INLINE = "inline", // 行内标记
    HEADING_OPEN = "heading_open", // 标题开始
    HEADING_CLOSE = "heading_close", // 标题结束
    LIST_OPEN = "list_open", // 列表开始
    LIST_CLOSE = "list_close", // 列表结束
    LIST_ITEM_OPEN = "list_item_open", // 列表项开始
    LIST_ITEM_CLOSE = "list_item_close", // 列表项结束
    COSE_OPEN = "code_open", // 代码块开始
    CODE_CLOSE = "code_close", // 代码块结束
    BLOCKQUOTE_OPEN = "blockquote_open", // 引用块开始
    BLOCKQUOTE_CLOSE = "blockquote_close", // 引用块结束
    TABLE_OPEN = "table_open", // 表格开始
    TABLE_CLOSE = "table_close", // 表格结束
    TABLE_HEADER_OPEN = "table_header_open", // 表格表头开始
    TABLE_HEADER_CLOSE = "table_header_close", // 表格表头结束
    TABLE_BODY_OPEN = "table_body_open", // 表格体开始
    TABLE_BODY_CLOSE = "table_body_close", // 表格体结束
    TABLE_ROW_OPEN = "table_row_open", // 表格行开始
    TABLE_ROW_CLOSE = "table_row_close", // 表格行结束
    TABLE_CELL_OPEN = "table_cell_open", // 表格单元格开始
    TABLE_CELL_CLOSE = "table_cell_close", // 表格单元格结束
    HORIZONTAL_RULE = "hr", // 水平线（自闭合）
    IMAGE_OPEN = "image_open", // 图片开始
    IMAGE_CLOSE = "image_close", // 图片结束
    LINK_OPEN = "link_open", // 链接开始
    LINK_CLOSE = "link_close", // 链接结束
    STRONG_OPEN = "strong_open", // 加粗开始
    STRONG_CLOSE = "strong_close", // 加粗结束
    EM_OPEN = "em_open", // 斜体开始
    EM_CLOSE = "em_close", // 斜体结束
    DEL_OPEN = "del_open", // 删除开始
    DEL_CLOSE = "del_close", // 删除结束
}

/**
 * Token 的数据结构
 * 
 * @author COOSONWEI
 */
export class Token {
    type: string;  // 类型
    tag?: string = ""; // html标签
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