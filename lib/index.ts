// 整个 lib 的入口文件

import { MarkdownParser } from "./core/parser";

/**
 * 入口测试
 */
process.stdin.setEncoding('utf8');

let input = '';

process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  
  process.stdin.on('end', () => {
    const parser = new MarkdownParser();
    const tokens = parser.parse(input);
    console.log(JSON.stringify(tokens, null, 2));
  });