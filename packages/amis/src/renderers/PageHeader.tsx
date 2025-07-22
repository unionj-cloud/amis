import React from 'react';
import {
  Renderer,
  RendererProps,
  autobind,
  CustomStyle,
  setThemeClassName,
  resolveEventData,
  createObject
} from 'amis-core';
import { BaseSchema, SchemaClassName } from '../Schema';

/**
 * 选项卡页头渲染器
 */
export interface PageHeaderSchema {
  /**
   * 指定为选项卡页头组件
   */
  type: 'page-header';

  /**
   * 下拉框配置（只能有一个）
   */
  filter?: {
    /**
     * 下拉框标识
     */
    name: string;
    /**
     * 下拉框标签（不显示，仅用于标识）
     */
    label?: string;
    /**
     * 下拉框选项
     */
    options: Array<{
      label: string;
      value: any;
      /**
       * 选项标签
       */
      badge?: string;
      /**
       * 鼠标悬停提示内容，支持HTML和模板语法
       * 可使用 ${变量名} 形式引用数据，支持过滤器
       * 例如：'<strong>标题</strong><br/>内容描述<br/>时间：${time|date:YYYY-MM-DD}'
       */
      tooltip?: string;
    }>;
    /**
     * 默认值
     */
    value?: any;
    /**
     * 选项接口
     */
    source?: string;
    /**
     * 右侧图标
     */
    rightIcon?: string;
  };

  /**
   * 选项卡配置
   */
  tabs?: Array<{
    /**
     * 选项卡标题
     */
    title: string;
    /**
     * 选项卡内容
     */
    body: any;
    /**
     * 选项卡唯一标识
     */
    key?: string;
    /**
     * 标题图标
     */
    icon?: string;
    /**
     * 图标位置
     */
    iconPosition?: 'left' | 'right';
    /**
     * Hash值
     */
    hash?: string;
  }>;

  /**
   * 初始选项卡
   */
  defaultKey?: string | number;

  /**
   * 激活的选项卡
   */
  activeKey?: string | number;

  /**
   * 激活时渲染内容
   */
  mountOnEnter?: boolean;

  /**
   * 隐藏后销毁内容
   */
  unmountOnExit?: boolean;

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
  Omit<PageHeaderSchema, 'type' | 'className'> { }

export default class PageHeader extends React.Component<PageHeaderProps> {
  static defaultProps: Partial<PageHeaderProps> = {
    showBackButton: true,
    backIcon: 'iconfont icon-ltsa',
    tabs: [],
    mountOnEnter: true
  };

  state = {
    filterValue: undefined as any,
    activeTab: 0,
    dropdownOpen: false,
    mountedTabs: new Set<number>(),
    searchText: '',
    hoveredOptionIndex: -1
  };

  componentDidMount() {
    // 初始化下拉框默认值
    const { filter } = this.props;

    if (filter) {
      let initialValue = filter.value;
      // 如果没有设置默认值，使用第一个选项的值
      if (
        initialValue === undefined &&
        filter.options &&
        filter.options.length > 0
      ) {
        initialValue = filter.options[0].value;
      }
      this.setState({ filterValue: initialValue });
    }

    // 初始化激活的选项卡
    this.initActiveTab();
  }

  componentDidUpdate(prevProps: PageHeaderProps) {
    // 当filter.options变化时，重新初始化选中值
    if (
      this.props.filter &&
      prevProps.filter &&
      JSON.stringify(this.props.filter.options) !==
      JSON.stringify(prevProps.filter.options)
    ) {
      let initialValue = this.props.filter.value;
      if (
        initialValue === undefined &&
        this.props.filter.options &&
        this.props.filter.options.length > 0
      ) {
        initialValue = this.props.filter.options[0].value;
      }
      this.setState({ filterValue: initialValue });
    }
  }

  initActiveTab() {
    const { tabs, defaultKey, activeKey } = this.props;
    if (!tabs || tabs.length === 0) return;

    let initialActiveTab = 0;

    // 优先使用 activeKey
    if (activeKey !== undefined) {
      const activeIndex = this.findTabIndex(activeKey);
      if (activeIndex >= 0) {
        initialActiveTab = activeIndex;
      }
    } else if (defaultKey !== undefined) {
      // 其次使用 defaultKey
      const defaultIndex = this.findTabIndex(defaultKey);
      if (defaultIndex >= 0) {
        initialActiveTab = defaultIndex;
      }
    }

    const { mountOnEnter } = this.props;
    let mountedTabs = new Set<number>();

    if (!mountOnEnter) {
      // 如果不是激活时才渲染，则所有选项卡都已挂载
      mountedTabs = new Set(tabs.map((_, index) => index));
    } else {
      // 只挂载当前激活的选项卡
      mountedTabs.add(initialActiveTab);
    }

    this.setState({
      activeTab: initialActiveTab,
      mountedTabs
    });
  }

