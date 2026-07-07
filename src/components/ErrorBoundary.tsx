import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - 错误边界组件
 * 捕获子组件渲染过程中的JS错误，防止整个页面白屏
 * 显示友好的错误提示和恢复按钮
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gw-text mb-2">页面渲染异常</h2>
          <p className="text-sm text-gw-muted mb-6 max-w-md">
            {this.state.error?.message || '组件渲染过程中发生了未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-lg text-sm bg-gw-cyan/10 text-gw-cyan hover:bg-gw-cyan/20 border border-gw-cyan/20 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
