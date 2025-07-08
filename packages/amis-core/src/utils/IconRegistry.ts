/**
 * 全局图标注册系统
 * 支持从多个图标库注册图标到全局图标库中
 */

export interface IconItem {
  name: string;           // 图标名称（CSS 类名或标识符）
  type: 'fontawesome' | 'iconify' | 'custom' | 'amis' | 'svg';  // 图标类型
  category: string;       // 分类名称
  displayName: string;    // 显示名称
  unicode?: string;       // Unicode 编码（适用于自定义图标）
  tags?: string[];        // 标签（用于搜索）
  svg?: string;           // SVG 内容（适用于SVG图标）
  prefix?: string;        // 图标前缀
}

export interface IconCategory {
  name: string;
  id: string;
  icons: IconItem[];
}

class IconRegistry {
  private icons: IconItem[] = [];
  private categories: Map<string, IconCategory> = new Map();
  private changeListeners: Array<() => void> = [];

  /**
   * 注册图标到全局图标库
   * @param icons 图标数组
   * @param options 选项
   */
  register(icons: IconItem[], options: { merge?: boolean } = {}) {
    const { merge = true } = options;

    if (merge) {
      // 合并模式：去重后添加
      const existingNames = new Set(this.icons.map(icon => icon.name));
      const newIcons = icons.filter(icon => !existingNames.has(icon.name));
      this.icons.push(...newIcons);
    } else {
      // 替换模式：清空后重新添加
      this.icons = [...icons];
    }

    // 重新构建分类索引
    this.rebuildCategories();

    // 通知监听器
    this.notifyChange();
  }

  /**
   * 批量注册 FontAwesome 图标
   * @param iconNames 图标名称数组
   * @param options 选项
   */
  registerFontAwesome(iconNames: string[], options: {
    category?: string;
    prefix?: string;
    version?: string;
  } = {}) {
    const { category = 'FontAwesome', prefix = 'fa', version = '5' } = options;

    const icons: IconItem[] = iconNames.map(iconName => ({
      name: `${prefix} ${prefix}-${iconName}`,
      type: 'fontawesome',
      category,
      displayName: iconName.replace(/-/g, ' '),
      tags: iconName.split('-'),
      prefix
    }));

    this.register(icons);
  }

  /**
   * 批量注册 Iconify 图标
   * @param iconSet 图标集名称（如 'ep', 'mdi' 等）
   * @param iconNames 图标名称数组
   * @param options 选项
   */
  registerIconify(iconSet: string, iconNames: string[], options: {
    category?: string;
    displayName?: string;
  } = {}) {
    const { category = `Iconify ${iconSet.toUpperCase()}`, displayName } = options;

    const icons: IconItem[] = iconNames.map(iconName => ({
      name: `${iconSet}:${iconName}`,
      type: 'iconify',
      category: displayName || category,
      displayName: iconName.replace(/-/g, ' '),
      tags: iconName.split('-'),
      prefix: iconSet
    }));

    this.register(icons);
  }

  /**
   * 批量注册自定义图标
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
  }, options: { category?: string } = {}) {
    const { category = iconData.name } = options;

    const icons: IconItem[] = iconData.glyphs.map(glyph => ({
      name: `${iconData.css_prefix_text}${glyph.font_class}`,
      type: 'custom',
      category,
      displayName: glyph.name,
      unicode: glyph.unicode,
      tags: glyph.name.split(/[-_\s]/),
      prefix: iconData.css_prefix_text
    }));

    this.register(icons);
  }

  /**
   * 批量注册 SVG 图标
   * @param svgIcons SVG 图标数据
   * @param options 选项
   */
  registerSvgIcons(svgIcons: Array<{
    name: string;
    svg: string;
    category?: string;
  }>, options: { defaultCategory?: string } = {}) {
    const { defaultCategory = 'SVG Icons' } = options;

    const icons: IconItem[] = svgIcons.map(svgIcon => ({
      name: svgIcon.name,
      type: 'svg',
      category: svgIcon.category || defaultCategory,
      displayName: svgIcon.name.replace(/[-_]/g, ' '),
      tags: svgIcon.name.split(/[-_]/),
      svg: svgIcon.svg
    }));

    this.register(icons);
  }

