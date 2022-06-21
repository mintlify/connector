import { XCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { API_ENDPOINT } from '../helpers/api';
import { ConnectionIcon, DocTitleIcon } from '../helpers/Icons';
import { getSubdomain } from '../helpers/user';
import { Doc } from '../pages';
import timeAgo from '../services/timeago';
import EventItem, { Event } from './Event';
import Tooltip from './Tooltip';

type DocProfileProps = {
  doc: Doc,
}

function DocProfile({ doc }: DocProfileProps) {
  const { profile } = useProfile();
  const [codes, setCodes] = useState(doc.code);
  const [isVSCodeInstalled, setIsVSCodeInstalled] = useState(false);

  const { user } = profile;

  useEffect(() => {
    setCodes(doc.code);
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
                  <path d="M414.8 40.79L286.8 488.8C281.9 505.8 264.2 515.6 247.2 510.8C230.2 505.9 220.4 488.2 225.2 471.2L353.2 23.21C358.1 6.216 375.8-3.624 392.8 1.232C409.8 6.087 419.6 23.8 414.8 40.79H414.8zM518.6 121.4L630.6 233.4C643.1 245.9 643.1 266.1 630.6 278.6L518.6 390.6C506.1 403.1 485.9 403.1 473.4 390.6C460.9 378.1 460.9 357.9 473.4 345.4L562.7 256L473.4 166.6C460.9 154.1 460.9 133.9 473.4 121.4C485.9 108.9 506.1 108.9 518.6 121.4V121.4zM166.6 166.6L77.25 256L166.6 345.4C179.1 357.9 179.1 378.1 166.6 390.6C154.1 403.1 133.9 403.1 121.4 390.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4L121.4 121.4C133.9 108.9 154.1 108.9 166.6 121.4C179.1 133.9 179.1 154.1 166.6 166.6V166.6z"/>
                </svg>
                Create Code Connection
              </button>
            </Link>
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  </div>
}

type ActivityBarProps = {
  events: Event[];
  selectedDoc?: Doc;
}

export default function ActivityBar({ events, selectedDoc }: ActivityBarProps) {
  return (
    <div className="relative pl-6 lg:w-80">
      {selectedDoc && <DocProfile doc={selectedDoc} />}
        <div className="pt-4 pb-2">
          <h2 className="text-sm font-semibold">Activity</h2>
        </div>
        <div>
          <ul role="list" className="divide-y divide-gray-200">
            {events.length > 0 && events.map((event) => (
              <EventItem key={event._id} event={event} />
            ))}
          </ul>
          <div className="py-1 text-sm border-t border-gray-200"></div>
          {
            events.length === 0 && <div className="text-sm text-gray-500">
              No activities yet
            </div>
          }
        </div>
      </div>
  )
}