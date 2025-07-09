import {
  registerEditorPlugin,
  getSchemaTpl,
  BasePlugin,
  tipedLabel,
  undefinedPipeOut
} from 'amis-editor-core';
import { ValidatorTag } from '../../validator';
import { getEventControlConfig } from '../../renderer/event-control/helper';

import type {
  EditorNodeType,
  RendererPluginAction,
  RendererPluginEvent,
  BaseEventContext,
  EditorManager
} from 'amis-editor-core';

export class IconSelectorPlugin extends BasePlugin {
  static id = 'IconSelectorPlugin';
  static scene = ['layout'];

  // 关联渲染器名字
  rendererName = 'icon-selector';
  $schema = '/schemas/IconSelectorSchema.json';

  // 组件名称
  name = '图标选择器';
  isBaseComponent = true;
  icon = 'fa fa-icons';
  panelIcon = 'fa fa-icons';
  pluginIcon = 'icon-selector-plugin';

  panelTitle = '图标选择器';
  panelJustify = true;
  notRenderFormZone = true;

  description = '图标选择器，支持FontAwesome、Iconify、自定义图标等多种图标库';
  docLink = '/amis/zh-CN/components/form/icon-selector';
  tags = ['表单项'];
  searchKeywords = '图标选择器、图标、icon、IconSelector';

  scaffold = {
    type: 'icon-selector',
    label: '图标',
    name: 'icon',
    placeholder: '请选择图标'
  };

