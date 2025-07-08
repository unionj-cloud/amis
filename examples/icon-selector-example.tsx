/**
 * 图标选择器使用示例
 */

import React, { useEffect, useState } from 'react';
import { render as amisRender } from 'amis';
import { initializeIconRegistry, registerFontAwesome, registerIconify, registerCustomIcons } from '../packages/amis-core/src/utils/IconRegistryAPI';

const IconSelectorExample: React.FC = () => {
  const [isIconsLoaded, setIsIconsLoaded] = useState(false);

  useEffect(() => {
    // 初始化图标注册系统
    initializeIcons();
  }, []);

  /**
   * 初始化图标系统
   */
  const initializeIcons = async () => {
    try {
      console.log('开始初始化图标系统...');

      // 方式1：使用配置化初始化
      await initializeIconRegistry({
        fontAwesome: {
          enabled: true,
          version: '5',
          category: 'FontAwesome 5',
          // 可以指定图标列表，如果不指定则使用预定义的常用图标
          iconList: [
            'home', 'user', 'search', 'heart', 'star', 'edit', 'delete', 'save',
            'download', 'upload', 'settings', 'info', 'warning', 'error', 'check',
            'times', 'plus', 'minus', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'
          ]
        },
        iconify: [
          {
            iconSet: 'ep',
            category: 'Element Plus',
            iconList: [
              'arrow-down', 'arrow-up', 'arrow-left', 'arrow-right',
              'chat-dot-round', 'caret-bottom', 'close', 'search',
              'user', 'setting', 'home', 'folder', 'document'
            ]
          }
        ],
        amis: {
          enabled: true,
          category: 'Amis 内置'
        },
        custom: [
          {
            name: '项目自定义图标',
            jsonUrl: '/iconfont/iconfont.json',
            category: '项目图标'
          }
        ]
      });

      // 方式2：手动注册图标
      await registerAdditionalIcons();

      setIsIconsLoaded(true);
      console.log('图标系统初始化完成');
    } catch (error) {
      console.error('图标系统初始化失败:', error);
    }
  };

  /**
   * 手动注册额外的图标
   */
  const registerAdditionalIcons = async () => {
    // 注册更多 FontAwesome 图标
    registerFontAwesome([
      'calendar', 'clock', 'envelope', 'phone', 'map-marker',
      'link', 'share', 'print', 'file', 'folder', 'image'
    ], {
      category: 'FontAwesome 扩展',
      prefix: 'fa'
    });

    // 注册 Iconify Material Design 图标
    registerIconify('mdi', [
      'home', 'account', 'magnify', 'heart', 'star',
      'pencil', 'delete', 'content-save', 'download', 'upload'
    ], {
      category: 'Material Design'
    });

    // 注册自定义 SVG 图标
    const customSvgIcons = [
      {
        name: 'custom-logo',
        svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
        category: 'Logo'
      },
      {
        name: 'custom-arrow',
        svg: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
        category: 'Arrow'
      }
    ];

    // 手动创建 SVG 图标数据结构
    await import('../packages/amis-core/src/utils/IconRegistry').then(({ iconRegistry }) => {
      iconRegistry.registerSvgIcons(customSvgIcons);
    });
  };

  /**
   * 基础示例
   */
  const basicExampleSchema = {
    type: 'page',
    title: '图标选择器 - 基础示例',
    body: {
      type: 'form',
      api: '/api/mock2/form/saveForm',
      body: [
        {
          type: 'icon-selector',
          name: 'icon',
          label: '选择图标',
          placeholder: '请选择一个图标',
          clearable: true,
          value: 'fa fa-star'
        },
        {
          type: 'static',
          name: 'icon',
          label: '当前选中',
          tpl: '<i class="${icon}" style="font-size: 20px; margin-right: 8px;"></i> ${icon}'
        },
        {
          type: 'submit',
          label: '提交'
        }
      ]
    }
  };

  /**
   * 高级配置示例
   */
  const advancedExampleSchema = {
    type: 'page',
    title: '图标选择器 - 高级配置',
    body: {
      type: 'form',
      api: '/api/mock2/form/saveForm',
      body: [
        {
          type: 'group',
          body: [
            {
              type: 'icon-selector',
              name: 'smallIcon',
              label: '小尺寸图标',
              iconSize: 'sm',
              iconsPerRow: 10,
              showIconName: false,
              filterTypes: ['fontawesome', 'amis'],
              defaultCategory: 'fontawesome'
            },
            {
              type: 'icon-selector',
              name: 'largeIcon',
              label: '大尺寸图标',
              iconSize: 'lg',
              iconsPerRow: 6,
              maxHeight: 300,
              searchPlaceholder: '搜索大图标...'
            }
          ]
        },
        {
          type: 'group',
          body: [
            {
              type: 'icon-selector',
              name: 'customIcon',
              label: '仅自定义图标',
              filterTypes: ['custom'],
              noDataTip: '暂无自定义图标'
            },
            {
              type: 'icon-selector',
              name: 'iconifyIcon',
              label: '仅 Iconify 图标',
              filterTypes: ['iconify'],
              defaultCategory: 'iconify'
            }
          ]
        },
        {
          type: 'static',
          label: '预览',
          tpl: `
            <div style="display: flex; gap: 16px; align-items: center;">
              <div>小图标: <i class="\${smallIcon}" style="font-size: 14px;"></i></div>
              <div>大图标: <i class="\${largeIcon}" style="font-size: 24px;"></i></div>
              <div>自定义: <i class="\${customIcon}" style="font-size: 18px;"></i></div>
              <div>Iconify: <i class="\${iconifyIcon}" style="font-size: 18px;"></i></div>
            </div>
          `
        },
        {
          type: 'submit',
          label: '提交'
        }
      ]
    }
  };

  /**
   * 图标管理示例
   */
  const managementExampleSchema = {
    type: 'page',
    title: '图标选择器 - 图标管理',
    body: [
      {
        type: 'crud',
        api: '/api/mock2/sample',
        columns: [
          {
            name: 'id',
            label: 'ID',
            type: 'text'
          },
          {
            name: 'name',
            label: '名称',
            type: 'text'
          },
          {
            name: 'icon',
            label: '图标',
            type: 'icon-selector',
            quickEdit: {
              type: 'icon-selector',
              placeholder: '选择图标'
            }
          },
          {
            name: 'status',
            label: '状态',
            type: 'status'
          }
        ],
        headerToolbar: [
          {
            type: 'button',
            label: '新增',
            actionType: 'dialog',
            dialog: {
              title: '新增记录',
              body: {
                type: 'form',
                body: [
                  {
                    type: 'input-text',
                    name: 'name',
                    label: '名称',
                    required: true
                  },
                  {
                    type: 'icon-selector',
                    name: 'icon',
                    label: '图标',
                    required: true
                  },
                  {
                    type: 'select',
                    name: 'status',
                    label: '状态',
                    options: [
                      { label: '启用', value: 1 },
                      { label: '禁用', value: 0 }
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  };

  /**
   * JSON Schema 配置示例
   */
  const jsonConfigExample = {
    type: 'page',
    title: '图标选择器 - JSON 配置',
    body: [
      {
        type: 'form',
        body: [
          {
            type: 'json-schema-editor',
            name: 'schema',
            label: '组件配置',
            value: {
              type: 'icon-selector',
              name: 'icon',
              label: '图标选择',
              placeholder: '请选择图标',
              clearable: true,
              iconSize: 'md',
              iconsPerRow: 8,
              showPreview: true,
              showIconName: true,
              maxHeight: 400,
              searchPlaceholder: '搜索图标...',
              filterTypes: ['fontawesome', 'iconify', 'amis']
            }
          },
          {
            type: 'code',
            name: 'schema',
            label: '生成的配置',
            language: 'json',
            value: JSON.stringify({
              type: 'icon-selector',
              name: 'icon',
              label: '图标选择',
              placeholder: '请选择图标'
            }, null, 2)
          }
        ]
      }
    ]
  };

  if (!isIconsLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        正在加载图标库...
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '20px' }}>
        <h2>图标选择器使用示例</h2>
        <p>这个示例展示了如何使用新的图标选择器组件，包括基础用法、高级配置和图标管理。</p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        {amisRender(basicExampleSchema)}
      </div>

      <div style={{ marginBottom: '40px' }}>
        {amisRender(advancedExampleSchema)}
      </div>

      <div style={{ marginBottom: '40px' }}>
        {amisRender(managementExampleSchema)}
      </div>

      <div style={{ marginBottom: '40px' }}>
        {amisRender(jsonConfigExample)}
      </div>

      {/* 使用指南 */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '20px' }}>
        <h3>使用指南</h3>

        <h4>1. 初始化图标系统</h4>
        <pre><code>{`
import { initializeIconRegistry } from 'amis-core/src/utils/IconRegistryAPI';

await initializeIconRegistry({
  fontAwesome: { enabled: true, version: '5' },
  iconify: [{ iconSet: 'ep', category: 'Element Plus' }],
  amis: { enabled: true },
  custom: [{ name: 'custom', jsonUrl: '/icons.json' }]
});
        `}</code></pre>

        <h4>2. 基础使用</h4>
        <pre><code>{`
{
  type: 'icon-selector',
  name: 'icon',
  label: '选择图标',
  placeholder: '请选择图标'
}
        `}</code></pre>

        <h4>3. 高级配置</h4>
        <pre><code>{`
{
  type: 'icon-selector',
  name: 'icon',
  label: '图标',
  iconSize: 'lg',                    // 图标大小：sm, md, lg
  iconsPerRow: 6,                   // 每行图标数量
  showPreview: true,                // 显示预览
  showIconName: true,               // 显示图标名称
  filterTypes: ['fontawesome'],     // 过滤图标类型
  defaultCategory: 'fontawesome',   // 默认分类
  maxHeight: 300,                   // 最大高度
  searchPlaceholder: '搜索...'      // 搜索提示
}
        `}</code></pre>

        <h4>4. 手动注册图标</h4>
        <pre><code>{`
import { registerFontAwesome, registerIconify } from 'amis-core/src/utils/IconRegistryAPI';

// 注册 FontAwesome 图标
registerFontAwesome(['home', 'user', 'search'], {
  category: 'Common',
  prefix: 'fa'
});

// 注册 Iconify 图标
registerIconify('mdi', ['home', 'account'], {
  category: 'Material Design'
});
        `}</code></pre>
      </div>
    </div>
  );
};

export default IconSelectorExample; 