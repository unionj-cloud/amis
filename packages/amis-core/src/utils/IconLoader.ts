/**
 * 图标加载工具类
 * 支持从不同来源加载图标数据
 */

import {iconRegistry, IconItem} from './IconRegistry';
import {amisIconfont} from './amisIconfont';
import {elementPlusIcon} from './elementPlusIcon';
import {fontawesome4} from './fontawesome4';

export class IconLoader {
  private static instance: IconLoader;
  private loadedSources: Set<string> = new Set();

  static getInstance(): IconLoader {
    if (!IconLoader.instance) {
      IconLoader.instance = new IconLoader();
    }
    return IconLoader.instance;
  }

  /**
   * 加载 FontAwesome 图标
   * @param options 选项
   */
  async loadFontAwesome(
    options: {
      version?: '4' | '5' | '6';
      cssUrl?: string;
      category?: string;
      iconList?: string[];
    } = {}
  ): Promise<IconItem[]> {
    const {version = '4', category = 'FontAwesome'} = options;

    const sourceKey = `fa-${version}`;

    if (this.loadedSources.has(sourceKey)) {
      return iconRegistry.getIconsByCategory(category);
    }

    try {
      let iconNames: string[] = [];

      // 从CSS文件解析图标
      const cssText = fontawesome4;

      const matches = cssText.match(/\.fa-([a-zA-Z0-9-]+):before/g);
      if (matches) {
        iconNames = matches
          .map(match => match.replace('.fa-', '').replace(':before', ''))
          .filter(name => name !== 'fa'); // 过滤掉基础类名
      }

      // 注册图标
      iconRegistry.registerFontAwesome(iconNames, {
        category,
        prefix: 'fa',
        version
      });

      this.loadedSources.add(sourceKey);
      return iconRegistry.getIconsByCategory(category);
    } catch (error) {
      console.error('Failed to load FontAwesome icons:', error);
      return [];
    }
  }

  /**
   * 加载 Iconify 图标
   * @param iconSet 图标集名称
   * @param options 选项
   */
  async loadIconify(
    iconSet: string,
    options: {
      iconList?: string[];
      category?: string;
      apiUrl?: string;
    } = {}
  ): Promise<IconItem[]> {
    const {iconList, category = `Iconify ${iconSet.toUpperCase()}`} = options;

    const sourceKey = `iconify-${iconSet}`;

    if (this.loadedSources.has(sourceKey)) {
      return iconRegistry.getIconsByCategory(category);
    }

    try {
      let iconNames: string[] = [];

      const data = JSON.parse(elementPlusIcon);

      if (data && data.uncategorized) {
        iconNames = data.uncategorized;
      }

      // 注册图标
      iconRegistry.registerIconify(iconSet, iconNames, {
        category
      });

      this.loadedSources.add(sourceKey);
      return iconRegistry.getIconsByCategory(category);
    } catch (error) {
      console.error('Failed to load Iconify icons:', error);
      return [];
    }
  }

  /**
   * 加载自定义图标
   * @param jsonUrl 图标JSON文件URL
   * @param options 选项
   */
  async loadCustomIcons(
    jsonUrl: string,
    options: {
      category?: string;
    } = {}
  ): Promise<IconItem[]> {
    const sourceKey = `custom-${jsonUrl}`;

    if (this.loadedSources.has(sourceKey)) {
      return iconRegistry.getIconsByCategory(options.category || 'Custom');
    }

    try {
      const response = await fetch(jsonUrl);
      const iconData = await response.json();

      if (iconData && iconData.glyphs) {
        // 注册自定义图标
        iconRegistry.registerCustomIcons(iconData, {
          category: options.category
        });

        this.loadedSources.add(sourceKey);
        return iconRegistry.getIconsByCategory(
          options.category || iconData.name
        );
      }

      return [];
    } catch (error) {
      console.error('Failed to load custom icons:', error);
      return [];
    }
  }

