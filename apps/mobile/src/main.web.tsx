import { AppRegistry } from 'react-native';
import { App } from './App';

// Intercept React Native Web's ModalPortal so all modals attach inside .phone-frame
if (typeof document !== 'undefined') {
  const originalAppendChild = document.body.appendChild.bind(document.body);
  const originalRemoveChild = document.body.removeChild.bind(document.body);
  const originalInsertBefore = document.body.insertBefore.bind(document.body);

  const getPortalTarget = () => {
    return document.getElementById('phone-modal-root') || document.querySelector('.phone-frame');
  };

  document.body.appendChild = function <T extends Node>(node: T): T {
    const portalTarget = getPortalTarget();
    if (
      portalTarget &&
      node instanceof HTMLElement &&
      node.tagName === 'DIV' &&
      !node.classList.contains('phone-frame')
    ) {
      return portalTarget.appendChild(node) as T;
    }
    return originalAppendChild(node);
  };

  document.body.removeChild = function <T extends Node>(node: T): T {
    const portalTarget = getPortalTarget();
    const parent = node instanceof HTMLElement ? node.parentElement : null;
    if (
      portalTarget &&
      parent &&
      (parent === portalTarget || parent === document.querySelector('.phone-frame'))
    ) {
      return parent.removeChild(node) as T;
    }
    return originalRemoveChild(node);
  };

  document.body.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
    const portalTarget = getPortalTarget();
    if (
      portalTarget &&
      node instanceof HTMLElement &&
      node.tagName === 'DIV' &&
      !node.classList.contains('phone-frame')
    ) {
      return portalTarget.insertBefore(node, child) as T;
    }
    return originalInsertBefore(node, child);
  };
}

// Daftarkan komponen utama menggunakan AppRegistry react-native-web
AppRegistry.registerComponent('App', () => App);

const rootTag = document.getElementById('root');
if (rootTag) {
  AppRegistry.runApplication('App', {
    initialProps: {},
    rootTag,
  });
}

