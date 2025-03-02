// 基础的 HTML渲染器功能实现
// HTML 标签生成器，将 tag、attrs、children 转化成 HTML 字符串
function createTag(tag: string, attrs: Record<string, string> = {}, children: string | string[] = ''): string {
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    const childString = Array.isArray(children) ? children.join('') : children;
    return `<${tag}${attrString ? ` ${attrString}` : ''}>${childString}</${tag}>`;
  }
  
  // 实现一个 render 函数，将 ast 转化成 HTML 字符串
  function render(ast: any): string {
    if (typeof ast === 'string') {
      return ast;
    }
    if (Array.isArray(ast)) {
      return ast.map(render).join('');
    }
    const { tag, attrs = {}, children = [] } = ast;
    const childHtml = render(children);
    return createTag(tag, attrs, childHtml);
  }