  /**
   * 加载 Amis 内置图标
   * @param options 选项
   */
  async loadAmisIcons(
    options: {
      cssUrl?: string;
      category?: string;
    } = {}
  ): Promise<IconItem[]> {
    const {category = 'Amis'} = options;

    const sourceKey = `amis`;

    if (this.loadedSources.has(sourceKey)) {
      return iconRegistry.getIconsByCategory(category);
    }

    try {
      const cssText = amisIconfont;

      const matches = cssText.match(/\.icon-([a-zA-Z0-9-]+):before/g);
      let iconNames: string[] = [];
      const invalidIcons = ['.icon-tm-m:before', '.icon-verify-m:before'];

      if (matches) {
        iconNames = matches
          .filter(match => !invalidIcons.includes(match))
          .map(match => match.replace('.icon-', '').replace(':before', ''));
      }

      // 手动注册Amis图标
      const icons: IconItem[] = iconNames.map(iconName => ({
        name: `iconfont icon-${iconName}`,
        type: 'amis',
        category,
        displayName: iconName.replace(/-/g, ' '),
        tags: iconName.split('-'),
        prefix: 'iconfont'
      }));

      iconRegistry.register(icons);
      this.loadedSources.add(sourceKey);
      return iconRegistry.getIconsByCategory(category);
    } catch (error) {
      console.error('Failed to load Amis icons:', error);
      return [];
    }
  }

  /**
   * 批量加载所有图标
   * @param sources 图标源配置
   */
  async loadAllIcons(
    sources: {
      fontAwesome?: {
        version?: '4' | '5' | '6';
        cssUrl?: string;
        iconList?: string[];
      };
      iconify?: Array<{
        iconSet: string;
        iconList?: string[];
        category?: string;
      }>;
      custom?: Array<{
        jsonUrl: string;
        category?: string;
      }>;
      amis?: {
        cssUrl?: string;
      };
    } = {}
  ): Promise<{
    fontAwesome: IconItem[];
    iconify: IconItem[];
    custom: IconItem[];
    amis: IconItem[];
  }> {
    const results = {
      fontAwesome: [] as IconItem[],
      iconify: [] as IconItem[],
      custom: [] as IconItem[],
      amis: [] as IconItem[]
    };

    // 并行加载所有图标源
    const loadPromises: Promise<void>[] = [];

    // 加载 FontAwesome
    if (sources.fontAwesome) {
      loadPromises.push(
        this.loadFontAwesome(sources.fontAwesome).then(icons => {
          results.fontAwesome = icons;
        })
      );
    }

    // 加载 Iconify
    if (sources.iconify) {
      sources.iconify.forEach(config => {
        loadPromises.push(
          this.loadIconify(config.iconSet, config).then(icons => {
            results.iconify.push(...icons);
          })
        );
      });
    }

    // 加载自定义图标
    if (sources.custom) {
      sources.custom.forEach(config => {
        loadPromises.push(
          this.loadCustomIcons(config.jsonUrl, config).then(icons => {
            results.custom.push(...icons);
          })
        );
      });
    }

    // 加载 Amis 图标
    if (sources.amis) {
      loadPromises.push(
        this.loadAmisIcons(sources.amis).then(icons => {
          results.amis = icons;
        })
      );
    }

    await Promise.all(loadPromises);
    return results;
  }

  /**
   * 获取预定义的常用 Iconify 图标
   */
  private getCommonIconifyIcons(iconSet: string): string[] {
    const commonIcons: Record<string, string[]> = {
      ep: [
        'arrow-down',
        'arrow-up',
        'arrow-left',
        'arrow-right',
        'chat-dot-round',
        'caret-bottom',
        'close',
        'search',
        'user',
        'setting',
        'home',
        'folder',
        'document',
        'edit',
        'delete',
        'plus',
        'minus',
        'check',
        'times'
      ],
      mdi: [
        'home',
        'account',
        'magnify',
        'heart',
        'star',
        'pencil',
        'delete',
        'content-save',
        'download',
        'upload',
        'cog',
        'information',
        'alert',
        'check',
        'close',
        'plus',
        'minus'
      ],
      heroicons: [
        'home',
        'user',
        'search',
        'heart',
        'star',
        'pencil',
        'trash',
        'document',
        'folder',
        'cog',
        'information-circle',
        'exclamation-triangle',
        'check',
        'x',
        'plus',
        'minus'
      ]
    };

    return (
      commonIcons[iconSet] || [
        'home',
        'user',
        'search',
        'heart',
        'star',
        'edit',
        'delete',
        'save',
        'download',
        'upload',
        'settings'
      ]
    );
  }

  /**
   * 重置加载状态
   */
  reset() {
    this.loadedSources.clear();
  }

  /**
   * 获取已加载的源
   */
  getLoadedSources(): string[] {
    return Array.from(this.loadedSources);
  }

  /**
   * 预加载默认图标
   */
  async preloadDefault(): Promise<void> {
    await this.loadAllIcons({
      fontAwesome: {
        version: '5'
      },
      iconify: [{iconSet: 'ep', category: 'Element Plus'}],
      amis: {}
    });
  }
}

// 创建单例实例
export const iconLoader = IconLoader.getInstance();

// 导出类型和实例
export default iconLoader;
