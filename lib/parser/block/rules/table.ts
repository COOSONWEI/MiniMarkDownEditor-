/**
 * 表格规则
 * @author COOSONWEI
 */
import { RULE_PRIORITIES } from "../../../command/priority";
import { ParsingContext } from "../../../core/state";
import { Token, TokenType } from "../../../tokens/token";
import { BaseBlockRule } from "./base";

export class TableRule extends BaseBlockRule {
    static readonly RULE_NAME = 'TableRule';

    private TABLE_REGEX = /^\s*\|\s*(\S+|\s+)\s*\|\s*(\S+|\s+)\s*\|\s*(\S+|\s+)\s*\|\s*$/;
    private TABLE_ALIGN_REGEX = /^:?-{3,}:?$/;
    private TABLE_DATA_REGEX = /^\s*\|\s*(?:[^|]+\s*)+\s*\|\s*$/;

    constructor() {
        super(RULE_PRIORITIES.TABLE); // 调整优先级，确保在列表和引用之后处理
    }

    match(line: string, ctx: ParsingContext): boolean {
        const nextLine = ctx.getLines()[ctx.getCurrentLineIndex() + 1];

        // 如果已经在表格中，继续匹配表格数据行
        if (ctx.isInTable) {
            return this.TABLE_DATA_REGEX.test(line);
        }

        // 检查是否是表格开始
        const isTableStart = this.TABLE_REGEX.test(line);
        if (!isTableStart) return false;

        // 检查下一行是否为分隔符行
        if (nextLine && this.isSeparatorLine(nextLine)) {
            return true;
        }
        
        // 避免与列表规则冲突
        if (line.match(/^ *[-*]/)) return false;
        
        return this.TABLE_REGEX.test(line.trim());
    }

    /**
     * 是否是分隔符行
     * @param line 
     * @returns 
     */
    private isSeparatorLine(line: string): boolean {
        const cells = this.escapedSplit(line);
        console.log(
            '处理后的 cells:',
            cells
        );
        return cells.every(cell => {
            const trimmed = cell.trim();
            return trimmed.length >= 3 && this.TABLE_ALIGN_REGEX.test(trimmed);
        });
    }

    /**
     * 处理转义分割符
     * @param str 
     * @returns 
     */
    private escapedSplit(str: string): string[] {
        // 处理转义竖线
        const normalizedStr = str.replace(/\\\|/g, '\u0001'); // 临时替换转义的竖线
        // 分割单元格并过滤空字符串
        const cells = normalizedStr.split('|').slice(1, -1);
        // 去除每个单元格的前后空格，并还原转义的竖线
        return cells.map(cell => cell.trim().replace(/\u0001/g, '|'));
    }


    execute(line: string, ctx: ParsingContext): Token[] {
        const tokens: Token[] = [];


        if (!ctx.isInTable) {
            const nextLine = ctx.getLines()[ctx.getCurrentLineIndex() + 1];
            if (nextLine && this.isSeparatorLine(nextLine)) {
                // 开始新表格
                const alignments = this.processSeparator(nextLine);
                ctx.setTableAlignments(alignments);
                console.log('执行了表格处理', ctx.getLines(), ctx.getLines().length)
                console.log('currentLineIndex', ctx.getCurrentLineIndex())
                // 处理表格主体
                tokens.push(new Token({ type: TokenType.TABLE_OPEN, tag: 'table', nesting: 1 }));
                tokens.push(new Token({ type: TokenType.TABLE_BODY_OPEN, tag: 'tbody', nesting: 1 }));
                this.processHeader(line, tokens);

                // 自动检测后续数据行
                let i = ctx.getCurrentLineIndex() + 2;
                while (i < ctx.getLines().length) {
                    const dataLine = ctx.getLines()[i];
                    console.log('处理数据行', dataLine);
                    console.log('行检测', this.isTableLine(dataLine))
                    if (this.isTableLine(dataLine)) {
                        console.log('处理表格数据');
                        this.processDataRow(dataLine, alignments, tokens);
                    } else {
                        break;
                    }
                    i++;
                }

                ctx.setTableAlignments(alignments);
                // 关闭表格标签并重置状态
                tokens.push(
                    new Token({ type: TokenType.TABLE_BODY_CLOSE, tag: 'tbody', nesting: -1 }),
                    new Token({ type: TokenType.TABLE_CLOSE, tag: 'table', nesting: -1 })
                );
                ctx.setInTable(true);
                ctx.setTableAlignments([]);
                // tokens[0].nesting = 1;
                // tokens[1].nesting = 1;
                // tokens[-2].nesting = -1;
                // tokens[-1].nesting = -1;
            }
        } else {
            this.processDataRow(line, ctx.tableAlignments || [], tokens);
        }
        return tokens;
    }

