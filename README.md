# 字节再爱我一次 520 团队
## MiniMarkDownEditor项目开发
我们将会在这里记录我们的开发过程以及更新日志

## TODO 清单
- [✔] 完成 Token 的结构定义
- [✔] 完成 AST 的处理逻辑 
- 完成语法解析器的基础功能
    - [ ] 完成基础标签的解析（h 、 p 、 li 等）
    - [ ] 完成特殊标签的解析（img 、 a 、 hr 等）
    - [ ] 完成特殊标签的解析（blockquote 、 code 、 table 等）
    - [ ] 完成特殊标签的解析（ul 、 ol 等）
    - [ ] 完成特殊标签的解析（div 、 span 等）
    - [ ] 完成特殊标签的解析（hr 、 br 等）

- 完成渲染器的基础功能
    - [ ] 完成基础标签的渲染（h 、 p 、 li 等）
    - [ ] 完成特殊标签的渲染（img 、 a 、 hr 等）
    - [ ] 完成特殊标签的渲染（blockquote 、 code 、 table 等）
    - [ ] 完成特殊标签的渲染（ul 、 ol 等）
    - [ ] 完成特殊标签的渲染（div 、 span 等）
    - [ ] 完成特殊标签的渲染（hr 、 br 等）

- [ ] 引入状态机模型进行状态处理

## 更新日志
#### 2025-02-17 <br>
  @author COOSONWEI 完成了项目基础的架构划分具体如下：<br>
├── core # 核心系统入口和基础类型定义 <br>
│   ├── parser.ts # 解析器集成<br>
│   ├── renderer # 渲染器功能实现 <br>
│   │   └── htmlRender.ts <br>
│   ├── state.ts # 解析器上下文<br>
│   └── types # 接口定义<br>
│       ├── parser.interface.ts <br>
│       ├── renderer.interface.ts <br>
│       └── token.interface.ts <br>
├── index.ts # lib入口文件 <br>
├── parser # 解析器具体实现 <br>
│   ├── block # 块级解析 <br>
│   │   ├── index.ts <br>
│   │   ├── rules # 块级规则目录 <br>
│   │   └── state.ts # 块级状态机 <br>
│   ├── inline # 行级解析 <br>
│   │   ├── index.ts <br>
│   │   ├── rules # 行级规则目录 <br>
│   │   └── state.ts # 行级状态机 <br>
│   └── main.ts # 解析器 main 函数<br>
├── plugins # 插件注册与管理 <br>
│   └── manager.ts <br>
├── rules #规则管理 <br>
│   ├── base.ts # 基础规则接口<br>
│   └── manager.ts # 规则管理<br>
├── tokens # Token 数据结构与处理逻辑<br>
│   └── token.ts <br>
└── utils # 通用工具函数<br>
    ├── cache.ts <br>
    └── regex.ts # 正则表达式预编译<br>
#### 2025-02-18 <br>
  @author COOSONWEI 实现基础解析流程与段落/空行处理（p 标签实现）;
#### 2025-02-22 <br>
  @author COOSONWEI 实现 h 标签解析;
#### 2025-02-23 <br>
  @author COOSONWEI 实现 list 标签解析（ul 、 ol ）;
#### 2025-02-24 <br>
  @author COOSONWEI 实现  引用 标签解析（ul 、 ol ）;