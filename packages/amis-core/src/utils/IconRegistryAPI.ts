/**
 * 图标注册API
 * 提供简化的批量注册图标的方法
 */

import { iconRegistry, IconItem } from './IconRegistry';
import iconLoader from './IconLoader';

export interface IconRegistryConfig {
  fontAwesome?: {
    enabled?: boolean;
    version?: '4' | '5' | '6';
    cssUrl?: string;
    iconList?: string[];
    category?: string;
  };
  iconify?: Array<{
    iconSet: string;
    iconList?: string[];
    category?: string;
    enabled?: boolean;
  }>;
  custom?: Array<{
    name: string;
    jsonUrl?: string;
    cssUrl?: string;
    icons?: IconItem[];
    category?: string;
    enabled?: boolean;
  }>;
  amis?: {
    enabled?: boolean;
    cssUrl?: string;
    category?: string;
  };
  svg?: Array<{
    name: string;
    icons: Array<{
      name: string;
      svg: string;
      category?: string;
    }>;
    category?: string;
    enabled?: boolean;
  }>;
}

export class IconRegistryAPI {
  private static instance: IconRegistryAPI;
  private initialized = false;
  private config: IconRegistryConfig = {};

  static getInstance(): IconRegistryAPI {
    if (!IconRegistryAPI.instance) {
      IconRegistryAPI.instance = new IconRegistryAPI();
    }
    return IconRegistryAPI.instance;
  }

  /**
   * 初始化图标注册系统
   * @param config 配置选项
   */
  async initialize(config: IconRegistryConfig): Promise<void> {
    this.config = config;

    if (this.initialized) {
      console.warn('IconRegistryAPI already initialized');
      return;
    }

    try {
      await this.loadIcons();
      this.initialized = true;
      console.log('IconRegistryAPI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IconRegistryAPI:', error);
      throw error;
    }
  }

  /**
   * 批量注册图标
   * @param icons 图标数组
   * @param category 分类名称
   * @param options 选项
   */
  registerIcons(icons: IconItem[], category?: string, options: {
    merge?: boolean;
    replace?: boolean;
  } = {}): void {
    const { merge = true, replace = false } = options;

    if (category && replace) {
      // 先删除该分类的所有图标
      iconRegistry.removeByCategory(category);
    }

    // 如果指定了分类，为所有图标设置分类
    if (category) {
      icons = icons.map(icon => ({
        ...icon,
        category: category
      }));
    }

    iconRegistry.register(icons, { merge });
  }

  /**
   * 注册FontAwesome图标
   * @param iconNames 图标名称数组
   * @param options 选项
   */
  registerFontAwesome(iconNames: string[], options: {
    category?: string;
    prefix?: string;
    version?: string;
  } = {}): void {
    iconRegistry.registerFontAwesome(iconNames, options);
  }

  /**
   * 注册Iconify图标
   * @param iconSet 图标集名称
   * @param iconNames 图标名称数组
   * @param options 选项
   */
  registerIconify(iconSet: string, iconNames: string[], options: {
    category?: string;
    displayName?: string;
  } = {}): void {
    iconRegistry.registerIconify(iconSet, iconNames, options);
  }

  /**
   * 注册自定义图标
   * @param iconData 自定义图标数据
   * @param options 选项
   */
  registerCustomIcons(iconData: {
    name: string;
    css_prefix_text: string;
    glyphs: Array<{
      name: string;
      font_class: string;
      unicode: string;
    }>;
  }, options: { category?: string } = {}): void {
    iconRegistry.registerCustomIcons(iconData, options);
  }

  /**
   * 注册SVG图标
   * @param svgIcons SVG图标数组
   * @param options 选项
   */
  registerSvgIcons(svgIcons: Array<{
    name: string;
    svg: string;
    category?: string;
  }>, options: { defaultCategory?: string } = {}): void {
    iconRegistry.registerSvgIcons(svgIcons, options);
  }

