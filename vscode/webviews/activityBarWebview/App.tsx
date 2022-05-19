import axios from 'axios';
import { Listbox } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { CheckIcon, LockClosedIcon, SelectorIcon } from '@heroicons/react/solid';
import { vscode } from '../common/message';
import { InfoCircleIcon, CodeSymbolIcon, XIcon } from '../common/svgs';

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

export type State = {
  user?: any,
  selectedDoc: Doc;
  codes: Code[];
  API_ENDPOINT: string;
  docs: Doc[];
};

const initialDoc: Doc = {
  _id: 'initial',
  title: 'Select documentation',
  url: '',
  isDefault: true,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const App = () => {
  const initialState: State = vscode.getState() || {
    docs: [initialDoc],
    selectedDoc: initialDoc,
    codes: [],
    API_ENDPOINT: 'https://connect.mintlify.com/routes'
  };
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!state.user?.userId) {
      return;
    }
    axios.get(`${state.API_ENDPOINT}/docs?userId=${state.user.userId}`)
    .then((res) => {
      const { data: { docs } } = res;
      updateState({...state, docs});
    });
  }, []);

  const updateState = (state: State) => {
    setState(state);
    vscode.setState(state);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const args = {
      userId: state.user.userId,
      docId: state.selectedDoc._id,
      title: state.selectedDoc.title,
      org: state.codes[0].org,
      codes: state.codes,
    };
    vscode.postMessage({ command: 'link-submit', args });
    updateState({...initialState, user: state.user, docs: state.docs });
  };

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'start':
        const API_ENDPOINT = message.args;
        updateState({...state, API_ENDPOINT});
        break;
      case 'auth':
        const user = message.args;
        updateState({...state, user});
        break;
      case 'post-code':
        const code = message.args;
        updateState({...state, codes: [code]});
        break;
      case 'logout':
        onLogout();
        break;
    }
  });

  const deleteCode = () => {
    updateState({...state, codes: []});
  };

  const updateSelectedDoc = (doc: Doc) => {
    updateState({...state, selectedDoc: doc});
  };

  const CodeContent = (props: { code: Code }) => {
    return (
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row'>
          <div className='mr-1 flex flex-col justify-center'>
            <CodeSymbolIcon />
          </div>
          {props.code.file}
        </div>
        <div
          className='flex flex-col justify-center cursor-pointer'
          onClick={deleteCode}
        >
          <XIcon />
        </div>
      </div>
    );
  };

  const CodesContent = (props: { codes: Code[] }) => {
    return (props.codes == null || props.codes?.length === 0) ? (
      <div className='italic'>No code selected</div>
    ) : (
      <div>
        {props.codes?.map((code: Code) => <CodeContent code={code} key={code.sha} />)}
      </div>
    );
  };

  const onClickSignIn = () => {
    vscode.postMessage({ command: 'login' });
  };

  const onLogout = () => {
    updateState({...initialState, user: undefined});
  };

  const style = getComputedStyle(document.body);

  const hasDocSelected = state?.selectedDoc?.isDefault !== true;

  return (
    <div className="space-y-1">
      <h1 className="text-lg font-bold">
        Mintlify
      </h1>
      {
        state.user == null && <>
        <p className="mt-1">
          Sign in to your account to continue
        </p>
        <button
          type="submit"
          className="flex items-center justify-center submit mt-2"
          onClick={onClickSignIn}
        >
          <LockClosedIcon className="mr-1 h-4 w-4" aria-hidden="true" />
          Sign in with Mintlify
        </button>
        </>
      }
      {
        state.user != null && <>
        <p className="mt-1">
          Link your code to documentation
        </p>
        <p>
          <a className="cursor-pointer" href="https://mintlify.com">Open Dashboard</a>
        </p>
        <form className="mt-3" onSubmit={handleSubmit}>
          <label htmlFor="url" className="block">
            Documentation<span className='text-red-500'>*</span>
          </label>
          <div className="mt-1">
          <Listbox value={state.selectedDoc} onChange={updateSelectedDoc}>
            {() => (
              <>
                <div className="mt-1 relative">
                  <Listbox.Button className="relative w-full pl-3 pr-10 py-2 text-left code">
                    <span className="block truncate">{state.selectedDoc.title}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 z-10 w-full shadow-lg code py-1 overflow-auto">
                      {state.docs.map((doc) => (
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
            <div className='ml-1 flex flex-col justify-center' data-tip data-for="registerTip">
              <InfoCircleIcon />
            </div>
            <ReactTooltip
              id="registerTip"
              place="bottom"
              effect="solid"
              className='tool-tip shadow-sm'
              arrowColor={style.getPropertyValue('--vscode-editor-background')}
            >
              <div className='text-left'>
                <div className='font-bold'>Code Snippets</div>
                <p>
                  1. Highlight code in the editor <br/>
                  2. Right click <br/>
                  3. Select “Link code to doc” <br/>
                </p>
                <div className='font-bold mt-1'>Folder/File</div>
                <p>
                  1. Right click on a folder or file in the explorer <br/>
                  2. Select “Link folder/file to doc”
                </p>
              </div>
            </ReactTooltip>
          </div>
          <div className='code'>
            <CodesContent codes={state.codes} />
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
