/**
 * @file Modal
 * @description
 * @author fex
 */

import React from 'react';
import Transition, {
  ENTERED,
  ENTERING,
  EXITING,
  EXITED
} from 'react-transition-group/Transition';
import Portal from 'react-overlays/Portal';
import {current, addModal, removeModal} from './ModalManager';
import {ClassNamesFn, themeable, ThemeProps} from 'amis-core';
import {Icon} from './icons';
import {LocaleProps, localeable} from 'amis-core';
import {autobind, getScrollbarWidth} from 'amis-core';
import {
  DraggableCore,
  type DraggableBounds,
  type DraggableData,
  type DraggableEvent
} from 'react-draggable';
import isNumber from 'lodash/isNumber';
import {findDOMNode} from 'react-dom';

export const getContainerWithFullscreen =
  (container?: () => HTMLElement | HTMLElement | null) => () => {
    const envContainer =
      typeof container === 'function' ? container() : container;

    // 获取当前全屏元素
    const fullscreenElement = document.fullscreenElement;

    if (
      fullscreenElement &&
      (!envContainer || !fullscreenElement.contains(envContainer))
    ) {
      return fullscreenElement as HTMLElement;
    }
    return envContainer || null;
  };

export interface ModalProps extends ThemeProps, LocaleProps {
  className?: string;
  contentClassName?: string;
  size?: any;
  width?: any;
  height?: any;
  overlay?: boolean;
  onHide: (e: any) => void;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
  container?: any;
  show?: boolean;
  disabled?: boolean;
  onExited?: () => void;
  onEntered?: () => void;
  children?: React.ReactNode | Array<React.ReactNode>;
  modalClassName?: string;
  modalMaskClassName?: string;
  draggable?: boolean;
  showFullscreenButton?: boolean;
}

export interface ModalState {
  bounds?: DraggableBounds;
  dragPos?: {x: number; y: number};
  isFullscreen?: boolean;
}

const fadeStyles: {
  [propName: string]: string;
} = {
  [ENTERING]: 'in',
  [ENTERED]: 'in',
  [EXITING]: 'out'
};

const contentFadeStyles: {
  [propName: string]: string;
} = {
  [ENTERING]: 'in',
  [ENTERED]: '',
  [EXITING]: 'out'
};

// 添加全屏样式相关的CSS规则
const fullscreenModalStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  maxWidth: '100vw',
  maxHeight: '100vh',
  margin: 0,
  top: 0,
  left: 0,
  borderRadius: 0,
  position: 'fixed'
};

export class Modal extends React.Component<ModalProps, ModalState> {
  static defaultProps = {
    container: document.body,
    size: '',
    overlay: true,
    draggable: false
  };

  isRootClosed = false;
  modalDom: HTMLElement;

  static Header = themeable(
    localeable(
      ({
        classnames: cx,
        className,
        showCloseButton,
        showFullscreenButton,
        isFullscreen,
        onClose,
        onFullscreen,
        children,
        classPrefix,
        translate: __,
        forwardedRef,
        ...rest
      }: ThemeProps &
        LocaleProps & {
          className?: string;
          showCloseButton?: boolean;
          showFullscreenButton?: boolean;
          isFullscreen?: boolean;
          onClose?: () => void;
          onFullscreen?: () => void;
          children?: React.ReactNode;
          forwardedRef?: any;
        } & React.HTMLAttributes<HTMLDivElement>) => (
        <div {...rest} className={cx('Modal-header', className)}>
          {showCloseButton !== false ? (
            <a
              data-tooltip={__('Dialog.close')}
              data-position="left"
              onClick={onClose}
              className={cx('Modal-close')}
            >
              <Icon icon="close" className="icon" />
            </a>
          ) : null}
          {showFullscreenButton ? (
            <a
              data-tooltip={__('Dialog.fullscreen')}
              data-position="left"
              onClick={onFullscreen}
              className={cx('Modal-fullscreen')}
            >
              <Icon
                icon={isFullscreen ? 'compress' : 'expand-alt'}
                className="icon"
              />
            </a>
          ) : null}
          {children}
        </div>
      )
    )
  );

