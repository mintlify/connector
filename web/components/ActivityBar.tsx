import { XCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useProfile } from '../context/ProfileContext';
import { API_ENDPOINT } from '../helpers/api';
import { ConnectionIcon, DocTitleIcon } from '../helpers/Icons';
import { request } from '../helpers/request';
import { getSubdomain } from '../helpers/user';
import { Doc } from '../pages';
import timeAgo from '../services/timeago';
import TaskItem from './TaskItem';
import Tooltip from './Tooltip';

type DocProfileProps = {
  doc: Doc,
  refresh: () => void;
}

function DocProfile({ doc, refresh }: DocProfileProps) {
  const { profile } = useProfile();
  const [codes, setCodes] = useState(doc.code);
  const [isVSCodeInstalled, setIsVSCodeInstalled] = useState(false);
  const [shouldShowCreateTask, setShouldShowCreateTask] = useState(false);

  const { user } = profile;

  useEffect(() => {
    setCodes(doc.code);
    setShouldShowCreateTask(Boolean(doc.tasks?.length === 0));
  }, [doc]);

  useEffect(() => {
    if (user == null) {
      return;
    }
    axios.get(`${API_ENDPOINT}/routes/user/${user.userId}/install-vscode`)
      .then(({ data }) => {
        if (data.isVSCodeInstalled) {
          setIsVSCodeInstalled(data.isVSCodeInstalled)
        }
      })
  }, [user]);

  if (user == null) {
    return null;
  }

  const onDeleteCode = async (codeId: string) => {
    setCodes(codes.filter(code => code._id !== codeId));
    await axios.delete(`${API_ENDPOINT}/routes/links/${codeId}`, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    });
  };

  const onCreateUpdateRequest = () => {
    request('POST', `/routes/tasks/update/${doc._id}`)
      .then(() => {
        refresh();
      })
    setShouldShowCreateTask(false);
  }

  const vscodeUrl = isVSCodeInstalled ? `vscode://mintlify.connector/prefill-doc?docId=${doc._id}` : 'vscode:extension/mintlify.connector';

  return <div className="pt-6">
    <div className="flex space-x-3">
      <DocTitleIcon method={doc.method} favicon={doc.favicon} />
      <div className="flex-1">
        <h1 className="text-sm font-medium">{doc.title}</h1>
        <h2 className="mt-px text-sm text-gray-500">Last Updated {timeAgo.format(Date.parse(doc.lastUpdatedAt))}</h2>
        <div className="my-2 space-y-2 w-full sm:w-3/4">
          <div className="space-y-1">
            {
              codes.length > 0 && <div className="space-y-1">
              {
                codes.map((code) => (
                  <Tooltip key={code._id} message="View on GitHub" isCentered={false}>
                    <button key={code._id} onClick={() => { window.open(code.url, '_target') }}>
                      <a key={code._id} target="_blank" className="inline-flex items-center px-3 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                        <span className="mr-1">
                          <ConnectionIcon
                            outerSize={4}
                            innerSize={4}
                          />
                        </span>
                        <span className="truncate" style={{maxWidth: '11rem'}}>
                          {code.file}
                        </span>
                        <XCircleIcon className="h-3 w-3 ml-2 hover:text-green-800" onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCode(code._id);
                        }}/>
                      </a>
                    </button>
                  </Tooltip>
                ))
              }
              </div>
            }
          </div>
          <div>
            <Link href={vscodeUrl}>
              <button
                type="button"
                className="inline-flex items-center justify-center py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
              >
                <svg className="h-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">                  
                  <path d="M0 256C0 167.6 71.63 96 160 96H256C273.7 96 288 110.3 288 128C288 145.7 273.7 160 256 160H160C106.1 160 64 202.1 64 256C64 309 106.1 352 160 352H256C273.7 352 288 366.3 288 384C288 401.7 273.7 416 256 416H160C71.63 416 0 344.4 0 256zM480 416H384C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352H480C533 352 576 309 576 256C576 202.1 533 160 480 160H384C366.3 160 352 145.7 352 128C352 110.3 366.3 96 384 96H480C568.4 96 640 167.6 640 256C640 344.4 568.4 416 480 416zM416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H224C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224H416z"/>
                </svg>
                Create Code Connection
              </button>
            </Link>
          </div>
          {
            shouldShowCreateTask && <div>
              <button
              type="button"
              className="inline-flex items-center justify-center py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
              onClick={onCreateUpdateRequest}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 mr-1.5" viewBox="0 0 512 512"><path d="M490.3 40.4C512.2 62.27 512.2 97.73 490.3 119.6L460.3 149.7L362.3 51.72L392.4 21.66C414.3-.2135 449.7-.2135 471.6 21.66L490.3 40.4zM172.4 241.7L339.7 74.34L437.7 172.3L270.3 339.6C264.2 345.8 256.7 350.4 248.4 353.2L159.6 382.8C150.1 385.6 141.5 383.4 135 376.1C128.6 370.5 126.4 361 129.2 352.4L158.8 263.6C161.6 255.3 166.2 247.8 172.4 241.7V241.7zM192 63.1C209.7 63.1 224 78.33 224 95.1C224 113.7 209.7 127.1 192 127.1H96C78.33 127.1 64 142.3 64 159.1V416C64 433.7 78.33 448 96 448H352C369.7 448 384 433.7 384 416V319.1C384 302.3 398.3 287.1 416 287.1C433.7 287.1 448 302.3 448 319.1V416C448 469 405 512 352 512H96C42.98 512 0 469 0 416V159.1C0 106.1 42.98 63.1 96 63.1H192z"/></svg>
              Create Update Request
            </button>
          </div>
          }
          <div>
          </div>
        </div>
      </div>
    </div>
  </div>
}

