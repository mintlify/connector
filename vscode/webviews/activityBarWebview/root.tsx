import * as React from 'react';
import{ createRoot } from 'react-dom/client';
import App from './App';
import '../styles/index.css';
import '../styles/vscode.css';

export function main() {
  const rootElement = document.getElementById('root') as HTMLElement;
  const root = createRoot(rootElement);
  root.render(<React.StrictMode>
    <App />
  </React.StrictMode>);
}