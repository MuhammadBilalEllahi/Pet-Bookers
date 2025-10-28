import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useTheme} from '../../theme/ThemeContext';

const FastImageWithFallback = ({
  source,
  style,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  fallbackSource,
  maxRetries = 2,
  retryDelay = 1000,
  showDebugLogs = false,
  ...props
}) => {
  const {theme, isDark} = useTheme();
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    if (showDebugLogs) {
      // console.log('🟡 FastImage loading started:', source?.uri);
    }
    onLoadStart?.();
  }, [source?.uri, onLoadStart, showDebugLogs]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (showDebugLogs) {
      // console.log('✅ FastImage loaded successfully:', source?.uri);
    }
    onLoad?.();
  }, [source?.uri, onLoad, showDebugLogs]);

  const handleError = useCallback(
    error => {
      setIsLoading(false);

      if (showDebugLogs) {
        // console.log('❌ FastImage load error:', source?.uri);
        // console.log('Error details:', error);

        // Extract HTTP status code if available
        const message = error.nativeEvent?.error || '';
        const match = message.match(/status code:\s*(\d+)/);
        if (match) {
          // console.log('HTTP Status Code:', match[1]);
        }
      }

      // Retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setHasError(false);
          setIsLoading(true);
        }, retryDelay);
      } else {
        setHasError(true);
      }

      onError?.(error);
    },
    [source?.uri, retryCount, maxRetries, retryDelay, onError, showDebugLogs],
  );

  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Referer: 'https://petbookers.com.pk/',
    Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
  };

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (showDebugLogs) {
      // console.log('⚪ FastImage load ended:', source?.uri);
    }
    onLoadEnd?.();
  }, [source?.uri, onLoadEnd, showDebugLogs]);

  // Determine which source to use
  const imageSource = hasError && fallbackSource ? fallbackSource : source;

  // If no source is available, show a placeholder
  if (!imageSource?.uri) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-secondary']
              : theme['color-basic-200'],
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
        {...props}
      />
    );
  }

  return (
    <FastImage
      source={imageSource}
      headers={headers}
      style={[
        style,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-secondary']
            : theme['color-basic-200'],
        },
      ]}
      resizeMode={resizeMode}
      priority={priority}
      onLoadStart={handleLoadStart}
      onLoad={handleLoad}
      onError={handleError}
      onLoadEnd={handleLoadEnd}
      {...props}
    />
  );
};

export default FastImageWithFallback;
