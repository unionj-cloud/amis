# 图标选择器实现方案

## 概述

本文档描述了一个完整的图标选择器解决方案的实现，该方案基于 amis 框架构建，支持多种图标库的统一管理和选择。该解决方案包含全局图标注册机制、图标选择器渲染器组件以及对应的编辑器插件。

## 核心特性

### ✨ 主要功能

- **多图标库支持**：FontAwesome、Iconify、自定义图标、Amis 内置图标、SVG 图标
- **全局注册机制**：统一的图标注册和管理系统
- **可视化选择**：直观的图标选择界面，支持搜索和分类
- **完整的编辑器支持**：可在 amis 编辑器中拖拽使用和配置
- **高性能**：支持懒加载、缓存、虚拟滚动等优化
- **响应式设计**：适配移动端和桌面端
- **主题适配**：支持暗色主题和高对比度模式

### 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    图标选择器编辑器插件                        │
├─────────────────────────────────────────────────────────────┤
│                    图标选择器渲染器组件                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │图标注册API  │  │ 图标加载器  │  │ 图标注册表  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │ FontAwesome │  │   Iconify   │  │ 自定义图标库 │  │SVG图标库││
│  │   加载器    │  │   加载器    │  │   加载器    │  │ 加载器  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 文件结构

```
packages/
├── amis-core/src/utils/
│   ├── IconRegistry.ts           # 图标注册表核心实现
│   ├── IconLoader.ts            # 图标加载工具类
│   └── IconRegistryAPI.ts       # 图标注册API
│
├── amis/src/renderers/Form/
│   └── IconSelector.tsx         # 图标选择器渲染器
│
├── amis-ui/scss/components/
│   └── icon-selector.scss       # 图标选择器样式
│
├── amis-editor/src/plugin/Form/
│   └── IconSelector.tsx         # 图标选择器编辑器插件
│
└── examples/
    └── icon-selector-example.tsx # 使用示例
```

## 核心组件

### 1. IconRegistry（图标注册表）

**位置**: `packages/amis-core/src/utils/IconRegistry.ts`

**功能**：

- 图标数据的集中存储和管理
- 支持按类型和分类组织图标
- 提供搜索、过滤、查找功能
- 变化通知机制

**关键接口**：

```typescript
interface IconItem {
  name: string; // 图标名称（CSS类名或标识符）
  type: 'fontawesome' | 'iconify' | 'custom' | 'amis' | 'svg';
  category: string; // 分类名称
  displayName: string; // 显示名称
  unicode?: string; // Unicode编码
  tags?: string[]; // 搜索标签
  svg?: string; // SVG内容
  prefix?: string; // 图标前缀
}
```

### 2. IconLoader（图标加载器）

**位置**: `packages/amis-core/src/utils/IconLoader.ts`

**功能**：

- 从不同来源加载图标数据
- 支持 CSS 解析、API 获取、JSON 文件读取
- 自动去重和缓存
- 批量加载和并行处理

**主要方法**：

```typescript
class IconLoader {
  loadFontAwesome(options): Promise<IconItem[]>;
  loadIconify(iconSet, options): Promise<IconItem[]>;
  loadCustomIcons(jsonUrl, options): Promise<IconItem[]>;
  loadAmisIcons(options): Promise<IconItem[]>;
  loadAllIcons(sources): Promise<LoadResult>;
}
```

### 3. IconRegistryAPI（图标注册 API）

**位置**: `packages/amis-core/src/utils/IconRegistryAPI.ts`

**功能**：

- 高级图标注册接口
- 配置化初始化
- 便捷的批量注册方法
- 状态管理和监听

**使用示例**：

```typescript
import {initializeIconRegistry} from 'amis-core/src/utils/IconRegistryAPI';

await initializeIconRegistry({
  fontAwesome: {enabled: true, version: '5'},
  iconify: [{iconSet: 'ep', category: 'Element Plus'}],
  amis: {enabled: true},
  custom: [{name: 'custom', jsonUrl: '/icons.json'}]
});
```

### 4. IconSelector（图标选择器渲染器）

**位置**: `packages/amis/src/renderers/Form/IconSelector.tsx`

**功能**：

- 图标选择界面渲染
- 搜索和过滤功能
- 分类浏览
- 响应式布局

**配置选项**：

```typescript
interface IconSelectorControlSchema {
  type: 'icon-selector';
  placeholder?: string; // 占位符
  clearable?: boolean; // 是否可清空
  iconSize?: 'sm' | 'md' | 'lg'; // 图标大小
  iconsPerRow?: number; // 每行图标数
  showPreview?: boolean; // 显示预览
  showIconName?: boolean; // 显示图标名
  filterTypes?: string[]; // 过滤类型
  defaultCategory?: string; // 默认分类
  maxHeight?: number; // 最大高度
  searchPlaceholder?: string; // 搜索提示
}
```

### 5. IconSelectorPlugin（编辑器插件）

**位置**: `packages/amis-editor/src/plugin/Form/IconSelector.tsx`

**功能**：

- 组件拖拽支持
- 属性配置面板
- 事件和动作定义
- 预览和验证

## 快速开始

### 1. 安装依赖

确保项目中已安装以下依赖：

```bash
npm install @iconify/react lodash
```

### 2. 初始化图标系统