  /**
   * 从 CSS 文件自动解析并注册图标
   * @param cssUrl CSS 文件 URL
   * @param options 选项
   */
  async registerFromCSS(cssUrl: string, options: {
    type: 'fontawesome' | 'custom';
    category: string;
    prefix?: string;
    pattern?: RegExp;
  }) {
    try {
      const response = await fetch(cssUrl);
      const cssText = await response.text();

      let iconNames: string[] = [];

      if (options.type === 'fontawesome') {
        // 解析 FontAwesome 图标
        const matches = cssText.match(/\.fa-([a-zA-Z0-9-]+):before/g);
        if (matches) {
          iconNames = matches.map(match => match.replace('.fa-', '').replace(':before', ''));
        }
      } else if (options.type === 'custom') {
        // 解析自定义图标
        const pattern = options.pattern || /\.([a-zA-Z0-9-_]+):before/g;
        const matches = cssText.match(pattern);
        if (matches) {
          iconNames = matches.map(match => match.replace(pattern, '$1'));
        }
      }

      if (options.type === 'fontawesome') {
        this.registerFontAwesome(iconNames, {
          category: options.category,
          prefix: options.prefix
        });
      } else {
        // 对于自定义图标，创建虚拟的 iconData
        const iconData = {
          name: options.category,
          css_prefix_text: options.prefix || '',
          glyphs: iconNames.map(name => ({
            name,
            font_class: name,
            unicode: ''
          }))
        };
        this.registerCustomIcons(iconData, { category: options.category });
      }
    } catch (error) {
      console.error('Failed to register icons from CSS:', error);
    }
  }

  /**
   * 获取所有图标
   */
  getAllIcons(): IconItem[] {
    return [...this.icons];
  }

  /**
   * 按分类获取图标
   */
  getIconsByCategory(categoryId: string): IconItem[] {
    const category = this.categories.get(categoryId);
    return category ? [...category.icons] : [];
  }

  /**
   * 获取所有分类
   */
  getCategories(): IconCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * 根据名称查找图标
   */
  findIcon(name: string): IconItem | undefined {
    return this.icons.find(icon => icon.name === name);
  }

  /**
   * 搜索图标
   */
  searchIcons(query: string): IconItem[] {
    const lowerQuery = query.toLowerCase();
    return this.icons.filter(icon =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.displayName.toLowerCase().includes(lowerQuery) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 清空所有图标
   */
  clear() {
    this.icons = [];
    this.categories.clear();
    this.notifyChange();
  }

  /**
   * 移除指定分类的图标
   */
  removeByCategory(categoryId: string) {
    this.icons = this.icons.filter(icon => icon.category !== categoryId);
    this.rebuildCategories();
    this.notifyChange();
  }

  /**
   * 添加变化监听器
   */
  addChangeListener(listener: () => void) {
    this.changeListeners.push(listener);
  }

  /**
   * 移除变化监听器
   */
  removeChangeListener(listener: () => void) {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * 重建分类索引
   */
  private rebuildCategories() {
    this.categories.clear();

    // 按分类分组图标
    const categoryMap = new Map<string, IconItem[]>();

    this.icons.forEach(icon => {
      const categoryId = icon.category;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)!.push(icon);
    });

    // 构建分类对象
    categoryMap.forEach((icons, categoryName) => {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      this.categories.set(categoryId, {
        name: categoryName,
        id: categoryId,
        icons
      });
    });
  }

  /**
   * 通知变化
   */
  private notifyChange() {
    this.changeListeners.forEach(listener => listener());
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalIcons: this.icons.length,
      totalCategories: this.categories.size,
      iconsByType: this.icons.reduce((acc, icon) => {
        acc[icon.type] = (acc[icon.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// 创建单例实例
export const iconRegistry = new IconRegistry();

// 导出类型和实例
export default iconRegistry;
export { IconRegistry }; 