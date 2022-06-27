import { ExternalLinkIcon } from '@heroicons/react/outline';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useProfile } from '../context/ProfileContext';
import { API_ENDPOINT } from '../helpers/api';
import { ConnectIcon, DocTitleIcon } from '../helpers/Icons';
import { request } from '../helpers/request';
import { getSubdomain } from '../helpers/user';
import { Code, Doc } from '../pages';
import timeAgo from '../services/timeago';
import CodeItem from './CodeItem';
import TaskItem from './TaskItem';

type DocProfileProps = {
  doc: Doc,
}

function DocProfile({ doc }: DocProfileProps) {
  return <div className="pt-6">
    <div className="flex space-x-3">
      <DocTitleIcon method={doc.method} favicon={doc.favicon} />
      <div className="flex-1">
        <Link href={doc.url}>
          <a className="text-sm font-medium flex items-center cursor-pointer decoration-gray-300 hover:underline" target="_blank">
            {doc.title}
            <ExternalLinkIcon className="h-4 text-gray-500 ml-1" />
          </a>
        </Link>
        <h2 className="mt-px text-sm text-gray-500">Last Updated {timeAgo.format(Date.parse(doc.lastUpdatedAt))}</h2>
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
  const { profile } = useProfile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [shouldShowCreateTask, setShouldShowCreateTask] = useState(false);
  
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

  useEffect(() => {
    if (selectedDoc == null) {
      return;
    }
    setCodes(selectedDoc.code);
    setShouldShowCreateTask(Boolean(selectedDoc.tasks?.length === 0));
  }, [selectedDoc]);

  const { user } = profile;

  if (user == null) {
    return null;
  }

  const onCompleteTask = (deletingTask: Task) => {
    if (deletingTask.type === 'review' && deletingTask.url) {
      window.open(deletingTask.url, '_blank');
      return;
    }
    setTasks(tasks.filter((task) => task._id !== deletingTask._id));
    request('DELETE', `routes/tasks/${deletingTask._id}`)
      .then(() => {
        refresh();
      })
  }

  const onCreateUpdateRequest = () => {
    request('POST', `/routes/tasks/update/${selectedDoc?._id}`)
      .then(() => {
        refresh();
      })
    setShouldShowCreateTask(false);
  }

  const onDeleteCode = async (code: Code) => {
    const codeId = code._id;
    setCodes(codes.filter(code => code._id !== codeId));
    await axios.delete(`${API_ENDPOINT}/routes/links/${codeId}`, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    });
  };

  const vscodeUrl = `vscode://mintlify.connector/prefill-doc?docId=${selectedDoc?._id}`;
  const relevantTasks = selectedDoc ? tasks.filter((task) => task.doc._id === selectedDoc._id) : tasks;
  
  return (
    <div className="relative pl-6 lg:w-80 text-gray-700">
      {selectedDoc && <DocProfile doc={selectedDoc} />}
        <div className="pt-4 pb-2 flex items-center">
          <h2 className="text-sm font-semibold flex-1">Update Requests</h2>
        </div>
        <div>
          <div className="py-0.5 text-sm border-t border-gray-200"></div>
           <div className="text-sm text-gray-600 space-y-4 py-2">
            <div className="flow-root">
              <ul role="list" className="-my-4 divide-y divide-gray-200">
              {
                relevantTasks.map((task) => 
                  <TaskItem key={task._id} task={task} onCompleteTask={onCompleteTask} selectedDoc={selectedDoc} />
                )
              }
              </ul>
              {
                relevantTasks.length === 0 && !selectedDoc && <div className="my-4">
                No update requests 🎉
              </div>
              }
              {
                selectedDoc && shouldShowCreateTask && <button
                type="button"
                className="mt-4 inline-flex items-center justify-center py-1 px-3 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onCreateUpdateRequest}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 mr-1.5" viewBox="0 0 512 512">
                  <path d="M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z"/>
                </svg>
                Create new request
              </button>
              }
            </div>
            </div>
        </div>
        {
          selectedDoc && <>
          <div className="mt-2 pt-4 pb-2 flex items-center">
          <h2 className="text-sm font-semibold flex-1">Code Connections</h2>
        </div>
        <div>
          <div className="py-0.5 text-sm border-t border-gray-200"></div>
           <div className="text-sm text-gray-600 space-y-4 py-2">
            <div className="flow-root">
              <ul role="list" className="-my-4 divide-y divide-gray-200">
              {
                codes.map((code) => 
                  <CodeItem key={code._id} code={code} onDeleteCode={onDeleteCode} />
                )
              }
              </ul>
              {
                codes.length === 0 && !selectedDoc && <div className="my-4">
                No code connections
              </div>
              }
                <Link href={vscodeUrl}>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center py-1 px-3 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ConnectIcon className="h-3 mr-1.5" />
                  Create new connection
                </button>
              </Link>
            </div>
            </div>
        </div>
          </>
        }
        {
          selectedDoc && <div className="py-2">
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