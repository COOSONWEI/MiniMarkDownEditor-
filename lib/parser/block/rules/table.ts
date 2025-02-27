
/**
 * 表格规则
 * @author COOSONWEI
 * 
 */



import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class TableRule extends BaseBlockRule {
    static readonly RULE_NAME = 'TableRule';
    

    private TABLE_REGEX = /^\s*\|(.+)\|\s*$/;
    private TABLE_ALIGN_REGEX = /^:?-{3,}:?$/;
    private TABLE_DATA_REGEX = /^\s*\|(?:\s*[^|]+?)+\|\s*$/;

    constructor() {
        super(13); // 调整优先级，确保在列表和引用之后处理
    }

    match(line: string, ctx: ParsingContext): boolean {
        const lines = ctx.getLines();
        const index = ctx.getCurrentLineIndex();
        const currentLine = line;
        const nextLine = lines[index + 1];

        // 如果已经在表格状态中
        if (ctx.isInTable) {
            // 检查是否为表格数据行，同时验证列数是否匹配
            const isDataRow = this.TABLE_DATA_REGEX.test(currentLine);
            if (isDataRow) {
                const currentCells = this.escapedSplit(currentLine);
                const headerCells = this.escapedSplit(ctx.getLines()[ctx.tableStartIndex || 0]);
                return currentCells.length === headerCells.length;
            }
            // 如果不是有效的表格数据行，结束表格状态
            ctx.setInTable(false);
            return false;
        }

        // 检查是否为表格开始
        const isTableStart = this.TABLE_REGEX.test(currentLine);
        const isSeparator = nextLine && this.isSeparatorLine(nextLine);

        if (isTableStart && isSeparator) {
            // 验证分隔符行的列数是否与表头匹配
            const headerCells = this.escapedSplit(currentLine);
            const separatorCells = this.escapedSplit(nextLine);
            if (headerCells.length === separatorCells.length) {
                ctx.setInTable(true);
                ctx.setTableStartIndex(index); // 记录表格开始位置
                return true;
            }
        }
        return false;
    }

    private isSeparatorLine(line: string): boolean {
        const cells = this.escapedSplit(line);
        return cells.every(cell => {
            return this.TABLE_ALIGN_REGEX.test(cell.trim()) && cell.trim().length >= 3;
        });
    }

    private escapedSplit(str: string): string[] {
        const result: string[] = [];
        const max = str.length;
        let pos = 0;
        let ch = str.charCodeAt(pos);
        let isEscaped = false;
        let lastPos = 0;
        let current = '';

        while (pos < max) {
            if (ch === 0x7c/* | */) {
                if (!isEscaped) {
                    result.push(current + str.substring(lastPos, pos));
                    current = '';
                    lastPos = pos + 1;
                } else {
                    current += str.substring(lastPos, pos - 1);
                    lastPos = pos;
                }
            }

            isEscaped = (ch === 0x5c/* \ */);
            pos++;
            ch = str.charCodeAt(pos);
        }

        result.push(current + str.substring(lastPos));
        return result.slice(1, -1).map(c => c.trim());
    }

    execute(line: string, ctx: ParsingContext): Token[] {
        const lines = ctx.getLines();
        const index = ctx.getCurrentLineIndex();
        const tokens: Token[] = [];
        const currentLine = line;

        if (!ctx.isInTable) {
            const nextLine = lines[index + 1];
            if (nextLine && this.isSeparatorLine(nextLine)) {
                // 开始新表格
                tokens.push(new Token({
                    type: TokenType.TABLE_OPEN,
                    tag: 'table',
                    nesting: 1,
                    content: '',
                    block: true,
                }));

                // 处理表头和分隔符
                this.processHeader(currentLine, tokens);
                const alignments = this.processSeparator(nextLine);
                ctx.setTableAlignments(alignments);

                // 处理表格主体
                tokens.push(new Token({
                    type: TokenType.TABLE_BODY_OPEN,
                    tag: 'tbody',
                    nesting: 1,
                    content: '',
                    block: true,
                }));

                // 预处理后续数据行
                for (let i = index + 2; i < lines.length; i++) {
                    const dataLine = lines[i];
                    if (!this.TABLE_DATA_REGEX.test(dataLine)) {
                        break;
                    }
                    this.processDataRow(dataLine, alignments, tokens);
                    ctx.currentLine = i; // 更新当前行索引
                }

                // 关闭表格标签
                tokens.push(
                    new Token({
                        type: TokenType.TABLE_BODY_CLOSE,
                        tag: 'tbody',
                        nesting: -1,
                        content: '',
                        block: true,
                    }),
                    new Token({
                        type: TokenType.TABLE_CLOSE,
                        tag: 'table',
                        nesting: -1,
                        content: '',
                        block: true,
                    })
                );

                ctx.setInTable(false);
            }
        } else if (this.TABLE_DATA_REGEX.test(currentLine)) {
            // 处理表格数据行，使用保存的对齐信息
            this.processDataRow(currentLine, ctx.tableAlignments || [], tokens);
        }

        return tokens;
    }

    private processHeader(line: string, tokens: Token[]): void {
        const cells = this.escapedSplit(line);
        tokens.push(
            new Token({
                type: TokenType.TABLE_HEADER_OPEN,
                tag: 'thead',
                nesting: 1,
                content: '',
                block: true,
            }),
            new Token({
                type: TokenType.TABLE_ROW_OPEN,
                tag: 'tr',
                nesting: 1,
                content: '',
                block: true,
            })
        );

        cells.forEach(cell => {
            tokens.push(
                new Token({ type: TokenType.TABLE_CELL_OPEN, tag: 'th', nesting: 1 }),
                new Token({ type: TokenType.TEXT, content: cell }),
                new Token({ type: TokenType.TABLE_CELL_CLOSE, tag: 'th', nesting: -1 })
            );
        });

        tokens.push(
            new Token({ type: TokenType.TABLE_ROW_CLOSE, tag: 'tr', nesting: -1 }),
            new Token({ type: TokenType.TABLE_HEADER_CLOSE, tag: 'thead', nesting: -1 })
        );
    }

    private processSeparator(line: string): string[] {
        const cells = this.escapedSplit(line);
        return cells.map(cell => {
            const left = cell.startsWith(':') ? 'left' : '';
            const right = cell.endsWith(':') ? 'right' : '';
            return [left, right].filter(Boolean).join(' ') || 'center';
        });
    }

    private processDataRow(line: string, alignments: string[], tokens: Token[]): void {
        tokens.push(
            new Token({ type: TokenType.TABLE_ROW_OPEN, tag: 'tr', nesting: 1 })
        );

        const cells = this.escapedSplit(line);
        cells.forEach((cell, index) => {
            tokens.push(
                new Token({
                    type: TokenType.TABLE_CELL_OPEN,
                    tag: 'td',
                    nesting: 1,
                    attrs: { style: `text-align: ${alignments[index] || 'left'}` }
                }),
                new Token({ type: TokenType.TEXT, content: cell }),
                new Token({ type: TokenType.TABLE_CELL_CLOSE, tag: 'td', nesting: -1 })
            );
        });

        tokens.push(
            new Token({ type: TokenType.TABLE_ROW_CLOSE, tag: 'tr', nesting: -1 })
        );
    }
}