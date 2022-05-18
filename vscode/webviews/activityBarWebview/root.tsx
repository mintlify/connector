import * as React from 'react';
import { render } from 'react-dom';
import App from './App';
import '../styles/index.css';
import '../styles/vscode.css';

export function main() {
  render(<App/>, document.getElementById('root'));
}