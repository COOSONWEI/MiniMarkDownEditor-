/**
 * 优先级管理
 */

export const RULE_PRIORITIES = {
    // Block 元素
    EMPTY_LINE: 50,
    PARAGRAPH: 10,
    HEADING: 15,
    LIST: 14,
    HORIZONTAL: 13,
    BLOCKQUOTE: 12,
    TABLE: 20,
    // 内联元素
    ESCAPE: 1000, // 转义字符优先级最高
    DEL: 25,
    EM: 26,
    STRONG: 26,
    IMAGE: 24,
    LINK: 24,
    TEXT: 5,
}