  findTabIndex(key: string | number): number {
    const { tabs } = this.props;
    if (!tabs) return -1;

    return tabs.findIndex((tab, index) => {
      if (tab.key !== undefined) {
        return tab.key === key;
      }
      return index === key;
    });
  }

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
  async handleBackClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const { dispatchEvent, data } = this.props;

    // 触发返回事件
    if (dispatchEvent) {
      const rendererEvent = await dispatchEvent(
        'back',
        resolveEventData(this.props, data)
      );

      if (rendererEvent?.prevented) {
        return;
      }
    }
  }

  @autobind
  async handleFilterChange(value: any) {
    const { dispatchEvent, filter, data } = this.props;

    // 触发过滤变化事件
    if (filter && dispatchEvent) {
      const eventData = createObject(data, {
        [filter.name]: value,
        filterValue: value,
        filterName: filter.name
      });

      const rendererEvent = await dispatchEvent(
        'filterChange',
        resolveEventData(this.props, eventData)
      );

      if (rendererEvent?.prevented) {
        return;
      }
    }

    this.setState({
      filterValue: value,
      dropdownOpen: false,
      searchText: '', // 选择后清空搜索文本
      hoveredOptionIndex: -1 // 清空悬停状态
    });
  }

  @autobind
  handleSearchChange(value: string) {
    this.setState({ searchText: value });
  }

  @autobind
  handleSearchClear() {
    this.setState({ searchText: '' });
  }

  @autobind
  handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      const { filter } = this.props;
      const { searchText } = this.state;

