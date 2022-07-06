import prependHttp from 'prepend-http';
import React, { useEffect, useState } from 'react';
import { DocumentTextIcon, LockClosedIcon, XIcon } from '@heroicons/react/solid';
import { vscode } from '../common/message';
import { CodeSymbolIcon, CodeFileIcon } from '../common/svgs';

export type Doc = {
  _id: string;
  title: string;
  url: string;
  isDefault?: boolean;
};

export type Code = {
  url?: string;
  sha: string;
  provider: string;
  file: string;
  org: string;
  repo: string;
  type: string;
  branch?: string;
  line?: number;
  endLine?: number;
};

type State = {
  user?: any,
  dashboardUrl: string;
  API_ENDPOINT: string;
  selectedDoc?: Doc;
  code?: Code;
  query: string;
  isURL: boolean;
};

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const formatSignInUrl = (signInUrl: string) => {
  let signInWithProtocol = prependHttp(signInUrl);
  const lastCharacter = signInWithProtocol[signInWithProtocol.length - 1];
  if (lastCharacter === '/') {
    signInWithProtocol = signInWithProtocol.slice(0, -1);
  }

  return signInWithProtocol;
};

export const getSubdomain = (url: string) => {
  const host = url.replace(/^https?:\/\//, '');
  return host.split('.')[0];
};

const App = () => {
  const initialState: State = vscode.getState();
  const [user, setUser] = useState<any>(initialState?.user);
  const [dashboardUrl, setDashboardUrl] = useState<string>(initialState?.dashboardUrl);
  const [API_ENDPOINT, setAPI_ENDPOINT] = useState<string>(initialState?.API_ENDPOINT);
  const [signInUrl, setSignInUrl] = useState<string>();
  const [selectedDoc, setSelectedDoc] = useState<Doc | undefined>(initialState?.selectedDoc);
  const [code, setCode] = useState<Code | undefined>(initialState?.code);
  const [query, setQuery] = useState<string>(initialState?.query || '');
  const [inputError, setInputError] = useState<string>();

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'start':
          const API_ENDPOINT = message?.args;
          vscode.setState({ ...initialState, API_ENDPOINT });
          setAPI_ENDPOINT(API_ENDPOINT);
          break;
        case 'auth':
          const user = message?.args;
          if (!signInUrl) {
            return;
          };
          const newDashboardUrl = formatSignInUrl(signInUrl);
          vscode.setState({ ...initialState, user, dashboardUrl: newDashboardUrl });
          setUser(user);
          setDashboardUrl(newDashboardUrl);
          break;
        case 'prefill-doc':
          const doc = message?.args;
          setSelectedDoc(doc);
          break;
        case 'post-code':
          const code = message?.args;
          vscode.setState({ ...initialState, code });
          setCode(code);
          break;
        case 'logout':
          onLogout();
          break;
      }
    });

    // Load code on everytime it opens
    vscode.postMessage({ command: 'refresh-code' });

  }, [signInUrl, user, dashboardUrl, API_ENDPOINT]);

  const checkIsURL = (str: string) => {
    return /(([a-z]+:\/\/)?(([a-z0-9-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|dev|site))(:[0-9]{1,5})?(\/[a-z0-9_\-.~]+)*(\/([a-z0-9_\-.]*)(\?[a-z0-9+_\-.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi.test(str.trim());
  };

  const handleSubmit = event => {
    event.preventDefault();
    let args;
    if (selectedDoc) {
      args = {
        userId: user.userId,
        subdomain: getSubdomain(dashboardUrl),
        docId: selectedDoc?._id,
        title: selectedDoc?.title,
        org: code?.org,
        code: code,
        url: selectedDoc?.url
      };
    } else {
      if (!checkIsURL(query)) {
        setInputError('Invalid URL');
        return;
      }
      args = {
        userId: user.userId,
        subdomain: getSubdomain(dashboardUrl),
        docId: 'create',
        org: code?.org,
        code: code,
        url: query
      };
    }
    vscode.postMessage({ command: 'link-submit', args });
  };

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    setInputError(undefined);
  };

  const CodeContent = ({ code }: { code: Code }) => {
    let lineRange = code.line ? `:${code.line + 1}` : '';
    if (lineRange && code.endLine && code.endLine !== code.line) {
      lineRange += `-${code.endLine + 1}`;
    }
    const filename = code.file.replace(/^.*[\\\/]/, '');
    const title = `${filename}${lineRange}`;
    return (
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row truncate'>
          <div className='mr-1 flex flex-col justify-center'>
            {
              lineRange ? <CodeSymbolIcon /> : <CodeFileIcon />
            }
          </div>
          {title}
        </div>
      </div>
    );
  };

  const onClickSignIn = () => {
    if (!signInUrl) {
      return;
    }
    let signInWithProtocol = formatSignInUrl(signInUrl);
    const subdomain = getSubdomain(signInUrl);
    vscode.postMessage({ command: 'login', args: {signInWithProtocol, subdomain} });
  };

  const clearSelectedDoc = () => {
    setSelectedDoc(undefined);
    vscode.setState({ ...initialState, selectedDoc: undefined });
  };

  const onLogout = () => {
    setUser(undefined);
    vscode.setState({ ...initialState, user: undefined });
  };

  const onClickSignUp = () => {
    vscode.postMessage({ command: 'sign-up' });
  };

  const hasDocSelected = !selectedDoc?.isDefault;

  return (
    <div className="space-y-1">
      {
        user == null && <>
         <button
          type="submit"
          className={classNames("flex items-center justify-center submit mt-2 opacity-100 hover:cursor-pointer")}
          onClick={onClickSignUp}
        >
          Create an account
        </button>
        <p className="text-center">
          OR
        </p>
        <p className="mt-1 font-medium">Dashboard URL</p>
        <input
          className="text-sm"
          type="text"
          value={signInUrl}
          onChange={(e) => setSignInUrl(e.target.value)}
          placeholder="name.mintlify.com"
        />
        <button
          type="submit"
          className={classNames("flex items-center justify-center submit mt-2", !signInUrl ? 'opacity-50 hover:cursor-default' : 'opacity-100 hover:cursor-pointer')}
          onClick={onClickSignIn}
          disabled={!signInUrl}
        >
          <LockClosedIcon className="mr-1 h-4 w-4" aria-hidden="true" />
          Sign in with Mintlify
        </button>
        </>
      }
      {
        user != null && <>
        <form onSubmit={handleSubmit}>
          <label htmlFor="url" className="block">
            Documentation<span className='text-red-500'>*</span>
          </label>
          <div className="mt-1">
            {
              selectedDoc == null && <input
                type="text"
                name="url"
                id="url"
                className="block w-full text-sm"
                placeholder="www.example.com"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
              />
            }
            {
              selectedDoc != null && <div className="block w-full text-sm code">
                <div className="flex items-center space-x-1">
                  <div>
                    <DocumentTextIcon className="h-4" />
                  </div>
                  <div className="flex-1">
                    {selectedDoc.title}
                  </div>
                  <div className="cursor-pointer" onClick={clearSelectedDoc}>
                    <XIcon className="h-4" />
                  </div>
                </div>
              </div>
            }
            {inputError && (
              <span className="text-red-500">{inputError}</span>
            )}
          </div>
          <div className='flex flex-row mt-3'>
            Select Relevant Code<span className='text-red-500'>*</span>
          </div>
          <div className='code'>
            { code == null ? <div className='italic'>No code selected</div> : <CodeContent code={code} key={code.sha} /> }
          </div>
          <button
            type="submit"
            className={classNames("submit", hasDocSelected ? 'opacity-100 hover:cursor-pointer' : 'opacity-50 hover:cursor-default')}
            disabled={!hasDocSelected}
          >
            Submit
          </button>
        </form>
        <div className="mt-1">
          Have questions? Join our <a href="https://discord.gg/6W7GuYuxra">community</a>
        </div>
      </>
      }
    </div>
  );
};

export default App;
