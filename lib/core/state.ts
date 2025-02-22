// 解析器上下文

/**&
 * 解析器上下文
 *
 * @author COOSONWEI
 */
export class ParsingContext {
  public currentLine = 0;
  public indentLevel = 0;
  private _stateStack: Array<{
    state: string;
    listActive: boolean;
    inParagraph: boolean;
    headingActive: boolean;
  }> = [{ state: 'root', listActive: false, inParagraph: false, headingActive: false }];


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


  // 状态管理方法
  pushState(state: string) {
    this._stateStack.push({
      state,
      listActive: this.currentState.listActive,
      inParagraph: this.currentState.inParagraph,
      headingActive: this.currentState.headingActive
    });
  }

  popState() {
    if (this._stateStack.length > 1) {
      this._stateStack.pop();
    }
  }

  setListActive(value: boolean) {
    this.currentState.listActive = value;
  }

  setInParagraph(value: boolean) {
    this.currentState.inParagraph = value;
  }

  setHeadingActive(value: boolean) {
    this.currentState.headingActive = value;
  }

}