// 定义 Token 类
class Token {
    constructor(
        public type: string,
        public tag: string,
        public nesting: number,
        public content?: string,
        public children?: Token[]
    ) {}
}

// 定义 Token 类型枚举
enum TokenType {
    LIST_OPEN = 'list_open',
    LIST_CLOSE = 'list_close',
    LIST_ITEM_OPEN = 'list_item_open',
    LIST_ITEM_CLOSE = 'list_item_close',
    TEXT = 'text'
}

// 定义解析上下文类
class ParsingContext {
    isListActive = false;
    listLevelStack: number[] = [];

    setListActive(active: boolean) {
        this.isListActive = active;
    }

    getCurrentListLevel() {
        return this.listLevelStack.length;
    }

    enterListLevel(indent: number) {
        this.listLevelStack.push(indent);
    }

    leaveListLevel() {
        this.listLevelStack.pop();
    }
}

// 定义列表规则类
class ListRule {
    private unorderedRegex = /^([ \t]*)([-\*\+])\s+(.*)/;
    private orderedRegex = /^([ \t]*)(\d+)\.\s+(.*)/;

    match(line: string, ctx: ParsingContext): boolean {
        return this.unorderedRegex.test(line) || this.orderedRegex.test(line);
    }

    execute(line: string, ctx: ParsingContext): Token[] {
        const tokens: Token[] = [];
        let match: RegExpMatchArray | null;
        let indent: number;
        let isOrdered: boolean;

        if ((match = line.match(this.unorderedRegex))) {
            indent = match[1].length;
            isOrdered = false;
        } else if ((match = line.match(this.orderedRegex))) {
            indent = match[1].length;
            isOrdered = true;
        } else {
            return [];
        }

        const content = match[3];
        const currentLevel = ctx.getCurrentListLevel();

        // 处理列表层级变化
        while (
            currentLevel > 0 &&
            indent <= ctx.listLevelStack[currentLevel - 1]
        ) {
            ctx.leaveListLevel();
            tokens.push(
                new Token(
                    TokenType.LIST_CLOSE,
                    isOrdered ? 'ol' : 'ul',
                    -1
                )
            );
        }

        if (
            currentLevel === 0 ||
            indent > ctx.listLevelStack[currentLevel - 1]
        ) {
            ctx.enterListLevel(indent);
            tokens.push(
                new Token(
                    TokenType.LIST_OPEN,
                    isOrdered ? 'ol' : 'ul',
                    1
                )
            );
        }

        // 添加列表项
        tokens.push(
            new Token(TokenType.LIST_ITEM_OPEN, 'li', 1),
            new Token(TokenType.TEXT, '', 0, content),
            new Token(TokenType.LIST_ITEM_CLOSE, 'li', -1)
        );

        return tokens;
    }
}

// 定义解析器类
class MarkdownParser {
    private listRule = new ListRule();
    private ctx = new ParsingContext();

    parse(input: string): Token[] {
        const lines = input.split('\n');
        const tokens: Token[] = [];

        for (const line of lines) {
            if (this.listRule.match(line, this.ctx)) {
                const lineTokens = this.listRule.execute(line, this.ctx);
                tokens.push(...lineTokens);
            }
        }

        // 关闭所有打开的列表
        while (this.ctx.getCurrentListLevel() > 0) {
            this.ctx.leaveListLevel();
            tokens.push(
                new Token(TokenType.LIST_CLOSE, 'ul', -1)
            );
        }

        return tokens;
    }
}

test('ListRule', () => {
    // 测试代码
const markdown = `- 一级列表
  - 二级列表
    - 三级列表
     - 四级列表
  - 二级列表
- 回到一级列表`;

const parser = new MarkdownParser();
const tokens = parser.parse(markdown);

console.log('Tokens:', tokens);
})
