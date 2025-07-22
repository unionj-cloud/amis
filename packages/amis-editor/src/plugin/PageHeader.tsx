import {
  BasePlugin,
  RegionConfig,
  BaseEventContext,
  EditorNodeType,
  VRendererConfig,
  RendererPluginAction,
  RendererPluginEvent
} from 'amis-editor-core';
import {
  defaultValue,
  getSchemaTpl,
  tipedLabel,
  undefinedPipeOut
} from 'amis-editor-core';
import {getEventControlConfig} from '../renderer/event-control/helper';
import {registerEditorPlugin} from 'amis-editor-core';

export class PageHeaderPlugin extends BasePlugin {
  static id = 'PageHeaderPlugin';
  static scene = ['layout'];

  // 关联渲染器名字
  rendererName = 'page-header';
  $schema = '/schemas/PageHeaderSchema.json';

  // 组件名称
  name = '选项卡页头';
  isBaseComponent = true;
  description =
    '选项卡页头组件，包含过滤器下拉框和选项卡，支持数据联动过滤查询';
  docLink = '/amis/zh-CN/components/page-header';
  tags = ['布局容器'];
  icon = 'fa fa-header';
  pluginIcon = 'page-header-plugin';

  scaffold = {
    type: 'page-header',
    showBackButton: true,
    backIcon: 'fa fa-long-arrow-left',
    filter: {
      name: 'category',
      options: [
        {label: '全部需求', value: 'all', tooltip: '显示所有类型的需求'},
        {
          label: '功能需求',
          value: 'feature',
          badge: 'HOT',
          tooltip: '新功能开发需求，当前热门'
        },
        {
          label: '缺陷修复',
          value: 'bug',
          badge: 'RP',
          tooltip: '系统缺陷修复，需要重点关注'
        }
      ],
      value: 'all',
      rightIcon: 'fa fa-caret-down'
    },
    tabs: [
      {
        title: '列表',
        key: 'list',
        body: [
          {
            type: 'tpl',
            tpl: '列表内容区域，可以放置表格、表单等组件'
          }
        ]
      },
      {
        title: '统计',
        key: 'stats',
        body: [
          {
            type: 'tpl',
            tpl: '统计数据展示区域'
          }
        ]
      }
    ]
  };

  previewSchema = {
    ...this.scaffold
  };

  // 容器配置
  regions: Array<RegionConfig> = [
    {
      key: 'tabs[].body',
      label: '选项卡内容',
      placeholder: '可拖拽组件到此区域'
    }
  ];

  panelTitle = '选项卡页头';
  panelJustify = true;

