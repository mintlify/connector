import axios from 'axios';
import prependHttp from 'prepend-http';
import { Listbox } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { CheckIcon, LockClosedIcon, SelectorIcon } from '@heroicons/react/solid';
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
};

const initialDoc: Doc = {
  _id: 'initial',
  title: 'Select documentation',
  url: '',
  isDefault: true,
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
  const [signInUrl, setSignInUrl] = useState<string>('');
  const [docs, setDocs] = useState<Doc[]>([initialDoc]);
  const [selectedDoc, setSelectedDoc] = useState<Doc>(initialState?.selectedDoc || initialDoc);
  const [code, setCode] = useState<Code | undefined>(initialState?.code);
  const [displayPage, setDisplayPage] = useState(1);

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'start':
          const API_ENDPOINT = message?.args;
          vscode.setState({ ...initialState, API_ENDPOINT });
          setAPI_ENDPOINT(API_ENDPOINT);
          break;
        case 'display-docs':
          setDocs(message.docs || []);
          setDisplayPage(1);
          break;
        case 'auth':
          const user = message?.args;
          const newDashboardUrl = formatSignInUrl(signInUrl);
          vscode.setState({ ...initialState, user, dashboardUrl: newDashboardUrl });
          setUser(user);
          setDashboardUrl(newDashboardUrl);
          break;
        case 'prefill-doc':
          if (!user?.userId || dashboardUrl == null) {
            return;
          }
          const docId = message?.args;
          axios.get(`${API_ENDPOINT}/docs`, {
            params: {
              userId: user.userId,
              subdomain: getSubdomain(dashboardUrl)
            }
          })
            .then((res) => {
              const { data: { docs: docsResult } } = res;
              const selectedDoc = docs.find(doc => doc._id === docId);
              if (selectedDoc) {
                setSelectedDoc(selectedDoc);
              }
              setDocs(docsResult);
            });
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
  }, [signInUrl, user, dashboardUrl, API_ENDPOINT]);

  useEffect(() => {
    if (!user?.userId || dashboardUrl == null) {
      return;
    }
    try {
      vscode.postMessage({ command: 'get-docs', userId: user.userId, subdomain: getSubdomain(dashboardUrl) });
    } catch (e) {
      vscode.postMessage({ command: 'error', message: 'Could not fetch documents. Please log in again or re-install the extension.' });
    }
  }, [user, dashboardUrl, API_ENDPOINT]);

  const handleSubmit = event => {
    event.preventDefault();
    const args = {
      userId: user.userId,
      subdomain: getSubdomain(dashboardUrl),
      docId: selectedDoc._id,
      title: selectedDoc.title,
      org: code?.org,
      code: code,
    };
    vscode.postMessage({ command: 'link-submit', args });
  };

  const updateSelectedDoc = (doc: Doc) => {
    setSelectedDoc(doc);
    vscode.setState({ ...initialState, selectedDoc: doc });
  };

  const CodeContent = ({ code }: { code: Code }) => {
    let lineRange = code.line ? `:${code.line + 1}` : '';
    if (lineRange && code.endLine && code.endLine !== code.line) {
      lineRange += `-${code.endLine + 1}`;
    }
    const title = `${code.file}${lineRange}`;
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

  const CodesContent = ({ code }: { code?: Code }) => {
    return (code == null) ? (
      <div className='italic'>No code selected</div>
    ) : (
      <div>
        <CodeContent code={code} key={code.sha} />
      </div>
    );
  };

  const onClickSignIn = () => {
    let signInWithProtocol = formatSignInUrl(signInUrl);
    vscode.postMessage({ command: 'login', args: signInWithProtocol });
  };

  const onLogout = () => {
    setUser(undefined);
    vscode.setState({ ...initialState, user: undefined });
  };

  const onScrollOptionsHandler = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;
    if (bottom) {
      setDisplayPage(displayPage + 1);
    }
  };

  const onClickSignUp = () => {
    vscode.postMessage({ command: 'sign-up' });
  };

  const displayDocs = docs.slice(0, displayPage * 50);
  const hasDocSelected = selectedDoc?.isDefault !== true;

  return (
    <div className="space-y-1">
      <h1 className="text-lg font-bold">
        Mintlify
      </h1>
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
        <p className="mt-1">
          Link your code to documentation
        </p>
        <p>
          <a className="cursor-pointer" href={dashboardUrl}>Open Dashboard</a>
        </p>
        <form className="mt-3" onSubmit={handleSubmit}>
          <label htmlFor="url" className="block">
            Documentation<span className='text-red-500'>*</span>
          </label>
          <div className="mt-1">
          <Listbox value={selectedDoc} onChange={updateSelectedDoc}>
            {() => (
              <>
                <div className="mt-1 relative">
                  <Listbox.Button className="relative w-full pl-3 pr-10 py-2 text-left code">
                    <span className="block truncate">{selectedDoc.title}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-60 z-10 w-full shadow-lg code py-1 overflow-auto" onScroll={onScrollOptionsHandler}>
                      {displayDocs.map((doc) => (
                        <Listbox.Option
                          key={doc._id}
                          className={({ active }) =>
                            classNames(
                              active ? 'text-vscode active' : '',
                              'cursor-pointer relative py-2 pl-3 pr-9'
                            )
                          }
                          value={doc}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className='font-normal block truncate'>
                                {doc.title}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : '',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                </div>
              </>
            )}
          </Listbox>
          </div>
          <div className='flex flex-row mt-3'>
            Select Relevant Code<span className='text-red-500'>*</span>
          </div>
          <div className='code'>
            <CodesContent code={code} />
          </div>
          <button
            type="submit"
            className={classNames("submit", hasDocSelected ? 'opacity-100 hover:cursor-pointer' : 'opacity-50 hover:cursor-default')}
            disabled={!hasDocSelected}
          >
            Submit
          </button>
        </form>
      </>
      }
    </div>
  );
};

export default App;
