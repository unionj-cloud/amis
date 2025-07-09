import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FormItem,
  FormControlProps,
  autobind,
  iconRegistryAPI,
  IconItem,
  IconCategory
} from 'amis-core';
import {
  Modal,
  Button,
  Spinner,
  SearchBox,
  Icon,
  SpinnerExtraProps
} from 'amis-ui';
import debounce from 'lodash/debounce';
import { FormBaseControlSchema } from '../../Schema';
import { Icon as Iconify } from '@iconify/react';

/**
 * 图标选择器控件
 */
export interface IconSelectorControlSchema extends FormBaseControlSchema {
  type: 'icon-selector';

  /**
   * 占位符
   */
  placeholder?: string;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 无数据提示
   */
  noDataTip?: string;

  /**
   * 是否可清空
   */
  clearable?: boolean;

  /**
   * 搜索框占位符
   */
  searchPlaceholder?: string;

  /**
   * 是否显示图标预览
   */
  showPreview?: boolean;

  /**
   * 是否显示图标名称
   */
  showIconName?: boolean;

  /**
   * 图标大小
   */
  iconSize?: 'sm' | 'md' | 'lg';

  /**
   * 默认分类
   */
  defaultCategory?: string;

  /**
   * 每页渲染的图标数量，过大会导致卡顿
   */
  pageSize?: number;
}

export interface IconSelectorProps extends FormControlProps, SpinnerExtraProps {
  placeholder?: string;
  disabled?: boolean;
  noDataTip?: string;
  clearable?: boolean;
  maxHeight?: number;
  searchPlaceholder?: string;
  showPreview?: boolean;
  showIconName?: boolean;
  iconsPerRow?: number;
  iconSize?: 'sm' | 'md' | 'lg';
  defaultCategory?: string;
  pageSize?: number;
}

export interface IconSelectorState {
  showModal: boolean;
  selectedIcon: IconItem | null;
  searchValue: string;
  activeCategory: string;
  isLoading: boolean;
  allIcons: IconItem[];
  categories: IconCategory[];
  currentPage: number;
}

/**
 * 图标选择器组件
 */
export default class IconSelectorControl extends React.PureComponent<
  IconSelectorProps,
  IconSelectorState