```typescript
import {initializeIconRegistry} from 'amis-core/src/utils/IconRegistryAPI';

// 在应用初始化时调用
await initializeIconRegistry({
  fontAwesome: {
    enabled: true,
    version: '5',
    category: 'FontAwesome'
  },
  iconify: [
    {
      iconSet: 'ep',
      category: 'Element Plus'
    }
  ],
  amis: {
    enabled: true
  }
});
```

### 3. 使用图标选择器

```json
{
  "type": "form",
  "body": [
    {
      "type": "icon-selector",
      "name": "icon",
      "label": "选择图标",
      "placeholder": "请选择图标"
    }
  ]
}
```

### 4. 在编辑器中使用

图标选择器会自动出现在 amis 编辑器的表单控件面板中，可以直接拖拽使用。

## 高级用法

### 自定义图标注册

```typescript
import {
  registerCustomIcons,
  registerSvgIcons
} from 'amis-core/src/utils/IconRegistryAPI';

// 注册自定义字体图标
await registerCustomIcons(
  {
    name: '项目图标',
    css_prefix_text: 'icon-',
    glyphs: [
      {name: 'logo', font_class: 'logo', unicode: 'e001'},
      {name: 'menu', font_class: 'menu', unicode: 'e002'}
    ]
  },
  {category: '项目图标'}
);

// 注册SVG图标
registerSvgIcons([
  {
    name: 'custom-icon',
    svg: '<svg viewBox="0 0 24 24">...</svg>',
    category: 'Custom'
  }
]);
```

### 动态加载图标

```typescript
import iconLoader from 'amis-core/src/utils/IconLoader';

// 从CSS文件加载FontAwesome图标
await iconLoader.loadFontAwesome({
  cssUrl: '/path/to/fontawesome.css',
  category: 'FontAwesome 6'
});

// 从Iconify API加载图标
await iconLoader.loadIconify('mdi', {
  iconList: ['home', 'account', 'settings'],
  category: 'Material Design'
});
```

### 过滤和配置

```json
{
  "type": "icon-selector",
  "name": "icon",
  "label": "图标",
  "iconSize": "lg",
  "iconsPerRow": 6,
  "filterTypes": ["fontawesome", "amis"],
  "defaultCategory": "fontawesome",
  "showPreview": true,
  "showIconName": true
}
```

## 样式定制

### CSS 变量

图标选择器支持通过 CSS 变量进行样式定制：

```scss
.amis-IconSelectorControl {
  --icon-size: 16px;
  --icon-spacing: 8px;
  --border-color: #ddd;
  --hover-bg: #f0f8ff;
  --selected-bg: #409eff;
}
```

### 主题适配

组件自动适配 amis 主题系统，支持：

- 亮色/暗色主题切换
- 高对比度模式
- 自定义主题色

## 性能优化

### 1. 图标缓存

图标数据会自动缓存到 localStorage，避免重复加载：

```typescript
// 缓存配置
const CACHE_KEY = 'icon-selector-cache';
const CACHE_EXPIRE = 24 * 60 * 60 * 1000; // 24小时
```

### 2. 懒加载

图标按需加载，支持分页和虚拟滚动：

```typescript
// 虚拟滚动配置
const VIRTUAL_LIST_CONFIG = {
  itemHeight: 40,
  containerHeight: 400,
  overscan: 5
};
```

### 3. 防抖搜索

搜索功能使用防抖优化，减少不必要的计算：

```typescript
const debouncedSearch = debounce(searchFunction, 300);
```

## 兼容性

### 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### amis 版本

- amis 6.0+
- amis-editor 6.0+

## 故障排查

### 常见问题

1. **图标不显示**

   - 检查图标库是否正确加载
   - 确认 CSS 文件路径正确
   - 验证图标名称格式

2. **加载失败**

   - 检查网络连接
   - 确认 API 接口可访问
   - 查看控制台错误信息

3. **性能问题**
   - 减少图标数量
   - 启用虚拟滚动
   - 使用图标过滤

### 调试方法

```typescript
import {iconRegistryAPI} from 'amis-core/src/utils/IconRegistryAPI';

// 获取统计信息
console.log(iconRegistryAPI.getStats());

// 检查加载状态
console.log(iconRegistryAPI.isInitialized());

// 获取所有图标
console.log(iconRegistryAPI.getAllIcons());
```

## 扩展开发

### 添加新的图标库支持

1. 在`IconLoader`中添加新的加载方法
2. 在`IconRegistry`中添加对应的注册方法
3. 在`IconSelector`中添加渲染逻辑
4. 更新 TypeScript 类型定义

### 自定义渲染器

```typescript
import {IconSelectorControl} from 'amis/src/renderers/Form/IconSelector';

class CustomIconSelector extends IconSelectorControl {
  // 自定义实现
  renderIcon(icon: IconItem) {
    // 自定义图标渲染逻辑
    return <CustomIcon icon={icon} />;
  }
}
```

## 更新日志

### v1.0.0 (2024-01-XX)

- 初始版本发布
- 支持 FontAwesome、Iconify、自定义图标
- 完整的编辑器插件支持
- 响应式设计和主题适配

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 技术支持

如有问题，请：

1. 查阅本文档
2. 搜索已有 Issues
3. 创建新的 Issue
4. 联系技术支持

---

**注意**：本方案基于 amis 框架开发，使用前请确保了解 amis 的基本概念和用法。
