export class ParsingContext {
  public currentLine = 0;
  public indentLevel = 0;
  private _stateStack: Array<{
      state: string;
      listActive: boolean; // 列表状态
      inParagraph: boolean; // 段落状态
      headingActive: boolean; // 标题状态
      listLevelStack: number[]; // 列表层级栈（后续可能考虑抽离为单独的管理类）
  }> = [
      {
          state: 'root',
          listActive: false,
          inParagraph: false,
          headingActive: false,
          listLevelStack: []
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

  // 获取当前列表层级
  get currentListLevel() {
      return this.currentState.listLevelStack.length;
  }

  // 状态栈管理方法
  pushState(state: string) {
      this._stateStack.push({
          state,
          listActive: this.currentState.listActive,
          inParagraph: this.currentState.inParagraph,
          headingActive: this.currentState.headingActive,
          listLevelStack: [...this.currentState.listLevelStack] // 复制列表层级栈
      });
  }

  // 状态栈出栈
  popState() {
      if (this._stateStack.length > 1) {
          this._stateStack.pop();
      }
  }

  // 设置 listActive 状态
  setListActive(value: boolean) {
      this.currentState.listActive = value;
  }

  // 设置 inParagraph 状态
  setInParagraph(value: boolean) {
      this.currentState.inParagraph = value;
  }

  // 设置 headingActive 状态
  setHeadingActive(value: boolean) {
      this.currentState.headingActive = value;
  }

  // 进入新的列表层级
  enterListLevel(indent: number) {
      this.currentState.listLevelStack.push(indent);
  }

  // 离开当前列表层级
  leaveListLevel() {
      if (this.currentState.listLevelStack.length > 0) {
          this.currentState.listLevelStack.pop();
      }
  }

  // 获取当前列表层级的缩进
  getCurrentListIndent() {
      return this.currentState.listLevelStack[this.currentState.listLevelStack.length - 1];
  }
}