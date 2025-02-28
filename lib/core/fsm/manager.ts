/**
 * 状态机管理器
 * 用于统一管理不同模块的状态机实例
 */

// 状态转换接口
interface StateTransition<S, E> {
    from: S;        // 当前状态
    to: S;          // 目标状态
    event: E;       // 触发事件
    action?: () => void;  // 转换时执行的动作
}

// 状态机配置接口
interface StateMachineConfig<S, E> {
    initialState: S;  // 初始状态
    transitions: StateTransition<S, E>[];  // 状态转换规则
}

// 状态机类
export class StateMachine<S, E> {
    private currentState: S;
    private transitions: StateTransition<S, E>[];
    private readonly initialState: S;

    constructor(config: StateMachineConfig<S, E>) {
        this.currentState = config.initialState;
        this.initialState = config.initialState;
        this.transitions = config.transitions;
        this.validateTransitions();
    }

    // 获取当前状态
    getCurrentState(): S {
        return this.currentState;
    }

    // 重置状态机
    reset(): void {
        this.currentState = this.initialState;
    }

    // 触发状态转换
    trigger(event: E): boolean {
        const transition = this.transitions.find(t =>
            t.from === this.currentState && t.event === event
        );

        if (transition) {
            this.currentState = transition.to;
            transition.action?.();
            return true;
        }

        return false;
    }

    // 验证状态转换规则
    private validateTransitions(): void {
        const states = new Set<S>();
        states.add(this.initialState);

        this.transitions.forEach(t => {
            states.add(t.from);
            states.add(t.to);
        });

        // 验证每个状态是否都有可达路径
        states.forEach(state => {
            if (state !== this.initialState && !this.hasPathToState(state)) {
                console.warn(`警告: 状态 ${String(state)} 可能无法从初始状态到达`);
            }
        });
    }

    // 检查是否存在到达目标状态的路径
    private hasPathToState(targetState: S): boolean {
        const visited = new Set<S>();
        const queue: S[] = [this.initialState];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current === targetState) return true;
            if (visited.has(current)) continue;

            visited.add(current);
            this.transitions
                .filter(t => t.from === current)
                .forEach(t => queue.push(t.to));
        }

        return false;
    }
}

// 状态机管理器类
export class StateMachineManager {
    private machines: Map<string, StateMachine<any, any>> = new Map();

    // 注册状态机
    register<S, E>(name: string, machine: StateMachine<S, E>): void {
        if (this.machines.has(name)) {
            throw new Error(`状态机 ${name} 已经存在`);
        }
        this.machines.set(name, machine);
    }

    // 获取状态机
    getMachine<S, E>(name: string): StateMachine<S, E> | null {
        return this.machines.get(name) || null;
    }

    // 重置指定状态机
    resetMachine(name: string): void {
        const machine = this.machines.get(name);
        if (machine) {
            machine.reset();
        }
    }

    // 重置所有状态机
    resetAll(): void {
        this.machines.forEach(machine => machine.reset());
    }
}