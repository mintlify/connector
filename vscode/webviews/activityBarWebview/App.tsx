import axios from 'axios';
import { Listbox } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { vscode } from '../common/message';
import { InfoCircle, CodeSymbol, X } from '../common/svgs';

export type Doc = {
  id: string;
  title: string;
  url: string;
  isAdd?: boolean;
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

export type Link = {
  doc: Doc;
  codes: Code[];
};

const initialDoc: Doc = {
  id: '0',
  title: 'Select documentation',
  url: '',
};

const addDoc: Doc = {
  id: 'add',
  title: '+ New documentation',
  url: '',
  isAdd: true,
};

const initialLink: Link = {
  doc: initialDoc,
  codes: []
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const App = () => {
  const initialState: Link = vscode.getState() || initialLink;
  const [docs, setDocs] = useState([initialDoc]);
  const [selectedDoc, setSelectedDoc] = useState(docs[0]);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    axios.get(`http://localhost:5000/routes/docs?org=mintlify`)
      .then((res) => {
        const { data: { docs } } = res;
        docs.push(addDoc);
        setDocs(docs);
      });
  }, []);

  const handleChange = event => {
    const {name, value} = event.target;
    const { doc } = state;
    const newDoc = { ...doc, [name]: value };
    setState({...state, doc: newDoc });
    vscode.setState({...state, doc: newDoc });
  };

  const handleSubmit = event => {
    event.preventDefault();
    const args = {
      docId: selectedDoc.id,
      title: selectedDoc.title,
      url: state.doc.url,
      org: state.codes[0].org,
      codes: state.codes,
      isNewDoc: selectedDoc.isAdd,
    };
    vscode.postMessage({ command: 'link-submit', args });
    setState(initialLink);
    vscode.setState(initialLink);
  };

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'post-code':
        const code = message.args;
        setState({...state, codes: [code]});
        vscode.setState({...state, codes: [code]});
    }
  });

  const deleteCode = () => {
    setState({...state, codes: []});
    vscode.setState({...state, codes: []});
  };

  const CodeContent = (props: { code: Code }) => {
    return (
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row'>
          <div className='mr-1 flex flex-col justify-center'>
            <CodeSymbol />
          </div>
          {props.code.file}
        </div>
        <div
          className='flex flex-col justify-center cursor-pointer'
          onClick={deleteCode}
        >
          <X />
        </div>
      </div>
    );
  };

  const CodesContent = (props: { codes: Code[] }) => {
    return (props.codes == null || props.codes?.length === 0) ? (
      <div className='italic'>No code selected</div>
    ) : (
      <div>
        {props.codes?.map((code: Code) => <CodeContent code={code} />)}
      </div>
    );
  };

  const style = getComputedStyle(document.body);

  return (
    <div>
      <h1 className="text-lg font-bold">
        Mintlify Connect
      </h1>
      <p className="mt-1">
        Link your code to documentation.{'\n'}
        <a href="https://mintlify.com">Open dashboard</a>
      </p>
      <form className="mt-3" onSubmit={handleSubmit}>
        <label htmlFor="url" className="block">
          Documentation<span className='text-red-500'>*</span>
        </label>
        <div className="mt-1">
        <Listbox value={selectedDoc} onChange={setSelectedDoc}>
          {({ open }) => (
            <>
              <div className="mt-1 relative">
                <Listbox.Button className="relative w-full pl-3 pr-10 py-2 text-left code">
                  <span className="block truncate">{selectedDoc.title}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SelectorIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 z-10 w-full shadow-lg code py-1 overflow-auto">
                    {docs.map((doc) => (
                      <Listbox.Option
                        key={doc.id}
                        className={({ active }) =>
                          classNames(
                            active ? 'text-white active' : '',
                            'cursor-pointer relative py-2 pl-3 pr-9'
                          )
                        }
                        value={doc}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
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
        {
          selectedDoc.isAdd && (
            <input
              type="text"
              name="url"
              id="url"
              className="block mt-2 w-full text-sm"
              placeholder="www.example.com"
              value={state.doc.url}
              onChange={handleChange}
            />
          )
        }
        </div>
        <div className='flex flex-row mt-3'>
          Select Relevant Code<span className='text-red-500'>*</span>
          <div className='ml-1 flex flex-col justify-center' data-tip data-for="registerTip">
            <InfoCircle />
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
        <button type="submit" className="submit">Submit</button>
      </form>
    </div>
  );
};

export default App;