    /**
     * 处理表头
     * @param line 输入的行内容
     * @param tokens 当前的 Token 流
     */
    private processHeader(line: string, tokens: Token[]): void {
        const cells = this.escapedSplit(line);
        tokens.push(new Token({ type: TokenType.TABLE_HEADER_OPEN, nesting: 1, block: true, markup: 'thead' }));
        tokens.push(new Token({ type: TokenType.TABLE_ROW_OPEN, nesting: 1 }));
        console.log('执行表头处理')
        cells.forEach(cell => {
            tokens.push(new Token({
                type: TokenType.TABLE_CELL_OPEN,
                tag: 'th',
                nesting: 1,
                // attrs: { style: 'text-align: left' }
            }));
            tokens.push(new Token({ type: 'text', content: cell }));
            tokens.push(new Token({ type: TokenType.TABLE_CELL_CLOSE, tag: 'th', nesting: -1 }));
        });

        tokens.push(new Token({ type: TokenType.TABLE_ROW_CLOSE, nesting: -1 }));
        tokens.push(new Token({ type: TokenType.TABLE_HEADER_CLOSE, nesting: -1 }));
    }

    // 处理分隔符行
    private processSeparator(line: string): string[] {
        console.log('执行分隔符处理')
        return this.escapedSplit(line).map(cell => {
            const left = cell.startsWith(':') ? 'left' : 'center';
            const right = cell.endsWith(':') ? 'right' : left;
            return [left, right].filter(Boolean).join(' ') || 'left';
        });
    }

    /**
     * 处理数据行
     * 
     * @author COOSONWEI
     * @param line 输入的行内容
     * @param alignments 对齐方式
     * @param tokens 当前的 Token 流
     */
    private processDataRow(line: string, alignments: string[], tokens: Token[]): void {
        console.log('执行数据行处理');
        tokens.push(new Token({ type: TokenType.TABLE_ROW_OPEN, tag: 'tr', nesting: 1 }));

        const cells = this.escapedSplit(line);
        cells.forEach((cell, index) => {
            const alignment = alignments[index] || 'left';
            tokens.push(new Token({
                type: TokenType.TABLE_CELL_OPEN,
                tag: 'td',
                nesting: 1,
                attrs: { style: `text-align: ${alignment}` }
            }));
            tokens.push(new Token({ type: 'text', content: cell }));
            tokens.push(new Token({ type: TokenType.TABLE_CELL_CLOSE, tag: 'td', nesting: -1 }));
        });

        tokens.push(new Token({ type: TokenType.TABLE_ROW_CLOSE, tag: 'tr', nesting: -1 }));
    }

    /**
     * 是否是数据行判断（对于正则表达式判断发现正则表达式并不百分百成功）
     * @param line 
     * @param ctx 
     * @returns 
     */
    public isTableLine(line: string): boolean {
        const trimmedLine = line.trim();

        if (trimmedLine === '') return false;

        // 检查是否以 | 开头和结尾
        if (trimmedLine[0] !== '|' || trimmedLine[trimmedLine.length - 1] !== '|') {
            return false;
        }

        let pos = 1;
        let prevChar = trimmedLine[pos - 1];
        let hasNonWhiteSpace = false;
        const length = trimmedLine.length;
        let inCell = false;
        for (let i = 1; i < trimmedLine.length - 1; i++) {
          const ch = trimmedLine[i];
          if (ch === '\\') {
            // 转义字符，跳过下一个字符
            i++;
            continue;
          }
          if (ch === '|') {
            if (!inCell) {
              // 空单元格，跳过
              continue;
            }
            inCell = false;
          } else {
            inCell = true;
            if (!this.isSpace(ch)) {
              hasNonWhiteSpace = true;
            }
          }
        }

        // 最后一个字符必须是 |
        if (trimmedLine[length - 1] !== '|') return false;

        return hasNonWhiteSpace;
    }

    private isSpace(ch: string): boolean {
        return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
    }

}