/**
 * 上下文解析器
 */
export class ParsingContext {
  public currentLine = 0;
  public indentLevel = 0;
  private _stateStack: Array<{
      state: string;
      listActive: boolean; // 列表状态
      inParagraph: boolean; // 段落状态
      headingActive: boolean; // 标题状态
      inBlockquote: boolean; // 引用状态
      inTable: boolean; // 表格状态
      tableAlignments: string[]; // 表格列对齐方式
      tableRowCount: number; // 表格行数
      tableStartIndex: number | null; // 表格起始位置
      // TODO: 后续可能考虑抽离为单独的层级管理
      listLevelStack: number[]; // 列表层级栈
      quoteLevelStack: number[]; // 引用层级栈
  }> = [
      {
          state: 'root',
          listActive: false,
          inParagraph: false,
          inBlockquote: false,
          headingActive: false,
          inTable: false,
          tableAlignments: [],
          tableRowCount: 0,
          tableStartIndex: null,
          listLevelStack: [],
          quoteLevelStack: []
      }
  ];

  // 获取当前状态
  get currentState() {
      return this._stateStack[this._stateStack.length - 1];
  }

  // 列表状态
  get isListActive() {
      return this.currentState.listActive;
  }

  // 段落状态
  get isInParagraph() {
      return this.currentState.inParagraph;
  }

  // 标题状态
  get isHeadingActive() {
      return this.currentState.headingActive;
  }

  // 引用状态
  get isInBlockquote() {
      return this.currentState.inBlockquote;
  }

  // 表格状态
  get isInTable() {
      return this.currentState.inTable;
  }

  // 获取表格列对齐方式
  get tableAlignments() {
      return this.currentState.tableAlignments;
  }

  // 获取表格行数
  get tableRowCount() {
      return this.currentState.tableRowCount;
  }

  // 获取表格起始位置
  get tableStartIndex(): number | null {
      return this.currentState.tableStartIndex;
  }

  // 设置表格起始位置
  setTableStartIndex(index: number | null) {
      this.currentState.tableStartIndex = index;
  }

  // 设置 inTable 状态
  setInTable(value: boolean) {
      this.currentState.inTable = value;
      if (!value) {
          this.currentState.tableAlignments = [];
          this.currentState.tableRowCount = 0;
          this.currentState.tableStartIndex = null;
      }
      // 修改：只在激活表格时添加状态
      if (value) {
        this.pushState('table');
      } else {
        this.popState('table');
      }
  }

  // 获取当前列表层级
  get currentListLevel() {
      return this.currentState.listLevelStack.length;
  }

  // 获取当前列表层级的缩进
  getCurrentListIndent(): number {
      const stack = this.currentState.listLevelStack;
      return stack.length > 0 ? stack[stack.length - 1] : 0;
  }

  resetListLevel() {
      this.currentState.listLevelStack = [];
  }
  // 进入新的列表层级
  enterListLevel(indent: number) {
      if (this.currentState.listLevelStack.length >= 5) {
          return; // 防止超过最大嵌套层级
      }
      this.currentState.listActive = true;
      this.currentState.listLevelStack.push(indent);
      if(!this.currentState.listActive) {
          this.setListActive(true);
      }
  }

  // 退出当前列表层级
  leaveListLevel() {
      if (this.currentState.listLevelStack.length > 0) {
          this.currentState.listLevelStack.pop();
          this.currentState.listActive = this.currentState.listLevelStack.length > 0;
      }
  }

  // 获取当前引用层级
  get currentQuoteLevel() {
      return this.currentState.quoteLevelStack.length;
  }

  // 状态栈管理方法 - 修改为更安全的实现
  pushState(state: string) {
      // 防止重复添加相同状态
      if (this._stateStack.length > 0 && this._stateStack[this._stateStack.length - 1].state === state) {
          console.log(`状态 ${state} 已经在栈顶，不重复添加`);
          return;
      }
      
      // 限制状态栈的最大深度，防止无限增长
      if (this._stateStack.length > 10) {
          console.warn(`状态栈深度超过10，可能存在循环解析问题，当前状态: ${state}`);
          // 保留根状态和当前状态，清理中间状态
          this._stateStack = [this._stateStack[0]];
      }
      
      console.log(`推入状态: ${state}, 当前栈深度: ${this._stateStack.length}`);
      this._stateStack.push({
          state,
          listActive: this.currentState.listActive,
          inParagraph: this.currentState.inParagraph,
          inBlockquote: this.currentState.inBlockquote,
          headingActive: this.currentState.headingActive,
          inTable: this.currentState.inTable,
          tableAlignments: [...this.currentState.tableAlignments],
          tableRowCount: this.currentState.tableRowCount,
          tableStartIndex: this.currentState.tableStartIndex,
          listLevelStack: [...this.currentState.listLevelStack],
          quoteLevelStack: [...this.currentState.quoteLevelStack]
      });
  }

