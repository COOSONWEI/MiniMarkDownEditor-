import { MarkdownParser } from "./lib/core/parser";


const parser = new MarkdownParser({ debug: true });
const tokens = parser.parse(`Hello\n\nWorld`);
console.log(tokens);