  /**
   * 从配置加载图标
   */
  private async loadIcons(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    // 加载FontAwesome图标
    if (this.config.fontAwesome?.enabled !== false) {
      loadPromises.push(
        iconLoader.loadFontAwesome(this.config.fontAwesome || {})
          .then(() => console.log('FontAwesome icons loaded'))
          .catch(error => console.error('Failed to load FontAwesome icons:', error))
      );
    }

    // 加载Iconify图标
    if (this.config.iconify) {
      this.config.iconify.forEach(config => {
        if (config.enabled !== false) {
          loadPromises.push(
            iconLoader.loadIconify(config.iconSet, config)
              .then(() => console.log(`Iconify ${config.iconSet} icons loaded`))
              .catch(error => console.error(`Failed to load Iconify ${config.iconSet} icons:`, error))
          );
        }
      });
    }

    // 加载自定义图标
    if (this.config.custom) {
      this.config.custom.forEach(config => {
        if (config.enabled !== false) {
          if (config.jsonUrl) {
            // 从JSON文件加载
            loadPromises.push(
              iconLoader.loadCustomIcons(config.jsonUrl, config)
                .then(() => console.log(`Custom icons from ${config.jsonUrl} loaded`))
                .catch(error => console.error(`Failed to load custom icons from ${config.jsonUrl}:`, error))
            );
          } else if (config.icons) {
            // 直接注册图标
            loadPromises.push(
              Promise.resolve().then(() => {
                this.registerIcons(config.icons!, config.category);
                console.log(`Custom icons ${config.name} registered`);
              })
            );
          }
        }
      });
    }

    // 加载Amis图标
    if (this.config.amis?.enabled !== false) {
      loadPromises.push(
        iconLoader.loadAmisIcons(this.config.amis || {})
          .then(() => console.log('Amis icons loaded'))
          .catch(error => console.error('Failed to load Amis icons:', error))
      );
    }

    // 加载SVG图标
    if (this.config.svg) {
      this.config.svg.forEach(config => {
        if (config.enabled !== false) {
          loadPromises.push(
            Promise.resolve().then(() => {
              iconRegistry.registerSvgIcons(config.icons, {
                defaultCategory: config.category
              });
              console.log(`SVG icons ${config.name} registered`);
            })
          );
        }
      });
    }

    await Promise.all(loadPromises);
  }

  /**
   * 获取所有图标
   */
  getAllIcons(): IconItem[] {
    return iconRegistry.getAllIcons();
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    return iconRegistry.getCategories();
  }

  /**
   * 搜索图标
   */
  searchIcons(query: string): IconItem[] {
    return iconRegistry.searchIcons(query);
  }

  /**
   * 根据名称查找图标
   */
  findIcon(name: string): IconItem | undefined {
    return iconRegistry.findIcon(name);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return iconRegistry.getStats();
  }

  /**
   * 重新加载图标
   */
  async reload(): Promise<void> {
    iconRegistry.clear();
    iconLoader.reset();
    this.initialized = false;
    await this.initialize(this.config);
  }

  /**
   * 清空所有图标
   */
  clear(): void {
    iconRegistry.clear();
    iconLoader.reset();
    this.initialized = false;
  }

  /**
   * 添加变化监听器
   */
  addChangeListener(listener: () => void): void {
    iconRegistry.addChangeListener(listener);
  }

  /**
   * 移除变化监听器
   */
  removeChangeListener(listener: () => void): void {
    iconRegistry.removeChangeListener(listener);
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 获取当前配置
   */
  getConfig(): IconRegistryConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  async updateConfig(newConfig: Partial<IconRegistryConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.reload();
  }
}

// 创建单例实例
export const iconRegistryAPI = IconRegistryAPI.getInstance();

// 便捷方法
export const registerIcons = (icons: IconItem[], category?: string, options?: {
  merge?: boolean;
  replace?: boolean;
}): void => {
  iconRegistryAPI.registerIcons(icons, category, options);
};

export const registerFontAwesome = (iconNames: string[], options?: {
  category?: string;
  prefix?: string;
  version?: string;
}): void => {
  iconRegistryAPI.registerFontAwesome(iconNames, options);
};

export const registerIconify = (iconSet: string, iconNames: string[], options?: {
  category?: string;
  displayName?: string;
}): void => {
  iconRegistryAPI.registerIconify(iconSet, iconNames, options);
};

export const registerCustomIcons = (iconData: {
  name: string;
  css_prefix_text: string;
  glyphs: Array<{
    name: string;
    font_class: string;
    unicode: string;
  }>;
}, options?: { category?: string }): void => {
  iconRegistryAPI.registerCustomIcons(iconData, options);
};

export const registerSvgIcons = (svgIcons: Array<{
  name: string;
  svg: string;
  category?: string;
}>, options?: { defaultCategory?: string }): void => {
  iconRegistryAPI.registerSvgIcons(svgIcons, options);
};

export const initializeIconRegistry = async (config: IconRegistryConfig): Promise<void> => {
  await iconRegistryAPI.initialize(config);
};

// 导出类型和实例
export default iconRegistryAPI; 