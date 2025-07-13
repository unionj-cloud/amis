import React from 'react';
import {
  Renderer,
  RendererProps,
  autobind,
  buildStyle,
  CustomStyle,
  setThemeClassName
} from 'amis-core';
import {BaseSchema, SchemaClassName, SchemaCollection} from '../Schema';

/**
 * PageHeader 页头渲染器
 */
export interface PageHeaderSchema {
  /**
   * 指定为页头组件
   */
  type: 'page-header';

  /**
   * 标题文字
   */
  title?: string;

  /**
   * 标题区域工具栏（放置返回按钮右侧的内容）
   */
  titleBody?: SchemaCollection;

  /**
   * 内容区域工具栏（放置分隔线右侧的内容）
   */
  content?: SchemaCollection;

  /**
   * 是否显示返回按钮
   */
  showBackButton?: boolean;

  /**
   * 返回按钮图标
   */
  backIcon?: string;

  /**
   * 标题区域CSS类名
   */
  titleClassName?: SchemaClassName;

  /**
   * 内容区域CSS类名
   */
  contentClassName?: SchemaClassName;

  /**
   * 自定义样式
   */
  style?: {
    [propName: string]: any;
  };
}

export interface PageHeaderProps
  extends RendererProps,
    Omit<PageHeaderSchema, 'type' | 'className'> {}

export default class PageHeader extends React.Component<PageHeaderProps> {
  static defaultProps: Partial<PageHeaderProps> = {
    showBackButton: true,
    backIcon: 'fa fa-angle-left',
    title: '页面标题'
  };

  @autobind
  handleClick(e: React.MouseEvent<any>) {
    // 处理点击事件
  }

  @autobind
  handleMouseEnter(e: React.MouseEvent<any>) {
    // 处理鼠标进入事件
  }

  @autobind
  handleMouseLeave(e: React.MouseEvent<any>) {
    // 处理鼠标离开事件
  }

  @autobind
  handleBackClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const {onAction, data} = this.props;

    // 触发返回动作
    onAction &&
      onAction(
        e,
        {
          actionType: 'back',
          args: {
            data
          }
        },
        data
      );
  }

  renderBackButton() {
    const {showBackButton, backIcon, render, classnames: cx} = this.props;

    if (!showBackButton) {
      return null;
    }

    // 使用amis内置的icon组件来渲染图标（包括iconify图标）
    const iconConfig: any = {
      type: 'icon',
      icon: backIcon,
      className: 'PageHeader-backIcon',
      onClick: this.handleBackClick
    };

    // 如果是iconify图标格式（包含冒号），设置vendor为空
    if (backIcon && backIcon.includes(':')) {
      iconConfig.vendor = '';
    }

    return (
      <div className={cx('PageHeader-back')}>
        {render('backIcon', iconConfig)}
      </div>
    );
  }

  renderTitleBody() {
    const {
      titleBody,
      title,
      render,
      titleClassName,
      classnames: cx
    } = this.props;

    if (titleBody) {
      return (
        <div className={cx('PageHeader-titleBody', titleClassName)}>
          {render('titleBody', titleBody, {
            data: this.props.data,
            onAction: this.props.onAction
          })}
        </div>
      );
    }

    if (title) {
      return (
        <div className={cx('PageHeader-titleBody', titleClassName)}>
          <div className={cx('PageHeader-title')}>{title}</div>
        </div>
      );
    }

    return null;
  }

  renderContent() {
    const {content, render, contentClassName, classnames: cx} = this.props;

    if (!content) {
      return null;
    }

    return (
      <div className={cx('PageHeader-content', contentClassName)}>
        {render('content', content, {
          data: this.props.data,
          onAction: this.props.onAction
        })}
      </div>
    );
  }

  render() {
    const {
      className,
      classnames: cx,
      id,
      wrapperCustomStyle,
      env,
      themeCss,
      style
    } = this.props;

    const styleObj = buildStyle(style, this.props.data);

    return (
      <div
        className={cx(
          'PageHeader',
          className,
          setThemeClassName({
            ...this.props,
            name: 'pageHeaderClassName',
            id,
            themeCss
          })
        )}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={styleObj}
      >
        <div className={cx('PageHeader-left')}>
          {this.renderBackButton()}
          {this.renderTitleBody()}
        </div>
        <div className={cx('PageHeader-divider')}></div>
        {this.renderContent()}
        <CustomStyle
          {...this.props}
          config={{
            wrapperCustomStyle,
            id,
            themeCss,
            classNames: [
              {
                key: 'pageHeaderClassName'
              }
            ]
          }}
          env={env}
        />
      </div>
    );
  }
}

@Renderer({
  type: 'page-header',
  name: 'page-header'
})
export class PageHeaderRenderer extends PageHeader {}
