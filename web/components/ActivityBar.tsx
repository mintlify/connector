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
                  <path d="M0 256C0 167.6 71.63 96 160 96H256C273.7 96 288 110.3 288 128C288 145.7 273.7 160 256 160H160C106.1 160 64 202.1 64 256C64 309 106.1 352 160 352H256C273.7 352 288 366.3 288 384C288 401.7 273.7 416 256 416H160C71.63 416 0 344.4 0 256zM480 416H384C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352H480C533 352 576 309 576 256C576 202.1 533 160 480 160H384C366.3 160 352 145.7 352 128C352 110.3 366.3 96 384 96H480C568.4 96 640 167.6 640 256C640 344.4 568.4 416 480 416zM416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H224C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224H416z"/>
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
  selectedDoc?: Doc;
}

export default function ActivityBar({ selectedDoc }: ActivityBarProps) {
  return (
    <div className="relative pl-6 lg:w-80">
      {selectedDoc && <DocProfile doc={selectedDoc} />}
        <div className="pt-4 pb-2">
          <h2 className="text-sm font-semibold">Update Requests</h2>
        </div>
        <div>
          <div className="py-1 text-sm border-t border-gray-200"></div>
           <div className="text-sm text-gray-600">
            🚧 Under construction
            </div>
        </div>
      </div>
  )
}