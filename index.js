import React, { Component } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

const WEBVIEW_HEIGHT = 200;

class AutoHeightWebview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: WEBVIEW_HEIGHT
    };
  }


  _autoHeightScript = `(function() {
  try {
    const observer = new MutationObserver(() => {
      const _height = {
        height: document.body.scrollHeight
      }
      window.ReactNativeWebView.postMessage(JSON.stringify(_height));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (err) {
    alert(err);
  }
})();`;

  _injectedJavaScript = `
${this.props.injectedJavaScript}
${ this.props.autoHeight ? this._autoHeightScript : '' }
`;


  render() {
    const { autoHeight, injectedJavaScript, onMessage, webviewRef, containerStyle, ...rest } = this.props;
    const mergedStyle = Array.isArray(containerStyle)
      ? [{ height: this.state.height }, ...containerStyle]
      : [{ height: this.state.height }, containerStyle];
    return (
      <View style={mergedStyle}>
        <WebView
          ref={webviewRef}
          onMessage={(event) => {
            if (autoHeight) {
              const { height } = JSON.parse(event.nativeEvent.data);
              this.setState({ height });
            }
            this.props.onMessage(event);
          }}
          injectedJavaScript={this._injectedJavaScript}
          { ...rest }
        />
      </View>
    );
  }
}

AutoHeightWebview.propTypes = {
  injectedJavaScript: PropTypes.string,
  autoHeight: PropTypes.bool,
  onMessage: PropTypes.func,
  webviewRef: PropTypes.any,
  containerStyle: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ])
};

AutoHeightWebview.defaultProps = {
  injectedJavaScript: '',
  autoHeight: true,
  onMessage: () => {},
  webviewRef: undefined,
  containerStyle: undefined
};

export default AutoHeightWebview;
