import { XCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContex';
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
                <svg className="h-2.5 w-2.5 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M305.8 2.076C314.4 5.932 320 14.52 320 24V64H336C406.7 64 464 121.3 464 192V358.7C492.3 371 512 399.2 512 432C512 476.2 476.2 512 432 512C387.8 512 352 476.2 352 432C352 399.2 371.7 371 400 358.7V192C400 156.7 371.3 128 336 128H320V168C320 177.5 314.4 186.1 305.8 189.9C297.1 193.8 286.1 192.2 279.9 185.8L199.9 113.8C194.9 109.3 192 102.8 192 96C192 89.2 194.9 82.71 199.9 78.16L279.9 6.161C286.1-.1791 297.1-1.779 305.8 2.077V2.076zM432 456C445.3 456 456 445.3 456 432C456 418.7 445.3 408 432 408C418.7 408 408 418.7 408 432C408 445.3 418.7 456 432 456zM112 358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 .0004 80 .0004C124.2 .0004 160 35.82 160 80C160 112.8 140.3 140.1 112 153.3V358.7zM80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56zM80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408z"/></svg>
                Add Review Check
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
            {events.map((event) => (
              <EventItem key={event._id} event={event} />
            ))}
          </ul>
          <div className="py-4 text-sm border-t border-gray-200"></div>
        </div>
      </div>
  )
}