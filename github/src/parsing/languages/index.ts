import { PLConnect } from '../types';
import TypeScript from './typescript';
import JavaScript from './javascript';
import Python from './python';
import PHP from './php';
import Java from './java';
import Kotlin from './kotlin';
import C from './c';
import CPP from './cpp';
import CSharp from './csharp';
import Dart from './dart';
import Ruby from './ruby';
import Rust from './rust';
import Go from './go';

class UnknownPL implements PLConnect {
  extractComment() {
      return null;
  }
}

export default (languageId: string): PLConnect => {
  switch (languageId) {
    case 'typescript':
    case 'typescriptreact':
      return new TypeScript();
    case 'javascript':
    case 'javascriptreact':
      return new JavaScript();
    case 'python':
      return new Python();
    case 'php':
      return new PHP();
    case 'java':
      return new Java();
    case 'kotlin':
      return new Kotlin();
    case 'c':
      return new C();
    case 'cpp':
      return new CPP();
    case 'csharp':
      return new CSharp();
    case 'dart':
      return new Dart();
    case 'ruby':
      return new Ruby();
    case 'rust':
      return new Rust();
    case 'go':
      return new Go();
    default:
      return new UnknownPL();
  }
}