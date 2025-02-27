/**
 * 解析器状态机定义
 */


// 解析器状态枚举
// 定义状态枚举
export enum ParserState {
  // 初始状态
  INITIAL = "INITIAL",

  // 块级元素
  PARAGRAPH = "PARAGRAPH",
  HEADING_1 = "HEADING_1",    // # 
  HEADING_ = "HEADING_2",    // ##
  HEADING_3 = "HEADING_3 ",    // ###
  HEADING_4 = "HEADING_4",    // ####
  HEADING_5 = "HEADING_5",    // #####
  HEADING_6 = "HEADING_6",    // ######
  LIST_ITEM = "LIST_ITEM",    // * / - / +
  CODE_BLOCK = "CODE_BLOCK",    // ```
  TABLE_CELL = "TABLE_CELL",    // 表格单元格（需要配合表格行状态）
  QUOTE_BLOCK = "QUOTE_BLOCK",   // >

  EXIT_CODE = "EXIT_CODE",

  // 复杂结构
  TABLE_ROW = "TABLE_ROW",      // 表格行（需要配合单元格状态）
  NESTED_LIST = "NESTED_LIST",    // 嵌套列表（需要记录缩进层级）
  TABLE_EXIT = "TABLE_EXIT",

  // 终止状态
  TERMINATED = "TERMINATED"
}

// 解析器事件枚举

export enum ParserEvent {
  // 行级触发事件（由输入行直接触发）
  EMPTY_LINE = "EMPTY_LINE",
  HEADING_MARKER = "HEADING_MARKER",      // # 开头的标题行
  LIST_MARKER = "LIST_MARKER",           // * / - / + 开头的列表项
  CODE_MARKER = "CODE_MARKER",           // ``` 开始的代码块
  CODE_END_MARKER = "CODE_END_MARKER",     // ``` 结束的代码块
  QUOTE_MARKER = "QUOTE_MARKER",          // > 开始的引文块
  QUOTE_END_MARKER = "QUOTE_END_MARKER",  // > 结束的引文块
  TABLE_MARKER = "TABLE_MARKER",          // | 开始的表格行
  TEXT = "TEXT",                        // 普通文本行

  // 状态转换事件（由解析器主动触发）
  ENTER_PARAGRAPH = "ENTER_PARAGRAPH",    // 进入段落模式
  EXIT_PARAGRAPH = "EXIT_PARAGRAPH",      // 退出段落模式
  ENTER_HEADING = "ENTER_HEADING",       // 进入标题模式
  EXIT_HEADING = "EXIT_HEADING",         // 退出标题模式
  ENTER_LIST = "ENTER_LIST",             // 进入列表项模式
  EXIT_LIST = "EXIT_LIST",              // 退出列表项模式
  ENTER_CODE = "ENTER_CODE",             // 进入代码块模式
  EXIT_CODE = "EXIT_CODE",              // 退出代码块模式
  ENTER_TABLE = "ENTER_TABLE",           // 进入表格模式
  EXIT_TABLE = "EXIT_TABLE",            // 退出表格模式
  LIST_CHANGE = "LIST_CHANGE",           // 列表项缩进变化
  ENTER_QUOTE = "ENTER_QUOTE",           // 进入引文块模式
  EXIT_QUOTE = "EXIT_QUOTE",            // 退出引文块模式,

  // 辅助事件（用于解析过程中的状态调整）
  INDENT_CHANGE = "INDENT_CHANGE",        // 缩进变化（列表嵌套）
  DEINDENT_CHANGE = "DEINDENT_CHANGE"       // 减少缩进
}

// 上下文接口
export interface IContext {
  indentLevel: number;
  listLevelStack: number[];
  tableAlignments: string[];
  isInTable: () => boolean;
  isInHeading: () => boolean;
  emit(event: ParserEvent, payload?: any): void;
  pushState(state: Partial<IState>): void;
  popState(): void;
}


// 辅助类型定义
export interface IState {
  state: string;
  listActive: boolean;
  inParagraph: boolean;
  headingActive: boolean;
  inBlockquote: boolean;
  inTable: boolean;
  tableAlignments: string[];
  tableRowCount: number;
  tableStartIndex: number | null;
  listLevelStack: number[];
  quoteLevelStack: number[];
}