export type Task = {
  _id: string
  org: string
  doc: Doc
  code: string
  status: 'todo' | 'done'
  type: 'new' | 'update' | 'review'
  url?: string
  createdAt: string
}

type ActivityBarProps = {
  selectedDoc?: Doc;
  refresh: () => void;
  refreshKey: number;
}

export default function ActivityBar({ selectedDoc, refresh, refreshKey }: ActivityBarProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (refreshKey == null) {
      return;
    }
    request('GET', 'routes/tasks')
      .then(({ data }) => {
        const { tasks } = data;
        setTasks(tasks);
      })
  }, [refreshKey]);

  const onCompleteTask = (deletingTask: Task) => {
    setTasks(tasks.filter((task) => task._id !== deletingTask._id));
    request('DELETE', `routes/tasks/${deletingTask._id}`)
      .then(() => {
        refresh();
      })
  }

  const relevantTasks = selectedDoc ? tasks.filter((task) => task.doc._id === selectedDoc._id) : tasks;
  
  return (
    <div className="relative pl-6 lg:w-80">
      {selectedDoc && <DocProfile doc={selectedDoc} refresh={refresh} />}
        <div className="pt-4 pb-2">
          <h2 className="text-sm font-semibold">Update Requests</h2>
        </div>
        <div>
          <div className="py-1 text-sm border-t border-gray-200"></div>
           <div className="text-sm text-gray-600 space-y-4 py-2">
            <div className="flow-root">
              <ul role="list" className="-my-4 divide-y divide-gray-200">
              {
                relevantTasks.map((task) => 
                  <TaskItem key={task._id} task={task} onCompleteTask={onCompleteTask} />
                )
              }
              {
                relevantTasks.length === 0 && <div className="my-4">
                  No update requests 🎉
                </div>
              }
              </ul>
            </div>
            </div>
        </div>
        {
          selectedDoc && <div className="mt-2 py-2">
          <div className="text-sm border-t border-gray-200"></div>
          <article className="prose prose-sm space-y-2 py-4">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={{
            h1: 'h2',
            h2: 'h3',
            h3: 'h4',
            h4: 'h5',
            h5: 'h6',
            img: ({node, ...props}) => <img style={{maxWidth: '100%'}} {...props} />
          }} >
            { selectedDoc.content }
          </ReactMarkdown>
          </article>
        </div>
        }
      </div>
  )
}