// 渲染器管理器实现

import { Token } from "../../tokens/token";
import { BaseRenderer } from "./baseRenderer";
import { HtmlRenderer } from "./htmlRender";
import { CodeRenderer } from "./codeRenderer";

/**
 * 渲染器类型枚举
 */
export enum RendererType {
  HTML = 'html',
  CODE = 'code'
}

/**
 * 渲染器管理器
 * 负责管理和协调不同类型的渲染器
 * @author COOSONWEI
 */
export class RendererManager {
  private renderers: Map<RendererType, BaseRenderer> = new Map();
  private defaultRenderer: RendererType = RendererType.HTML;
  
  constructor() {
    // 注册默认渲染器
    this.registerRenderer(RendererType.HTML, new HtmlRenderer());
    this.registerRenderer(RendererType.CODE, new CodeRenderer());
  }
  
  /**
   * 注册渲染器
   * @param type 渲染器类型
   * @param renderer 渲染器实例
   */
  public registerRenderer(type: RendererType, renderer: BaseRenderer): void {
    this.renderers.set(type, renderer);
  }
  
  /**
   * 设置默认渲染器
   * @param type 渲染器类型
   */
  public setDefaultRenderer(type: RendererType): void {
    if (!this.renderers.has(type)) {
      throw new Error(`Renderer of type ${type} is not registered`);
    }
    this.defaultRenderer = type;
  }
  
  /**
   * 获取指定类型的渲染器
   * @param type 渲染器类型
   * @returns 渲染器实例
   */
  public getRenderer(type: RendererType): BaseRenderer {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`Renderer of type ${type} is not registered`);
    }
    return renderer;
  }
  
  /**
   * 使用默认渲染器渲染Markdown文档
   * @param tokens 解析后的Token数组
   * @returns 渲染后的内容
   */
  public render(tokens: Token[]): string {
    return this.renderWith(this.defaultRenderer, tokens);
  }
  
  /**
   * 使用指定类型的渲染器渲染Markdown文档
   * @param type 渲染器类型
   * @param tokens 解析后的Token数组
   * @returns 渲染后的内容
   */
  public renderWith(type: RendererType, tokens: Token[]): string {
    const renderer = this.getRenderer(type);
    return renderer.render(tokens);
  }
}