import React from 'react';
import { AlertTriangle, XCircle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorAlertProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'network' | 'timeout' | 'validation';
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  className?: string;
  suggestions?: string[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Main Error Alert Component
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  onGoHome,
  onGoBack,
  showRetry = true,
  showGoHome = false,
  showGoBack = false,
  className = '',
  suggestions = []
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'network':
        return <Wifi className="w-6 h-6 text-red-600" />;
      case 'timeout':
        return <Clock className="w-6 h-6 text-orange-600" />;
      case 'validation':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'network':
        return 'Network Error';
      case 'timeout':
        return 'Request Timeout';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Error';
    }
  };

  const getDefaultSuggestions = () => {
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ];
      case 'timeout':
        return [
          'The request took too long to complete',
          'Try again with a simpler request',
          'Check your internet connection'
        ];
      case 'validation':
        return [
          'Please check all required fields',
          'Ensure dates and times are valid',
          'Verify location information is correct'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your input and try again',
          'Contact support if the problem persists'
        ];
    }
  };

  const displaySuggestions = suggestions.length > 0 ? suggestions : getDefaultSuggestions();

  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getIcon()}
          <span>{title || getDefaultTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          
          {displaySuggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Suggestions:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {displaySuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            {showRetry && onRetry && (
              <Button onClick={onRetry} variant="default" className="flex items-center space-x-2">
                <RefreshCw size={16} />
                <span>Try Again</span>
              </Button>
            )}
            
            {showGoBack && onGoBack && (
              <Button onClick={onGoBack} variant="outline" className="flex items-center space-x-2">
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </Button>
            )}
            
            {showGoHome && onGoHome && (
              <Button onClick={onGoHome} variant="outline" className="flex items-center space-x-2">
                <Home size={16} />
                <span>Go Home</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Inline Error Alert (smaller, for forms)
export const InlineErrorAlert: React.FC<{
  message: string;
  type?: 'error' | 'warning';
  className?: string;
}> = ({ message, type = 'error', className = '' }) => {
  const bgColor = type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  const textColor = type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200';
  const iconColor = type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className={`p-3 rounded-lg border ${bgColor} ${className}`}>
      <div className="flex items-start space-x-2">
        {type === 'warning' ? (
          <AlertTriangle className={`w-4 h-4 mt-0.5 ${iconColor}`} />
        ) : (
          <XCircle className={`w-4 h-4 mt-0.5 ${iconColor}`} />
        )}
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

// Full Page Error Component
export const FullPageError: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  type?: 'error' | 'network' | 'timeout';
}> = ({ 
  title = 'Something went wrong',
  message,
  onRetry,
  onGoHome,
  type = 'error'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorAlert
          title={title}
          message={message}
          type={type}
          onRetry={onRetry}
          onGoHome={onGoHome}
          showRetry={!!onRetry}
          showGoHome={!!onGoHome}
        />
      </div>
    </div>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <FullPageError
          title="Application Error"
          message="An unexpected error occurred. Please try refreshing the page."
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/'}
          type="error"
        />
      );
    }

    return this.props.children;
  }
}

// Chart-specific Error Component
export const ChartError: React.FC<{
  message: string;
  onRetry?: () => void;
  onEditDetails?: () => void;
}> = ({ message, onRetry, onEditDetails }) => {
  return (
    <>
      <ErrorAlert
        title="Chart Generation Failed"
        message={message}
        type="error"
        onRetry={onRetry}
        showRetry={!!onRetry}
        suggestions={[
          'Verify birth date and time are correct',
          'Check that the location is properly selected',
          'Ensure all required fields are filled',
          'Try a different time if birth time is uncertain'
        ]}
        className="mx-4 my-6"
      />
      {onEditDetails && (
        <div className="mt-4 mx-4">
          <Button onClick={onEditDetails} variant="outline" className="w-full">
            Edit Birth Details
          </Button>
        </div>
      )}
    </>
  );
};

// Network Error Component
export const NetworkError: React.FC<{
  onRetry?: () => void;
  message?: string;
}> = ({ 
  onRetry, 
  message = "Unable to connect to the server. Please check your internet connection and try again."
}) => {
  return (
    <ErrorAlert
      title="Connection Error"
      message={message}
      type="network"
      onRetry={onRetry}
      showRetry={!!onRetry}
      suggestions={[
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again',
        'Contact support if the problem persists'
      ]}
    />
  );
};

// Validation Error Component
export const ValidationError: React.FC<{
  errors: string[];
  onDismiss?: () => void;
}> = ({ errors, onDismiss }) => {
  return (
    <InlineErrorAlert
      message={errors.length === 1 ? errors[0] : `${errors.length} validation errors found`}
      type="warning"
    />
  );
};
