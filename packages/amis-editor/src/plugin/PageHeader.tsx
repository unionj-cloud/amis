import {
  BasePlugin,
  RegionConfig,
  BaseEventContext,
  EditorNodeType,
  VRendererConfig,
  RendererPluginAction,
  RendererPluginEvent
} from 'amis-editor-core';
import {defaultValue, getSchemaTpl, tipedLabel} from 'amis-editor-core';
import {getEventControlConfig} from '../renderer/event-control/helper';
import {registerEditorPlugin} from 'amis-editor-core';

export class PageHeaderPlugin extends BasePlugin {
  static id = 'PageHeaderPlugin';
  static scene = ['layout'];

  // 关联渲染器名字
  rendererName = 'page-header';
  $schema = '/schemas/PageHeaderSchema.json';

  // 组件名称
  name = '页头';
  isBaseComponent = true;
  description = '页头组件，通常用于页面顶部展示标题和内容区域';
  docLink = '/amis/zh-CN/components/page-header';
  tags = ['布局容器'];
  icon = 'fa fa-header';
  pluginIcon = 'page-header-plugin';

  scaffold = {
    type: 'page-header',
    title: '页面标题',
    showBackButton: true,
    backIcon: 'fa fa-angle-left',
    titleBody: {
      type: 'container',
      body: '标题工具栏'
    },
    content: {
      type: 'container',
      body: '内容工具栏'
    }
  };

  previewSchema = {
    type: 'page-header',
    title: '页面标题',
    showBackButton: true,
    backIcon: 'fa fa-angle-left',
    titleBody: {
      type: 'container',
      body: '标题工具栏'
    },
    content: {
      type: 'container',
      body: '内容工具栏'
    }
  };

  // 容器配置
  regions: Array<RegionConfig> = [
    {
      key: 'titleBody',
      label: '标题工具栏',
      placeholder: '拖拽组件到此区域（返回按钮右侧）',
      wrapperResolve: (dom: HTMLElement) => dom
    },
    {
      key: 'content',
      label: '内容工具栏',
      placeholder: '拖拽组件到此区域（分隔线右侧）',
      wrapperResolve: (dom: HTMLElement) => dom
    }
  ];

  panelTitle = '页头';
  panelJustify = true;

  panelBodyCreator = (context: BaseEventContext) => {
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本设置',
            body: [
              getSchemaTpl('layout:originPosition', {value: 'left-top'}),
              {
                type: 'input-text',
                name: 'title',
                label: '标题文字',
                description: '页头标题文字'
              },
              getSchemaTpl('switch', {
                name: 'showBackButton',
                label: '显示返回按钮',
                pipeIn: defaultValue(true)
              }),
              getSchemaTpl('icon', {
                name: 'backIcon',
                label: '返回按钮图标',
                visibleOn: 'this.showBackButton',
                pipeIn: defaultValue('fa fa-angle-left')
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
                label: '标题工具栏CSS类名'
              }),
              getSchemaTpl('className', {
                name: 'contentClassName',
                label: '内容工具栏CSS类名'
              })
            ]
          })
        ])
      },
      {
        title: '外观',
        body: getSchemaTpl('collapseGroup', [
          getSchemaTpl('style:widthHeight', {
            widthSchema: {
              label: tipedLabel('宽度', '设置宽度后，当前的内容会独占一行')
            }
          }),
          getSchemaTpl('style:margin'),
          getSchemaTpl('style:padding'),
          getSchemaTpl('style:border'),
          getSchemaTpl('style:radius'),
          getSchemaTpl('style:background'),
          getSchemaTpl('style:shadow')
        ])
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
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: '标题'
        }
      }
    };
  }

  vRendererConfig: VRendererConfig = {
    regions: {
      titleBody: {
        key: 'titleBody',
        label: '标题工具栏',
        placeholder: '拖拽组件到此区域（返回按钮右侧）'
      },
      content: {
        key: 'content',
        label: '内容工具栏',
        placeholder: '拖拽组件到此区域（分隔线右侧）'
      }
    },
    panelTitle: '页头',
    panelJustify: true
  };

  getSubEditorVariable(schema: any): Array<{label: string; children: any}> {
    return [
      {
        label: '标题',
        children: {
          type: 'string',
          title: 'title'
        }
      }
    ];
  }

  // 组件事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'back',
      eventLabel: '返回',
      description: '点击返回按钮时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              description: '当前数据域，包含当前处理的数据'
            }
          }
        }
      ]
    }
  ];

  // 组件动作定义
  actions: RendererPluginAction[] = [
    {
      actionType: 'back',
      actionLabel: '返回',
      description: '触发返回操作'
    }
  ];
}

registerEditorPlugin(PageHeaderPlugin);