> {
  private debouncedSearch: (value: string) => void;
  private changeListener: () => void;

  static defaultProps: Pick<
    IconSelectorProps,
    | 'noDataTip'
    | 'clearable'
    | 'maxHeight'
    | 'searchPlaceholder'
    | 'showPreview'
    | 'showIconName'
    | 'iconsPerRow'
    | 'iconSize'
    | 'pageSize'
  > = {
      noDataTip: '暂无图标数据',
      clearable: true,
      maxHeight: 400,
      searchPlaceholder: '搜索图标...',
      showPreview: true,
      showIconName: true,
      iconsPerRow: 12,
      iconSize: 'md',
      pageSize: 84
    };

  state: IconSelectorState = {
    showModal: false,
    selectedIcon: null,
    searchValue: '',
    activeCategory: 'all',
    isLoading: false,
    allIcons: [],
    categories: [],
    currentPage: 1
  };

  constructor(props: IconSelectorProps) {
    super(props);

    // 创建防抖搜索函数
    this.debouncedSearch = debounce((value: string) => {
      this.setState({ searchValue: value, currentPage: 1 });
    }, 300);

    // 创建变化监听器
    this.changeListener = () => {
      this.loadIcons();
    };
  }

  componentDidMount() {
    this.loadIcons();

    // 监听图标库变化
    iconRegistryAPI.addChangeListener(this.changeListener);
  }

  componentWillUnmount() {
    // 移除变化监听器
    iconRegistryAPI.removeChangeListener(this.changeListener);
  }

  componentDidUpdate(prevProps: IconSelectorProps) {
    if (prevProps.value !== this.props.value) {
      this.updateSelectedIcon();
    }
  }

  /**
   * 加载图标数据
   */
  @autobind
  async loadIcons() {
    this.setState({ isLoading: true });

    try {
      // 确保图标注册系统已初始化
      if (!iconRegistryAPI.isInitialized()) {
        // 如果没有初始化，使用默认配置初始化
        await iconRegistryAPI.initialize({
          fontAwesome: { enabled: true },
          iconify: [{ iconSet: 'ep', category: 'Element Plus' }],
          amis: { enabled: true }
        });
      }

      const allIcons = iconRegistryAPI.getAllIcons();
      console.log('allIcons', allIcons);
      const categories = iconRegistryAPI.getCategories();

      // 添加"全部"分类
      const allCategories = [
        {
          name: '全部',
          id: 'all',
          icons: allIcons
        },
        ...categories
      ];

      this.setState(
        {
          allIcons: allIcons,
          categories: allCategories,
          activeCategory: this.props.defaultCategory || 'all'
        },
        this.updateSelectedIcon
      );
    } catch (error) {
      console.error('Failed to load icons:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * 更新选中的图标
   */
  @autobind
  updateSelectedIcon() {
    const { value } = this.props;
    const { allIcons } = this.state;

    if (value && allIcons.length > 0) {
      const selectedIcon = allIcons.find(icon => icon.name === value);
      this.setState({ selectedIcon: selectedIcon || null });
    } else {
      this.setState({ selectedIcon: null });
    }
  }

  /**
   * 点击输入框
   */
  @autobind
  handleClick() {
    if (this.props.disabled) {
      return;
    }
    this.setState({ showModal: true });
  }

  /**
   * 清空选择
   */
  @autobind
  handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onChange && this.props.onChange('');
    this.setState({ selectedIcon: null });
  }

  /**
   * 关闭模态框
   */
  @autobind
  handleCloseModal() {
    this.setState({
      showModal: false,
      searchValue: '',
      activeCategory: this.props.defaultCategory || 'all'
    });
  }

  /**
   * 确认选择
   */
  @autobind
  handleConfirm(icon: IconItem) {
    this.props.onChange && this.props.onChange(icon.name);
    this.setState({
      selectedIcon: icon,
      showModal: false,
      searchValue: '',
      activeCategory: this.props.defaultCategory || 'all'
    });
  }

  /**
   * 搜索变化
   */
  @autobind
  handleSearchChange(value: string) {
    this.debouncedSearch(value);
  }

  /**
   * 分类变化
   */
  @autobind
  handleCategoryChange(categoryId: string) {
    this.setState({ activeCategory: categoryId, currentPage: 1 });
  }

  /**
   * 更新当前页
   */
  @autobind
  setPage(page: number) {
    this.setState({ currentPage: page });
  }

  /**
   * 渲染图标
   */
  @autobind
  renderIcon(icon: IconItem, size: string = '16px') {
    const iconSizeMap = {
      sm: 14,
      md: 16,
      lg: 20
    };

    // 对于iconify图标，使用数值型的width和height属性
    const iconifySize = typeof size === 'string' && size.endsWith('px')
      ? parseInt(size.replace('px', ''))
      : iconSizeMap[size as keyof typeof iconSizeMap] || 16;

    console.log('iconifySize', iconifySize);
    const style = { fontSize: size };

    switch (icon.type) {
      case 'fontawesome':
        return <i className={icon.name} style={style} />;
      case 'iconify':
        return <Iconify icon={icon.name} width={iconifySize} height={iconifySize} />;
      case 'custom':
        return <i className={icon.name} style={style} />;
      case 'amis':
        return <i className={icon.name} style={style} />;
      case 'svg':
        return icon.svg ? (
          <span style={style} dangerouslySetInnerHTML={{ __html: icon.svg }} />
        ) : (
          <i className={icon.name} style={style} />
        );
      default:
        return <i className={icon.name} style={style} />;
    }
  }

  /**
   * 渲染输入区域
   */
  @autobind
  renderInputArea() {
    const {
      classPrefix: ns,
      disabled,
      placeholder,
      clearable,
      showPreview,
      showIconName,
      iconSize
    } = this.props;

    const { selectedIcon } = this.state;

    const iconSizes = {
      sm: '14px',
      md: '16px',
      lg: '20px'
    };

    return (
      <div className={`${ns}IconSelectorControl-input-area`}>
        {showPreview && selectedIcon && (
          <div className={`${ns}IconSelectorControl-input-icon-show`}>
            {this.renderIcon(selectedIcon, iconSizes[iconSize || 'md'])}
          </div>
        )}

        <span className={`${ns}IconSelectorControl-input-icon-name`}>
          {showIconName && selectedIcon && (selectedIcon.displayName || selectedIcon.name)}
        </span>

        {clearable && !disabled && selectedIcon && (
          <a
            onClick={this.handleClear}
            className={`${ns}Select-clear`}
          >
            <Icon icon="input-clear" className="icon" />
          </a>
        )}

        <Icon
          icon="chevron-down"
          className={`${ns}IconSelectorControl-caret`}
        />
      </div>
    );
  }

  /**
   * 渲染分类列表
   */
  @autobind
  renderCategoryList() {
    const { classPrefix: ns } = this.props;
    const { categories, activeCategory } = this.state;

    return (
      <div className={`${ns}IconSelectorControl-category-list`}>
        {categories.map(category => (
          <div
            key={category.id}
            className={`${ns}IconSelectorControl-category-item ${activeCategory === category.id ? 'active' : ''
              }`}
            onClick={() => this.handleCategoryChange(category.id)}
          >
            {category.name}
            <span className={`${ns}IconSelectorControl-category-count`}>
              ({category.icons.length})
            </span>
          </div>
        ))}
      </div>
    );
  }

  /**
   * 渲染图标列表
   */
  @autobind
  renderIconList() {
    const { classPrefix: ns, iconsPerRow, iconSize, pageSize = 120 } = this.props;
    const { searchValue, activeCategory, categories, allIcons, currentPage } =
      this.state;

    // 获取要显示的图标
    let displayIcons: IconItem[] = [];

    if (searchValue.trim()) {
      // 搜索模式
      displayIcons = iconRegistryAPI.searchIcons(searchValue);
    } else {
      // 分类模式
      const category = categories.find(cat => cat.id === activeCategory);
      displayIcons = category ? category.icons : allIcons;
    }

    if (displayIcons.length === 0) {
      return (
        <div className={`${ns}IconSelectorControl-no-data`}>
          {this.props.noDataTip}
        </div>
      );
    }

    const iconSizes = {
      sm: '14px',
      md: '16px',
      lg: '20px'
    };

    const totalPages = Math.ceil(displayIcons.length / pageSize);
    const page = Math.min(currentPage, totalPages) || 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageIcons = displayIcons.slice(startIndex, endIndex);

    console.log('pageIcons', pageIcons);

    const gridStyle = {
      gridTemplateColumns: `repeat(${iconsPerRow}, 1fr)`
    };

    return (
      <div className={`${ns}IconSelectorControl-icon-list-wrapper`}>
        <div className={`${ns}IconSelectorControl-icon-list`}>
          <div
            className={`${ns}IconSelectorControl-icon-grid`}
            style={gridStyle}
          >
            {pageIcons.map((icon, index) => (
              <div
                key={`${icon.name}-${index}`}
                className={`${ns}IconSelectorControl-icon-item`}
                onClick={() => this.handleConfirm(icon)}
                title={`${icon.displayName || icon.name} (${icon.category})`}
              >
                {this.renderIcon(icon, iconSizes[iconSize || 'md'])}
              </div>
            ))}
          </div>
        </div>
        {totalPages > 1 && (
          <div className={`${ns}IconSelectorControl-pagination`}>
            <Button
              size="sm"
              disabled={page <= 1}
              onClick={() => this.setPage(page - 1)}
            >
              上一页
            </Button>
            <span className={`${ns}IconSelectorControl-pagination-info`}>
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              disabled={page >= totalPages}
              onClick={() => this.setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    );
  }

  /**
   * 渲染模态框内容
   */
  @autobind
  renderModalContent() {
    const { classPrefix: ns, searchPlaceholder } = this.props;
    const { isLoading, searchValue } = this.state;

    if (isLoading) {
      return (
        <div className={`${ns}IconSelectorControl-loading`}>
          <Spinner />
          <span>加载图标中...</span>
        </div>
      );
    }

    return (
      <div className={`${ns}IconSelectorControl-modal-content`}>
        <div className={`${ns}IconSelectorControl-body`}>
          {!searchValue.trim() && (
            <div className={`${ns}IconSelectorControl-sidebar`}>
              {this.renderCategoryList()}
            </div>
          )}

          <div className={`${ns}IconSelectorControl-main`}>
            {this.renderIconList()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      classPrefix: ns,
      disabled,
      maxHeight,
      searchPlaceholder
    } = this.props;
    const { showModal, searchValue } = this.state;

    return (
      <div className={`${ns}IconSelectorControl`}>
        <div
          className={`${ns}IconSelectorControl-input ${disabled ? 'disabled' : ''
            }`}
          onClick={this.handleClick}
        >
          {this.renderInputArea()}
        </div>

        <Modal
          size="md"
          show={showModal}
          onHide={this.handleCloseModal}
          className={`${ns}IconSelectorControl-modal`}
        >
          <Modal.Header onClose={this.handleCloseModal}>
            <Modal.Title>
              <span>选择图标</span>
              <div className={`${ns}IconSelectorControl-search-area`}>
                <SearchBox
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={this.handleSearchChange}
                />
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight }}>
            {this.renderModalContent()}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseModal}>取消</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

@FormItem({
  type: 'icon-selector'
})
export class IconSelectorControlRenderer extends IconSelectorControl { }
