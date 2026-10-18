import React from 'react';

export default function codegenNativeComponent(componentName: string, _options?: any) {
  const DummyComponent: React.FC<any> = (props) => {
    return React.createElement('div', { 'data-native-component': componentName, ...props });
  };
  DummyComponent.displayName = `Codegen(${componentName})`;
  return DummyComponent;
}
