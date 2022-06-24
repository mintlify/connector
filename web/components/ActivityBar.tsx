import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useProfile } from '../context/ProfileContext';
import { API_ENDPOINT } from '../helpers/api';
import { DocTitleIcon } from '../helpers/Icons';
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
        <h1 className="text-sm font-medium">{doc.title}</h1>
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
    <div className="relative pl-6 lg:w-80">
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
                  <TaskItem key={task._id} task={task} onCompleteTask={onCompleteTask} />
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
                  <svg className="h-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">                  
                    <path d="M0 256C0 167.6 71.63 96 160 96H256C273.7 96 288 110.3 288 128C288 145.7 273.7 160 256 160H160C106.1 160 64 202.1 64 256C64 309 106.1 352 160 352H256C273.7 352 288 366.3 288 384C288 401.7 273.7 416 256 416H160C71.63 416 0 344.4 0 256zM480 416H384C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352H480C533 352 576 309 576 256C576 202.1 533 160 480 160H384C366.3 160 352 145.7 352 128C352 110.3 366.3 96 384 96H480C568.4 96 640 167.6 640 256C640 344.4 568.4 416 480 416zM416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H224C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224H416z"/>
                  </svg>
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