  panelBodyCreator = (context: BaseEventContext) => {
    const isNewTabMode =
      'this.tabsMode !=="vertical" && this.tabsMode !=="sidebar" && this.tabsMode !=="chrome"';

    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本设置',
            body: [
              getSchemaTpl('layout:originPosition', {value: 'left-top'}),
              getSchemaTpl('switch', {
                name: 'showBackButton',
                label: '显示返回按钮',
                pipeIn: defaultValue(true)
              }),
              getSchemaTpl('icon', {
                name: 'backIcon',
                label: '返回按钮图标',
                visibleOn: 'this.showBackButton',
                pipeIn: defaultValue('fa fa-long-arrow-left')
              })
            ]
          },
          {
            title: '标题下拉框配置',
            body: [
              {
                type: 'input-text',
                name: 'filter.name',
                label: '字段名',
                required: true,
                placeholder: '如：category'
              },
              // 完全复制 Select.tsx 的选项配置
              getSchemaTpl('optionControlV2', {
                name: 'filter.options'
              }),
              getSchemaTpl('selectFirst', {
                name: 'filter.selectFirst',
                onChange: (
                  value: any,
                  oldValue: any,
                  model: any,
                  form: any
                ) => {
                  if (value) {
                    form.deleteValueByName('filter.value');
                  }
                }
              }),
              getSchemaTpl('valueFormula', {
                name: 'filter.value',
                label: '默认值',
                rendererSchema: (schema: any) => ({
                  ...schema,
                  type: 'input-text'
                }),
                pipeOut: undefinedPipeOut,
                needDeleteProps: ['filter.source'],
                visibleOn:
                  'this.filter.selectFirst !== true && this.filter.source != null'
              }),
              getSchemaTpl(
                'loadingConfig',
                {
                  name: 'filter.loadingConfig',
                  visibleOn: 'this.filter.source || !this.filter.options'
                },
                {context}
              ),
              // 模板
              getSchemaTpl('optionsMenuTpl', {
                manager: this.manager,
                name: 'filter.menuTpl',
                onChange: (value: any) => {}
              }),
              // 下拉框右侧图标配置
              getSchemaTpl('icon', {
                name: 'filter.rightIcon',
                label: '右侧图标',
                pipeIn: defaultValue('fa fa-caret-down')
              })
            ]
          },
          {
            title: '选项卡配置',
            body: [
              // 完全复制 Tabs.tsx 的基本配置
              getSchemaTpl('combo-container', {
                type: 'combo',
                label: '选项卡',
                mode: 'normal',
                name: 'tabs',
                draggableTip: '',
                draggable: true,
                multiple: true,
                minLength: 1,
                scaffold: {
                  title: '选项卡',
                  body: [
                    {
                      type: 'tpl',
                      tpl: '内容',
                      inline: false
                    }
                  ]
                },
                items: [
                  getSchemaTpl('title', {
                    label: false,
                    required: true
                  })
                ]
              }),
              getSchemaTpl('switch', {
                name: 'showTip',
                label: tipedLabel(
                  '标题提示',
                  '鼠标移动到选项卡标题时弹出提示，适用于标题超长时进行完整提示'
                ),
                visibleOn: isNewTabMode,
                clearValueOnHidden: true
              }),
              {
                label: tipedLabel(
                  '初始选项卡',
                  '组件初始化时激活的选项卡，优先级高于激活的选项卡，不可响应上下文数据，选项卡配置hash时使用hash，否则使用索引值，支持获取变量，如：<code>tab\\${id}</code>、<code>\\${id}</code>'
                ),
                type: 'input-text',
                name: 'defaultKey',
                placeholder: '初始默认激活的选项卡',
                pipeOut: (data: string) =>
                  data === '' || isNaN(Number(data)) ? data : Number(data)
              },
              {
                label: tipedLabel(
                  '激活的选项卡',
                  '默认显示某个选项卡，可响应上下文数据，选项卡配置hash时使用hash，否则使用索引值，支持获取变量，如：<code>tab\\${id}</code>、<code>\\${id}</code>'
                ),
                type: 'input-text',
                name: 'activeKey',
                placeholder: '默认激活的选项卡',
                pipeOut: (data: string) =>
                  data === '' || isNaN(Number(data)) ? data : Number(data)
              }
            ]
          },
          getSchemaTpl('status'),
          {
            title: '高级',
            body: [
              getSchemaTpl('sourceBindControl', {
                label: tipedLabel(
                  '关联数据',
                  '根据该数据来动态重复渲染所配置的选项卡'
                )
              }),
              getSchemaTpl('switch', {
                name: 'mountOnEnter',
                label: tipedLabel(
                  '激活时渲染内容',
                  '只有激活选项卡时才进行内容渲染，提升渲染性能'
                )
              }),
              getSchemaTpl('switch', {
                name: 'unmountOnExit',
                label: tipedLabel(
                  '隐藏后销毁内容',
                  '激活其他选项卡时销毁当前内容，使其再次激活时内容可以重新渲染，适用于数据容器需要每次渲染实时获取数据的场景'
                )
              })
            ]
          },
          getSchemaTpl('style:classNames', {
            isFormItem: false,
            schema: [
              getSchemaTpl('className', {
                label: '外层CSS类名'
              }),
              getSchemaTpl('className', {
                name: 'titleClassName',
                label: '下拉框区域CSS类名'
              }),
              getSchemaTpl('className', {
                name: 'contentClassName',
                label: '选项卡内容CSS类名'
              })
            ]
          })
        ])
      },
      {
        title: '外观',
        body: [
          getSchemaTpl('collapseGroup', [
            {
              title: '基本',
              body: [
                {
                  name: 'tabsMode',
                  label: '选项卡样式',
                  type: 'select',
                  options: [
                    {
                      label: '默认',
                      value: ''
                    },
                    {
                      label: '线型',
                      value: 'line'
                    },
                    {
                      label: '简约',
                      value: 'simple'
                    },
                    {
                      label: '加强',
                      value: 'strong'
                    },
                    {
                      label: '卡片',
                      value: 'card'
                    },
                    {
                      label: '仿 Chrome',
                      value: 'chrome'
                    },
                    {
                      label: '水平铺满',
                      value: 'tiled'
                    },
                    {
                      label: '选择器',
                      value: 'radio'
                    },
                    {
                      label: '垂直',
                      value: 'vertical'
                    },
                    {
                      label: '侧边栏',
                      value: 'sidebar'
                    }
                  ],
                  pipeIn: defaultValue('')
                },
                getSchemaTpl('horizontal-align', {
                  label: '标题区位置',
                  name: 'sidePosition',
                  pipeIn: defaultValue('left'),
                  visibleOn: 'this.tabsMode === "sidebar"',
                  clearValueOnHidden: true
                })
              ]
            },
            getSchemaTpl('style:widthHeight', {
              widthSchema: {
                label: tipedLabel('宽度', '设置宽度后，当前的内容会独占一行')
              }
            }),
            getSchemaTpl('style:margin'),
            getSchemaTpl('style:padding'),
            getSchemaTpl('style:border', {
              borderSchema: {
                borderBottomWidth: {
                  label: '下边框宽度',
                  pipeIn: defaultValue('1px')
                },
                borderBottomStyle: {
                  label: '下边框样式',
                  pipeIn: defaultValue('solid')
                },
                borderBottomColor: {
                  label: '下边框颜色',
                  pipeIn: defaultValue('#dadfe6')
                }
              }
            }),
            getSchemaTpl('style:radius'),
            getSchemaTpl('style:background'),
            getSchemaTpl('style:shadow'),
            getSchemaTpl('style:classNames', {
              isFormItem: false,
              schema: [
                getSchemaTpl('className', {
                  name: 'linksClassName',
                  label: '标题区'
                }),
                getSchemaTpl('className', {
                  name: 'toolbarClassName',
                  label: '工具栏'
                }),
                getSchemaTpl('className', {
                  name: 'contentClassName',
                  label: '内容区'
                }),
                getSchemaTpl('className', {
                  name: 'showTipClassName',
                  label: '提示',
                  visibleOn: 'this.showTip',
                  clearValueOnHidden: true
                })
              ]
            })
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

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'filterChange',
      eventLabel: '下拉框变化',
      description: '下拉框值发生变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '下拉框数据',
              description: '当前下拉框的值'
            }
          }
        }
      ]
    },
    {
      eventName: 'tabChange',
      eventLabel: '选项卡切换',
      description: '选项卡切换时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '选项卡数据',
              description: '当前选项卡信息和下拉框值'
            }
          }
        }
      ]
    }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [
    {
      actionLabel: '设置下拉框值',
      actionType: 'setValue',
      description: '设置下拉框的值'
    },
    {
      actionLabel: '切换选项卡',
      actionType: 'changeTab',
      description: '切换到指定选项卡'
    }
  ];
}

registerEditorPlugin(PageHeaderPlugin);
