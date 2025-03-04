
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
      this.pushState('table');
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
          this.setListActive(true)
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

  // 状态栈管理方法
  pushState(state: string) {
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

  popState() {
      if (this._stateStack.length > 1) {
          this._stateStack.pop();
      }
  }
  // 设置 hr 状态

  // 设置 listActive 状态
  setListActive(value: boolean) {
      this.currentState.listActive = value;
      if(value === true) {
        this.pushState('list');
      }
  }

  // 设置 inParagraph 状态
  setInParagraph(value: boolean) {
      this.currentState.inParagraph = value;
      this.pushState('paragraph');
  }

  // 设置 headingActive 状态
  setHeadingActive(value: boolean) {
      this.currentState.headingActive = value;
      this.pushState('heading');
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

//   // 列表层级管理
//   enterListLevel(indent: number) {
//       this.currentState.listLevelStack.push(indent);
//   }

//   leaveListLevel() {
//       this.currentState.listLevelStack.pop();
//   }

//   getCurrentListIndent(): number {
//       const stack = this.currentState.listLevelStack;
//       return stack.length > 0 ? stack[stack.length - 1] : 0;
//   }

  // 引用层级管理
  enterQuoteLevel() {
      this.currentState.quoteLevelStack.push(1);
      this.currentState.inBlockquote = true;
      this.pushState('blockquote');
  }

  leaveQuoteLevel() {
      this.currentState.quoteLevelStack.pop();
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
    this.setInParagraph(false);
    this.setListActive(false);
    this.setHeadingActive(false);
    this.setInTable(false);
    
    // 重置引用状态
    this.currentState.inBlockquote = false;
    this.currentState.quoteLevelStack = [];
    
    // 重置列表层级
    this.currentState.listLevelStack = [];
    
    // 重置当前行索引
    this.currentLine = 0;
    this.indentLevel = 0;
  }

  private _stateHistory: Array<typeof this.currentState> = [];

  // 推送当前状态到历史记录
  pushCurrentStateToHistory() {
    this._stateHistory.push({...this._stateStack[this._stateStack.length - 1]});
  }

  // 获取前一个状态
  getPreviousState() {
    if (this._stateStack.length > 0){
        const thisStack = this._stateStack;
        return this._stateStack[this._stateStack.length - 1];
    } else {
        return null;
    }
    console.log('this._stateHistory: ', this._stateHistory);
  }
}