  static Title = themeable(
    ({
      classnames: cx,
      className,
      children,
      classPrefix,
      forwardedRef,
      ...rest
    }: ThemeProps & {
      className?: string;
      children?: React.ReactNode;
      forwardedRef?: any;
    } & React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest} className={cx('Modal-title', className)}>
        {children}
      </div>
    )
  );

  static Body = themeable(
    ({
      classnames: cx,
      className,
      children,
      classPrefix,
      forwardedRef,
      ...rest
    }: ThemeProps & {
      className?: string;
      children?: React.ReactNode;
      forwardedRef?: any;
    } & React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest} className={cx('Modal-body', className)}>
        {children}
      </div>
    )
  );

  static Footer = themeable(
    ({
      classnames: cx,
      className,
      children,
      classPrefix,
      forwardedRef,
      ...rest
    }: ThemeProps & {
      className?: string;
      children?: React.ReactNode;
      forwardedRef?: any;
    } & React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest} className={cx('Modal-footer', className)}>
        {children}
      </div>
    )
  );

  state: Readonly<ModalState> = {
    dragPos: undefined,
    isFullscreen: false
  };

  componentDidMount() {
    if (this.props.show) {
      this.handleEnter();
      this.handleEntered();
    }
  }

  componentWillUnmount() {
    if (this.props.show) {
      this.handleExited();
    }
  }

  handleEnter = () => {
    document.body.classList.add(`is-modalOpened`);
    if (
      window.innerWidth - document.documentElement.clientWidth > 0 ||
      document.body.scrollHeight > document.body.clientHeight
    ) {
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.width = `calc(100% - ${scrollbarWidth}px)`;
    }
  };

  handleEntered = () => {
    const onEntered = this.props.onEntered;

    document.body.addEventListener(
      'mousedown',
      this.handleRootMouseDownCapture,
      true
    );
    document.body.addEventListener(
      'mouseup',
      this.handleRootMouseUpCapture,
      true
    );
    document.body.addEventListener('mouseup', this.handleRootMouseUp);

    onEntered && onEntered();
  };
  handleExited = () => {
    const onExited = this.props.onExited;

    document.body.removeEventListener('mouseup', this.handleRootMouseUp);
    document.body.removeEventListener(
      'mousedown',
      this.handleRootMouseDownCapture,
      true
    );
    document.body.removeEventListener(
      'mouseup',
      this.handleRootMouseUpCapture,
      true
    );

    onExited && onExited();
    setTimeout(() => {
      if (!document.querySelector('.amis-dialog-widget')) {
        document.body.classList.remove(`is-modalOpened`);
        document.body.style.width = '';
      }
    }, 200);
  };

  modalRef = (ref: any) => {
    this.modalDom = ref;
    const {classPrefix: ns} = this.props;
    if (ref) {
      addModal(this);
      (ref as HTMLElement).classList.add(`${ns}Modal--${current()}th`);
    } else {
      removeModal(this);
    }
  };

  @autobind
  handleRootMouseDownCapture(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const {closeOnOutside, classPrefix: ns} = this.props;
    const isLeftButton =
      (e.button === 1 && window.event !== null) || e.button === 0;

    this.isRootClosed = !!(
      isLeftButton &&
      closeOnOutside &&
      target &&
      this.modalDom &&
      ((!this.modalDom.contains(target) && !target.closest('[role=dialog]')) ||
        (target.matches(`.${ns}Modal`) && target === this.modalDom))
    ); // 干脆过滤掉来自弹框里面的点击
  }

  @autobind
  handleRootMouseUpCapture(e: MouseEvent) {
    // mousedown 的时候不在弹窗里面，则不需要判断了
    if (!this.isRootClosed) {
      return;
    }

    // 再判断 mouseup 的时候是不是在弹窗里面
    this.handleRootMouseDownCapture(e);
  }

  @autobind
  handleRootMouseUp(e: MouseEvent) {
    const {onHide} = this.props;
    this.isRootClosed && !e.defaultPrevented && onHide(e);
  }

  // #region 处理dialog拖动

  handleDragStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const node = uiData.node;
    const {offsetParent} = node;
    if (!node || !offsetParent) {
      return;
    }
    const {clientWidth, clientHeight} = window.document.documentElement;
    const nodeStyle = getComputedStyle(node);
    const marginTop = parseInt(nodeStyle.marginTop, 10);
    const nodeWidth = parseInt(nodeStyle.width, 10);
    const nodeHeight = parseInt(nodeStyle.height, 10);
    const bounds = {
      left: 0,
      right: clientWidth - nodeWidth,
      top: -marginTop,
      bottom: clientHeight - nodeHeight - marginTop
    };
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const cLeft = clientRect.left;
    const pLeft = parentRect.left;
    const cTop = clientRect.top;
    const pTop = parentRect.top;
    const left = cLeft - pLeft + offsetParent.scrollLeft;
    const top = cTop - pTop + offsetParent.scrollTop - marginTop;
    this.setState({dragPos: {x: left, y: top}, bounds});
    // 阻止冒泡  存在弹窗里面套弹窗
    _event.stopPropagation();
  };

  handleDrag = (e: DraggableEvent, {deltaX, deltaY}: DraggableData) => {
    e.stopPropagation();
    if (!this.state.dragPos) {
      return;
    }
    const {
      dragPos: {x, y},
      bounds
    } = this.state;

    let calcY = y + deltaY;
    let calcX = x + deltaX;

    // 防止拖动到屏幕外 处理边界
    if (isNumber(bounds?.right)) {
      calcX = Math.min(calcX, bounds!.right);
    }
    if (isNumber(bounds?.bottom)) {
      calcY = Math.min(calcY, bounds!.bottom);
    }
    if (isNumber(bounds?.left)) {
      calcX = Math.max(calcX, bounds!.left);
    }
    if (isNumber(bounds?.top)) {
      calcY = Math.max(calcY, bounds!.top);
    }
    this.setState({dragPos: {x: calcX, y: calcY}});
  };

  handleDragStop = (e: DraggableEvent) => {
    e.stopPropagation();
  };

  getDragStyle = (): React.CSSProperties => {
    const {draggable} = this.props;
    const {dragPos} = this.state;
    if (!dragPos || !draggable) {
      return {};
    }
    const {x, y} = dragPos;
    return {
      top: `${y}px`,
      left: `${x}px`,
      position: 'absolute'
    };
  };

  // #endregion

  @autobind
  handleToggleFullscreen(e?: React.MouseEvent<HTMLElement>) {
    // 阻止事件冒泡
    e && e.preventDefault();
    e && e.stopPropagation();

    // 获取当前Modal DOM节点
    const modalElement = findDOMNode(this) as HTMLElement;
    if (!modalElement) {
      console.error('找不到Modal DOM元素');
      return;
    }

    // 使用动态classPrefix，而不是硬编码的前缀
    const {classPrefix} = this.props;
    const modalContentClass = `.${classPrefix}Modal-content`;
    const modalContent = modalElement.querySelector(
      modalContentClass
    ) as HTMLElement;
    if (!modalContent) {
      console.error(`找不到Modal内容元素 ${modalContentClass}`);
      return;
    }

    try {
      console.log(
        'Modal: 当前全屏状态:',
        !!document.fullscreenElement,
        '尝试切换全屏'
      );

      // 通过检查document.fullscreenElement判断当前是否处于全屏状态
      if (!document.fullscreenElement) {
        // 如果不是全屏，则请求全屏
        console.log('Modal: 请求进入全屏模式');

        // 兼容不同浏览器的请求全屏方法
        const requestMethod =
          modalContent.requestFullscreen ||
          (modalContent as any).webkitRequestFullscreen ||
          (modalContent as any).mozRequestFullscreen ||
          (modalContent as any).msRequestFullscreen;

        if (requestMethod) {
          requestMethod
            .call(modalContent)
            .then(() => {
              console.log('Modal: 全屏请求成功');
              this.setState({isFullscreen: true});

              // 触发resize事件
              window.dispatchEvent(new Event('resize'));
            })
            .catch((err: Error) => {
              console.error('Modal: 全屏请求失败:', err);
            });
        } else {
          console.error('Modal: 当前浏览器不支持Fullscreen API');
        }
      } else {
        // 如果已经是全屏状态，则退出全屏
        console.log('Modal: 请求退出全屏模式');

        // 兼容不同浏览器的退出全屏方法
        const exitMethod =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;

        if (exitMethod) {
          exitMethod
            .call(document)
            .then(() => {
              console.log('Modal: 退出全屏成功');
              this.setState({isFullscreen: false});

              // 触发resize事件
              window.dispatchEvent(new Event('resize'));
            })
            .catch((err: Error) => {
              console.error('Modal: 退出全屏失败:', err);
            });
        } else {
          console.error('Modal: 当前浏览器不支持退出全屏');
        }
      }
    } catch (err) {
      console.error('Modal: 全屏切换发生错误:', err);
    }
  }

  render() {
    const {
      className,
      contentClassName,
      children,
      container,
      show,
      size,
      style,
      overlay,
      width,
      height,
      modalClassName,
      modalMaskClassName,
      classnames: cx,
      mobileUI,
      draggable,
      classPrefix,
      showFullscreenButton
    } = this.props;

    const {isFullscreen} = this.state;

    // 根据全屏状态决定使用的图标
    const fullscreenIcon = isFullscreen ? 'compress' : 'expand';

    let _style = {
      width: style?.width ? style?.width : width,
      height: style?.height ? style?.height : height
    };

    // 全屏样式
    const fullscreenStyle: React.CSSProperties = isFullscreen
      ? {
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          top: 0,
          left: 0,
          position: 'fixed',
          borderRadius: 0
        }
      : {};

    return (
      <Transition
        mountOnEnter
        unmountOnExit
        appear
        in={show}
        timeout={500}
        onEnter={this.handleEnter}
        onExited={this.handleExited}
        onEntered={this.handleEntered}
      >
        {(status: string) => (
          <Portal container={getContainerWithFullscreen(container)}>
            <div
              ref={this.modalRef}
              role="dialog"
              className={cx(
                `amis-dialog-widget Modal`,
                {
                  [`Modal--${size}`]: size,
                  'Modal--fullscreen': isFullscreen
                },
                className
              )}
            >
              {overlay ? (
                <div
                  className={cx(
                    `Modal-overlay`,
                    fadeStyles[status],
                    modalMaskClassName
                  )}
                />
              ) : null}
              <DraggableCore
                disabled={!draggable || mobileUI || isFullscreen}
                onStart={this.handleDragStart}
                onDrag={this.handleDrag}
                onStop={this.handleDragStop}
                handle={`.${classPrefix}Modal-header`}
              >
                <div
                  className={cx(
                    `Modal-content`,
                    draggable && !mobileUI && !isFullscreen
                      ? 'Modal-draggable'
                      : '',
                    size === 'custom' ? 'Modal-content-custom' : '',
                    contentClassName,
                    modalClassName,
                    contentFadeStyles[status]
                  )}
                  style={{
                    ...(isFullscreen
                      ? fullscreenStyle
                      : {..._style, ...this.getDragStyle()})
                  }}
                >
                  {status === EXITED ? null : children}
                </div>
              </DraggableCore>
            </div>
          </Portal>
        )}
      </Transition>
    );
  }
}

const FinalModal = themeable(localeable(Modal));

export default FinalModal as typeof FinalModal & {
  Header: typeof Modal.Header;
  Title: typeof Modal.Title;
  Body: typeof Modal.Body;
  Footer: typeof Modal.Footer;
};
