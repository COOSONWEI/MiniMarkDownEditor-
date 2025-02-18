// 解析器上下文

/**&
 * 解析器上下文
 *
 * @author COOSONWEI
 */
export class ParsingContext {
    public currentLine = 0; 
    public indentLevel = 0;
    private _stateStack: string[] = ['root'];
  
    get currentState(): string {
      return this._stateStack[this._stateStack.length - 1];
    }
  
    pushState(state: string): void {
      this._stateStack.push(state);
    }
  
    popState(): void {
      if (this._stateStack.length > 1) {
        this._stateStack.pop();
      }
    }
  }