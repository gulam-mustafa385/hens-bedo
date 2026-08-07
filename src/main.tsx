// Ensure window.fetch has both getter and setter to prevent "Cannot set property fetch of #<Window> which has only a getter" errors
(function () {
  try {
    let origFetch = window.fetch;
    const proto = Object.getPrototypeOf(window);
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') || (proto && Object.getOwnPropertyDescriptor(proto, 'fetch'));
    if (!desc || !desc.set) {
      Object.defineProperty(window, 'fetch', {
        get() {
          return origFetch;
        },
        set(val) {
          origFetch = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (e) {
    // Ignore error if non-configurable
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