      if (filter && filter.options) {
        // 过滤选项
        const filteredOptions = filter.options.filter(option =>
          option.label.toLowerCase().includes(searchText.toLowerCase())
        );

        // 如果有匹配的选项，选中第一条
        if (filteredOptions.length > 0) {
          this.handleFilterChange(filteredOptions[0].value);
        }
      }
    }
  }

  @autobind
  async handleTabChange(index: number) {
    const { dispatchEvent, tabs, mountOnEnter, unmountOnExit, data } = this.props;
    const { mountedTabs } = this.state;
    const activeTab = tabs?.[index];

    // 触发选项卡变化事件
    if (dispatchEvent) {
      const eventData = createObject(data, {
        [this.props.filter?.name || 'filter']: this.state.filterValue,
        activeTab: activeTab?.key || index,
        activeTabIndex: index,
        filterValue: this.state.filterValue
      });

      const rendererEvent = await dispatchEvent(
        'tabChange',
        resolveEventData(this.props, eventData)
      );

      if (rendererEvent?.prevented) {
        return;
      }
    }

    let newMountedTabs = new Set(mountedTabs);

    // 处理挂载逻辑
    if (mountOnEnter && !newMountedTabs.has(index)) {
      newMountedTabs.add(index);
    }

    // 处理卸载逻辑
    if (unmountOnExit && this.state.activeTab !== index) {
      newMountedTabs.delete(this.state.activeTab);
    }

    this.setState({
      activeTab: index,
      mountedTabs: newMountedTabs
    });

    // 处理Hash
    if (activeTab?.hash) {
      window.location.hash = activeTab.hash;
    }
  }

  @autobind
  toggleDropdown(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
      searchText: '', // 打开时清空搜索文本
      hoveredOptionIndex: -1 // 清空悬停状态
    });
  }

  @autobind
  closeDropdown(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      dropdownOpen: false,
      searchText: '', // 关闭时清空搜索文本
      hoveredOptionIndex: -1 // 清空悬停状态
    });
  }

  @autobind
  handleOptionMouseEnter(index: number) {
    this.setState({ hoveredOptionIndex: index }, () => {
      // 计算tooltip位置
      this.updateTooltipPosition();
    });
  }

  @autobind
  handleOptionMouseLeave() {
    this.setState({ hoveredOptionIndex: -1 });
  }

  @autobind
  updateTooltipPosition() {
    const { hoveredOptionIndex } = this.state;
    if (hoveredOptionIndex === -1) return;

    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      // 使用更精确的方式查找元素，避免多个组件间冲突
      const filterElement = document.querySelector(
        `[data-component-id="${this.props.id || 'page-header'}"] .cxd-PageHeader-filter`
      ) as HTMLElement;

      if (!filterElement) return;

      const tooltipEl = filterElement.querySelector('.cxd-PageHeader-filter-tooltip') as HTMLElement;
      const dropdownEl = filterElement.querySelector('.cxd-PageHeader-filter-dropdown') as HTMLElement;
      const optionEl = filterElement.querySelector(
        `.cxd-PageHeader-filter-option:nth-child(${hoveredOptionIndex + 1})`
      ) as HTMLElement;

      if (tooltipEl && dropdownEl && optionEl) {
        const dropdownRect = dropdownEl.getBoundingClientRect();
        const optionRect = optionEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 固定在下拉框右侧，距离右侧边框-40px的位置
        const left = dropdownRect.right - 40;

        // 计算选项的垂直中心位置
        const optionCenterY = optionRect.top + optionRect.height / 2;

        // tooltip的top位置，让箭头指向选项中心
        // 箭头位置在tooltip的垂直中心，所以tooltip的top = 选项中心 - tooltip高度/2
        let top = optionCenterY - (tooltipEl.offsetHeight / 2);

        // 应用位置
        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${top - 63.5}px`;
      }
    }, 50);
  }

  renderBackButton() {
    const { showBackButton, backIcon, render, classnames: cx } = this.props;

    if (!showBackButton) {
      return null;
    }

    const iconConfig = {
      type: 'icon',
      icon: backIcon,
      className: cx('PageHeader-backIcon'),
      vendor: ''
    };

    return (
      <div
        className={cx('PageHeader-back')}
        onClick={this.handleBackClick}
        style={{ cursor: 'pointer' }}
      >
        {render('backIcon', iconConfig)}
      </div>
    );
  }

  renderFilter() {
    const { filter, classnames: cx, render } = this.props;
    const { filterValue, dropdownOpen, searchText, hoveredOptionIndex } =
      this.state;

    if (!filter || !filter.options || filter.options.length === 0) {
      return null;
    }

    // 找到当前选中的选项
    const selectedOption =
      filter.options.find(opt => opt.value === filterValue) ||
      filter.options[0];

    // 确定右侧图标
    const rightIcon = filter.rightIcon || 'fa fa-caret-down';

    // 过滤选项
    const filteredOptions = filter.options.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );

    // 获取当前悬停的选项
    const hoveredOption = hoveredOptionIndex >= 0 && hoveredOptionIndex < filteredOptions.length
      ? filteredOptions[hoveredOptionIndex]
      : null;

    return (
      <div className={cx('PageHeader-filter')}>
        {/* 显示区域 */}
        <div
          className={cx('PageHeader-filter-display')}
          onClick={e => {
            this.toggleDropdown(e);
          }}
          title={selectedOption?.label || '请选择'} // 添加原生tooltip
        >
          <span className={cx('PageHeader-filter-label')}>
            {selectedOption?.label || '请选择'}
          </span>

          {/* 使用配置的右侧图标 */}
          <span className={cx('PageHeader-filter-icon', {
            'PageHeader-filter-icon--rotated': dropdownOpen
          })}>
            {render('rightIcon', {
              type: 'icon',
              icon: rightIcon,
              vendor: ''
            })}
          </span>
        </div>

        {/* 下拉选项容器 */}
        {dropdownOpen && (
          <div
            className={cx('PageHeader-filter-dropdown')}
            onClick={e => e.stopPropagation()}
          >
            {/* 选项列表 */}
            <div className={cx('PageHeader-filter-options')}>
              {/* 搜索输入框 */}
              <div className={cx('PageHeader-filter-search-container')}>
                <input
                  type="text"
                  className={cx('PageHeader-filter-search')}
                  placeholder="请输入匹配字段，按enter键可选中第一条"
                  value={searchText}
                  onChange={e => this.handleSearchChange(e.target.value)}
                  onKeyDown={this.handleKeyDown}
                  autoFocus
                />
                {searchText && (
                  <span
                    className={cx('PageHeader-filter-search-clear')}
                    onClick={this.handleSearchClear}
                  >
                    ×
                  </span>
                )}
              </div>
              {/* 选项滚动区域 */}
              <div className={cx('PageHeader-filter-options-scroll')}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={`${option.value}-${index}`}
                      className={cx('PageHeader-filter-option', {
                        'is-active': option.value === filterValue
                      })}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleFilterChange(option.value);
                      }}
                      onMouseEnter={() => {
                        this.handleOptionMouseEnter(index);
                      }}
                      onMouseLeave={() => {
                        this.handleOptionMouseLeave();
                      }}
                    >
                      <span className={cx('PageHeader-filter-option-content')}>
                        {option.label}
                      </span>
                      {/* 可选的标签 */}
                      {(option as any).badge && (
                        <span className={cx('PageHeader-filter-option-badge')}>
                          {(option as any).badge}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={cx('PageHeader-filter-no-results')}>
                    暂无匹配的选项
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tooltip渲染在外层，避免被下拉框遮挡 */}
        {dropdownOpen && hoveredOption && (hoveredOption as any).tooltip && (
          <div className={cx('PageHeader-filter-tooltip')}>
            {render('tooltip-content', {
              type: 'tpl',
              tpl: (hoveredOption as any).tooltip
            }, {
              data: {
                ...this.props.data,
                [this.props.filter?.name || 'filter']: this.state.filterValue,
                option: hoveredOption,
                // 提供一些默认的时间数据用于演示
                endTime: '1925-07-07',
                time: new Date().toISOString()
              }
            })}
          </div>
        )}
      </div>
    );
  }

  renderTabHeaders() {
    const { tabs, classnames: cx, render } = this.props;
    const { activeTab } = this.state;

    if (!tabs || tabs.length === 0) {
      return null;
    }

    return (
      <div className={cx('PageHeader-tabs-nav')}>
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;

          return (
            <div
              key={tab.key || index}
              className={cx('PageHeader-tab-item', {
                'is-active': isActive
              })}
              onClick={() => this.handleTabChange(index)}
            >
              {/* 渲染图标 */}
              {tab.icon && (
                <span
                  className={cx('PageHeader-tab-icon', {
                    'PageHeader-tab-icon--right': tab.iconPosition === 'right',
                    'PageHeader-tab-icon--left': tab.iconPosition !== 'right'
                  })}
                >
                  {render('tab-icon', {
                    type: 'icon',
                    icon: tab.icon,
                    vendor: ''
                  })}
                </span>
              )}

              {/* 渲染标题 */}
              <span
                className={cx('PageHeader-tab-title')}
                title={tab.title}
                style={{
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                {tab.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  renderTabContent() {
    const { tabs, render, mountOnEnter, classnames: cx } = this.props;
    const { activeTab, filterValue, mountedTabs } = this.state;

    if (!tabs || tabs.length === 0 || !tabs[activeTab]) {
      return null;
    }

    const currentTab = tabs[activeTab];

    // 检查当前选项卡是否应该被渲染
    if (mountOnEnter && !mountedTabs.has(activeTab)) {
      return (
        <div className={cx('PageHeader-loading')}>
          <div className="text-muted">加载中...</div>
        </div>
      );
    }

    // 将过滤器的值传递给选项卡内容
    const context = {
      ...this.props.data,
      [this.props.filter?.name || 'filter']: filterValue,
      activeTabIndex: activeTab,
      activeTabKey: currentTab.key || activeTab
    };

    return (
      <div className={cx('PageHeader-content')}>
        {render('tab-content', currentTab.body, {
          data: context,
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

    const finalStyle = { ...style };

    return (
      <div>
        {/* 页头区域 */}
        <div
          className={cx(
            'PageHeader',
            'PageHeader--tabbed',
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
          style={finalStyle}
          data-component-id={id || 'page-header'}
        >
          <div className={cx('PageHeader-main')}>
            {/* 返回按钮 */}
            {this.renderBackButton()}

            {/* 下拉框 */}
            {this.renderFilter()}

            {/* 分隔线 */}
            {this.props.filter &&
              this.props.tabs &&
              this.props.tabs.length > 0 && (
                <div className={cx('PageHeader-divider')} />
              )}

            {/* 选项卡头部 */}
            {this.renderTabHeaders()}
          </div>
        </div>

        {/* 内容区域 */}
        {this.renderTabContent()}

        {/* 点击遮罩关闭下拉框 */}
        {this.state.dropdownOpen && (
          <div
            className={cx('PageHeader-overlay')}
            onClick={this.closeDropdown}
            onContextMenu={e => e.preventDefault()}
          />
        )}

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
export class PageHeaderRenderer extends PageHeader { }
