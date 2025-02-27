
/**
 * 状态机管理器
 */

import { FSM } from "./fsm";
import { ParserEvent, ParserState } from "./state";

export class FSMManager {
    private static instance: FSMManager;
  
    private fsm: FSM;
  
    private constructor(initialState: ParserState = ParserState.INITIAL) {
      this.fsm = new FSM(initialState);
    }
  
    public static getInstance(initialState?: ParserState): FSMManager {
      if (!FSMManager.instance) {
        FSMManager.instance = new FSMManager(initialState || ParserState.INITIAL);
      }
      return FSMManager.instance;
    }
  
    public getFSM(): FSM {
      return this.fsm;
    }
  
    public reloadTransitions() {
      // 动态重新加载状态转移表（适用于热更新场景）
      this.fsm.transitions = this.buildTransitions();
      this.fsm.reset();
    }
  
    private buildTransitions(): { [state: string]: { [event: string]: string } } {
      // 这里可以动态加载配置文件或扩展模块
      return {
        // ... 所有状态转移定义（与FSM类中相同）
        [ParserState.INITIAL]: {
            [ParserEvent.HEADING_MARKER]: ParserState.HEADING_1,
            // ... 完整填充所有状态转移
          },
        // 实际项目中建议将此部分抽离为单独的配置文件
      };
    }
  }