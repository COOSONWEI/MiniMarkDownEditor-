import { ParsingContext } from "../state";
import { ParserState, ParserEvent } from "./state";


export class FSM {
    transitions: { [state: string]: { [event: string]: string } } = {};
    private currentState: string;


    constructor(initialState: string) {
        this.currentState = initialState;
        this.initializeTransitions();
    }


    private initializeTransitions() {
        // 初始状态转移
        this.transitions[ParserState.INITIAL] = {
            [ParserEvent.HEADING_MARKER]: ParserState.HEADING_1,
            [ParserEvent.LIST_MARKER]: ParserState.LIST_ITEM,
            [ParserEvent.CODE_MARKER]: ParserState.CODE_BLOCK,
            [ParserEvent.TEXT]: ParserState.PARAGRAPH,
            [ParserEvent.EMPTY_LINE]: ParserState.INITIAL
        };

        // 段落状态转移
        this.transitions[ParserState.PARAGRAPH] = {
            [ParserEvent.HEADING_MARKER]: ParserState.HEADING_1,
            [ParserEvent.LIST_MARKER]: ParserState.LIST_ITEM,
            [ParserEvent.CODE_MARKER]: ParserState.CODE_BLOCK,
            [ParserEvent.TABLE_MARKER]: ParserState.TABLE_ROW,
            [ParserEvent.QUOTE_MARKER]: ParserState.QUOTE_BLOCK,
            [ParserEvent.EMPTY_LINE]: ParserState.INITIAL,
            [ParserEvent.EXIT_PARAGRAPH]: ParserState.INITIAL
        };

        // 标题状态转移
        this.transitions[ParserState.HEADING_1] = {
            [ParserEvent.TEXT]: ParserState.HEADING_1,
            [ParserEvent.EMPTY_LINE]: ParserState.INITIAL,
            [ParserEvent.EXIT_HEADING]: ParserState.INITIAL,
          
            // 禁止在标题中触发其他结构
            [ParserEvent.LIST_MARKER]: "undefined",         // 拦截列表项
            [ParserEvent.CODE_MARKER]: "undefined",
            [ParserEvent.TABLE_MARKER]: "undefined",
        }

        // 列表项状态转移
        this.transitions[ParserState.LIST_ITEM] = {
            [ParserEvent.TEXT]: ParserState.LIST_ITEM,
            [ParserEvent.LIST_MARKER]: ParserState.LIST_ITEM, // 嵌套列表
            [ParserEvent.CODE_MARKER]: ParserState.CODE_BLOCK,
            [ParserEvent.TABLE_MARKER]: ParserState.TABLE_ROW,
            [ParserEvent.QUOTE_MARKER]: ParserState.QUOTE_BLOCK,
            [ParserEvent.EMPTY_LINE]: ParserState.INITIAL,
            [ParserEvent.EXIT_LIST]: ParserState.INITIAL,
            [ParserEvent.INDENT_CHANGE]: ParserState.LIST_ITEM, // 缩进调整仍保持列表项
            [ParserEvent.DEINDENT_CHANGE]: ParserState.INITIAL // 缩出列表
        };

        // 代码块状态转移
        this.transitions[ParserState.CODE_BLOCK] = {
            [ParserEvent.CODE_END_MARKER]: ParserState.PARAGRAPH,
            [ParserEvent.EMPTY_LINE]: ParserState.CODE_BLOCK, // 代码块中空行保持
            [ParserEvent.EXIT_CODE]: ParserState.PARAGRAPH
        };

        // 表格处理（简化示例）
        this.transitions[ParserState.TABLE_ROW] = {
            [ParserEvent.TABLE_MARKER]: ParserState.TABLE_CELL,
            [ParserEvent.EMPTY_LINE]: ParserState.INITIAL,
            [ParserEvent.EXIT_TABLE]: ParserState.INITIAL
        };

        this.transitions[ParserState.TABLE_CELL] = {
            [ParserEvent.TABLE_MARKER]: ParserState.TABLE_CELL, // 多列
            [ParserEvent.EMPTY_LINE]: ParserState.TABLE_ROW,   // 行结束
            [ParserEvent.EXIT_TABLE]: ParserState.INITIAL
        };

        // 引文块
        this.transitions[ParserState.QUOTE_BLOCK] = {
            [ParserEvent.QUOTE_END_MARKER]: ParserState.PARAGRAPH,
            [ParserEvent.EMPTY_LINE]: ParserState.QUOTE_BLOCK,
            [ParserEvent.EXIT_QUOTE]: ParserState.PARAGRAPH
        };
    }

    // 触发状态转换
  public trigger(event: ParserEvent, context?: ParsingContext): boolean {
    const transition = this.transitions[this.currentState]?.[event];
    
    if (transition === undefined) {
        console.warn(`No transition defined for state ${this.currentState} and event ${event}`);
        return false;
      }
  
      // 类型校验逻辑
      if (context && !this.isValidTransitionWithContext(transition, context)) {
        return false;
      }
  
      console.log(`[FSM] Transitioning from ${this.currentState} to ${transition} via event ${event}`);
      this.currentState = transition;
      return true;
  }

  private isValidTransitionWithContext(
    targetState: string,
    context: ParsingContext
  ): boolean {
    // 示例：在代码块中不允许突然转出到其他状态，必须通过 CODE_END_MARKER
    if (this.currentState === ParserState.CODE_BLOCK && 
        targetState !== ParserState.PARAGRAPH && 
        targetState !== ParserState.EXIT_CODE) {
      return false;
    }
    return true;
  }

   // 获取当前状态
   public getState(): string {
    return this.currentState;
  }

  // 重置状态机
  public reset() {
    this.currentState = ParserState.INITIAL;
  }

}