  // 改进的popState方法，支持指定状态
  popState(expectedState?: string) {
      if (this._stateStack.length <= 1) {
          console.warn('尝试弹出根状态，操作被忽略');
          return;
      }
      
      // 如果指定了期望状态，则弹出直到找到该状态
      if (expectedState) {
          let found = false;
          // 从栈顶向下查找，但保留根状态
          for (let i = this._stateStack.length - 1; i > 0; i--) {
              if (this._stateStack[i].state === expectedState) {
                  // 找到指定状态，弹出到该状态（包括该状态）
                  this._stateStack.splice(i);
                  found = true;
                  console.log(`弹出到状态 ${expectedState}, 当前栈深度: ${this._stateStack.length}`);
                  break;
              }
          }
          
          if (!found) {
              console.warn(`未找到指定状态 ${expectedState}，保持当前状态栈`);
          }
      } else {
          // 没有指定状态，只弹出栈顶
          const poppedState = this._stateStack.pop();
          console.log(`弹出状态: ${poppedState?.state}, 当前栈深度: ${this._stateStack.length}`);
      }
  }
  
  // 设置 listActive 状态
  setListActive(value: boolean) {
      this.currentState.listActive = value;
      if(value === true) {
        this.pushState('list');
      } else {
        this.popState('list');
      }
  }

  // 设置 inParagraph 状态
  setInParagraph(value: boolean) {
      this.currentState.inParagraph = value;
      if(value === true) {
        this.pushState('paragraph');
      } else {
        this.popState('paragraph');
      }
  }

  // 设置 headingActive 状态
  setHeadingActive(value: boolean) {
      this.currentState.headingActive = value;
      if(value === true) {
        this.pushState('heading');
      } else {
        this.popState('heading');
      }
  }

  // 设置表格列对齐方式
  setTableAlignments(alignments: string[]) {
      this.currentState.tableAlignments = alignments;
  }

  // 增加表格行数
  incrementTableRowCount() {
      this.currentState.tableRowCount++;
  }

  // 获取当前行的列对齐方式
  getColumnAlignment(index: number): string {
      return this.currentState.tableAlignments[index] || 'left';
  }

  // 引用层级管理
  enterQuoteLevel() {
      this.currentState.quoteLevelStack.push(1);
      this.currentState.inBlockquote = true;
      this.pushState('blockquote');
  }

  leaveQuoteLevel() {
      this.currentState.quoteLevelStack.pop();
      if (this.currentState.quoteLevelStack.length === 0) {
          this.currentState.inBlockquote = false;
          this.popState('blockquote');
      }
  }

  // 获取所有行
  private _lines: string[] = [];
  setLines(lines: string[]) {
      this._lines = lines;
  }

  getLines(): string[] {
      return this._lines;
  }

  getCurrentLineIndex(): number {
      return this.currentLine;
  }

  // 重置状态
  reset() {
    // 完全重置状态栈，而不是尝试修改现有状态
    this._stateStack = [{
      state: 'root',
      listActive: false,
      inParagraph: false,
      inBlockquote: false,
      headingActive: false,
      inTable: false,
      tableAlignments: [],
      tableRowCount: 0,
      tableStartIndex: null,
      listLevelStack: [],
      quoteLevelStack: []
    }];
    
    // 重置当前行和缩进
    this.currentLine = 0;
    this.indentLevel = 0;
    
    // 重置行内容
    this._lines = [];
    
    // 日志输出，帮助调试
    console.log('ParsingContext 已完全重置');
  }

  private _stateHistory: Array<typeof this.currentState> = [];

  // 推送当前状态到历史记录
  pushCurrentStateToHistory() {
    this._stateHistory.push({...this._stateStack[this._stateStack.length - 1]});
  }

  // 获取前一个状态
  getPreviousState() {
    if (this._stateStack.length > 1) {
        return this._stateStack[this._stateStack.length - 2];
    } else {
        return null;
    }
  }
}