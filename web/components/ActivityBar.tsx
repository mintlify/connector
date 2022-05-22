import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../helpers/api';
import { getAutomationTypeIcon, getConnectionIcon } from '../helpers/Icons';
import { Doc, UserSession } from '../pages';
import timeAgo from '../services/timeago';
import EventItem, { Event } from './Event';
import Tooltip from './Tooltip';

function DocProfile({ doc, userSession }: { doc: Doc, userSession: UserSession }) {
  const [codes, setCodes] = useState(doc.code);
  const [automations, setAutomations] = useState(doc.automations);
  const [isVSCodeInstalled, setIsVSCodeInstalled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCodes(doc.code);
    setAutomations(doc.automations);
  }, [doc]);

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/routes/user/${userSession.user.userId}/install-vscode`)
      .then(({ data }) => {
        if (data.isVSCodeInstalled) {
          setIsVSCodeInstalled(data.isVSCodeInstalled)
        }
      })
  }, [userSession.user.userId]);

  const onDeleteCode = async (codeId: string) => {
    setCodes(codes.filter(code => code._id !== codeId));
    await axios.delete(`${API_ENDPOINT}/routes/links/${codeId}?userId=${userSession.user.userId}`);
  };

  const onDeleteAutomation = async (automationId: string) => {
    setAutomations(automations.filter(automation => automation._id !== automationId));
    await axios.delete(`${API_ENDPOINT}/routes/automations/${automationId}?userId=${userSession.user.userId}`);
  }

  const vscodeUrl = isVSCodeInstalled ? `vscode://mintlify.connector/prefill-doc?docId=${doc._id}` : 'vscode:extension/mintlify.connector';

  return <div className="pt-6">
    <div className="flex space-x-3">
      {
        doc.favicon ? <img
        className="h-5 w-5 rounded-sm"
        src={doc.favicon}
        alt={doc.title}
      /> : <DocumentTextIcon className="h-5 w-5 text-gray-600" />
      }
      <div className="flex-1">
        <h1 className="text-sm font-medium">{doc.title}</h1>
        <h2 className="mt-px text-sm text-gray-500">Added {timeAgo.format(Date.parse(doc.createdAt))}</h2>
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
                          {getConnectionIcon(4, 4)}
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
            {
              automations.length > 0 && <div className="space-y-1">
                {
                  automations.map((automation) => (
                    <Tooltip key={automation._id} message="Go to automations" isCentered={false}>
                      <button key={automation._id} onClick={() => { router.push('/automations') }}>
                        <a key={automation._id} className="inline-flex items-center px-3 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                          <span className="mr-1">
                            {getAutomationTypeIcon(automation.type, 4, 4)}
                          </span>
                          <span className="truncate" style={{maxWidth: '11rem'}}>
                            {automation.name}
                          </span>
                          <XCircleIcon className="h-3 w-3 ml-2 hover:text-amber-800" onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAutomation(automation._id);
                          }} />
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
                Connect Code
                <Tooltip message="Get notified to update docs when code changes"> 
                  <InformationCircleIcon className="ml-1 h-3 w-3 text-gray-400" />
                </Tooltip>
              </button>
            </Link>
          </div>
          <div>
          <button
            type="button"
            className="inline-flex items-center justify-center py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
          >
            Add Automation
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
}

type ActivityBarProps = {
  events: Event[];
  userSession: UserSession;
  selectedDoc?: Doc;
}

export default function ActivityBar({ events, userSession, selectedDoc }: ActivityBarProps) {
  return (
    <div className="relative pl-6 lg:w-80">
      {selectedDoc && <DocProfile doc={selectedDoc} userSession={userSession} />}
        <div className="pt-6 pb-2">
          <h2 className="text-sm font-semibold">Activity</h2>
        </div>
        <div>
          <ul role="list" className="divide-y divide-gray-200">
            {events.map((event) => (
              <EventItem key={event._id} event={event} />
            ))}
          </ul>
          <div className="py-4 text-sm border-t border-gray-200"></div>
        </div>
      </div>
  )
}