  previewSchema: any = {
    ...this.scaffold,
    value: 'fa fa-star'
  };

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'change',
      eventLabel: '值变化',
      description: '图标选择变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                value: {
                  type: 'string',
                  title: '选中的图标名称'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'focus',
      eventLabel: '获取焦点',
      description: '图标选择器获取焦点时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                value: {
                  type: 'string',
                  title: '当前图标值'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'blur',
      eventLabel: '失去焦点',
      description: '图标选择器失去焦点时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                value: {
                  type: 'string',
                  title: '当前图标值'
                }
              }
            }
          }
        }
      ]
    }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [
    {
      actionType: 'clear',
      actionLabel: '清空',
      description: '清空图标选择'
    },
    {
      actionType: 'reset',
      actionLabel: '重置',
      description: '重置为默认值'
    },
    {
      actionType: 'setValue',
      actionLabel: '赋值',
      description: '设置图标值'
    }
  ];

  panelBodyCreator = (context: BaseEventContext) => {
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本',
            body: [
              getSchemaTpl('layout:originPosition', { value: 'left-top' }),
              getSchemaTpl('formItemName', {
                required: true
              }),
              getSchemaTpl('label'),
              getSchemaTpl('placeholder', {
                pipeOut: undefinedPipeOut
              }),
              getSchemaTpl('description'),
              {
                type: 'ae-switch-more',
                mode: 'normal',
                name: 'clearable',
                label: tipedLabel('可清空', '是否可清空图标选择'),
                value: true,
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    getSchemaTpl('switch', {
                      label: '可清空',
                      name: 'clearable',
                      value: true
                    })
                  ]
                }
              }
            ]
          },
          {
            title: '选项',
            body: [
              getSchemaTpl('valueFormula', {
                rendererSchema: (schema: any) => schema,
                pipeOut: undefinedPipeOut,
                label: tipedLabel('默认值', '默认选中的图标')
              }),
              {
                type: 'input-text',
                name: 'searchPlaceholder',
                label: tipedLabel('搜索提示', '搜索框占位符文本'),
                placeholder: '搜索图标...',
                pipeOut: undefinedPipeOut
              },
              {
                type: 'input-text',
                name: 'noDataTip',
                label: tipedLabel('无数据提示', '没有图标数据时显示的提示'),
                placeholder: '暂无图标数据',
                pipeOut: undefinedPipeOut
              }
            ]
          },
          {
            title: '显示',
            body: [
              {
                type: 'button-group-select',
                name: 'iconSize',
                label: tipedLabel('图标大小', '设置图标显示大小'),
                value: 'md',
                options: [
                  { label: '小', value: 'sm' },
                  { label: '中', value: 'md' },
                  { label: '大', value: 'lg' }
                ],
                pipeOut: undefinedPipeOut
              },
              {
                type: 'switch',
                name: 'showPreview',
                label: tipedLabel('显示预览', '是否在输入框中显示图标预览'),
                value: true,
                pipeOut: undefinedPipeOut
              },
              {
                type: 'switch',
                name: 'showIconName',
                label: tipedLabel('显示图标名', '是否在输入框中显示图标名称'),
                value: true,
                pipeOut: undefinedPipeOut
              },
              {
                type: 'input-text',
                name: 'defaultCategory',
                label: tipedLabel('默认分类', '默认选中的图标分类'),
                placeholder: 'all',
                pipeOut: undefinedPipeOut
              }
            ]
          },
          getSchemaTpl('status', {
            isFormItem: true,
            readonly: true
          }),
          getSchemaTpl('validation', {
            tag: ValidatorTag.MultiSelect
          })
        ])
      },
      {
        title: '外观',
        body: [
          getSchemaTpl('collapseGroup', [
            getSchemaTpl('style:formItem', { renderer: context.info.renderer }),
            getSchemaTpl('style:classNames')
          ])
        ]
      },
      {
        title: '事件',
        className: 'p-none',
        body: [
          getSchemaTpl('eventControl', {
            name: 'onEvent',
            ...getEventControlConfig(this.manager, context)
          })
        ]
      }
    ]);
  };

  buildDataSchemas(node: EditorNodeType, region: EditorNodeType) {
    return {
      type: 'string',
      title: node.schema?.label || node.schema?.name,
      description: '选中的图标名称'
    };
  }

  filterProps(props: any) {
    // 过滤掉编辑器特有的属性
    return props;
  }

  getDisplayName(schema: any) {
    return schema.label || schema.name || '图标选择器';
  }

  // 组件面板中的缩略图
  getPreviewSchema(schema: any) {
    return {
      type: 'tpl',
      tpl: `<div class="icon-selector-preview">
        <i class="fa fa-star"></i>
        <span>图标选择器</span>
      </div>`
    };
  }

  // 拖拽时的提示
  getDragDropHint() {
    return '图标选择器：支持多种图标库的图标选择';
  }

  // 编辑器中的图标
  getEditorIcon() {
    return 'fa fa-star';
  }

  // 组件是否可用
  isAvailable(schema: any, data: any) {
    return true;
  }

  // 组件验证
  validate(schema: any, data: any) {
    const errors: string[] = [];

    if (!schema.name) {
      errors.push('图标选择器必须设置字段名');
    }

    return errors;
  }

  // 组件转换
  transformSchema(schema: any) {
    return {
      ...schema,
      type: 'icon-selector',
      name: schema.name || 'icon',
      label: schema.label || '图标'
    };
  }

  // 获取上下文菜单
  getContextMenus(schema: any, data: any) {
    return [
      {
        label: '复制',
        icon: 'copy',
        onClick: () => {
          // 复制逻辑
        }
      },
      {
        label: '删除',
        icon: 'delete',
        onClick: () => {
          // 删除逻辑
        }
      }
    ];
  }

  // 获取组件的配置项
  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'icon-selector'
        },
        name: {
          type: 'string',
          title: '字段名',
          description: '表单项字段名'
        },
        label: {
          type: 'string',
          title: '标签',
          description: '表单项标签'
        },
        placeholder: {
          type: 'string',
          title: '占位符',
          description: '输入框占位符'
        },
        clearable: {
          type: 'boolean',
          title: '可清空',
          description: '是否可清空',
          default: true
        },
        disabled: {
          type: 'boolean',
          title: '禁用',
          description: '是否禁用',
          default: false
        },
        iconSize: {
          type: 'string',
          title: '图标大小',
          enum: ['sm', 'md', 'lg'],
          default: 'md'
        },
        showPreview: {
          type: 'boolean',
          title: '显示预览',
          default: true
        },
        showIconName: {
          type: 'boolean',
          title: '显示图标名',
          default: true
        },
        defaultCategory: {
          type: 'string',
          title: '默认分类',
          default: 'all'
        },
        searchPlaceholder: {
          type: 'string',
          title: '搜索提示',
          default: '搜索图标...'
        },
        noDataTip: {
          type: 'string',
          title: '无数据提示',
          default: '暂无图标数据'
        }
      },
      required: ['type', 'name']
    };
  }
}

registerEditorPlugin(IconSelectorPlugin);
