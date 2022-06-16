import { useEffect, useState } from 'react'
import Link from "next/link";
import { classNames } from "../helpers/functions";
import { Doc } from "../pages";
import { Menu } from '@headlessui/react'
import {
  ChevronRightIcon,
  DotsVerticalIcon,
} from '@heroicons/react/solid'
import { ConnectionIcon, DocTitleIcon, SilencedDocIcon } from '../helpers/Icons'
import timeAgo from '../services/timeago'
import { getSubdomain } from "../helpers/user";
import axios from "axios";
import { API_ENDPOINT } from "../helpers/api";
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { useProfile } from '../context/ProfileContex';

type DocItemProps = {
  doc: Doc,
  onClick: (doc: Doc) => void,
  docs: Doc[],
  setDocs: (docs: Doc[]) => void,
  selectedDoc?: Doc,
  removeSeparators?: boolean,
  setSelectedDoc: (doc: Doc | undefined) => void,
  integrationsStatus?: { [key: string]: boolean }
}

type MenuItem = {
  name: string,
  isRed: boolean,
  isGreen: boolean,
  onClick: () => void,
}

export default function DocItem({ doc, onClick, selectedDoc, docs, setDocs, removeSeparators, setSelectedDoc, integrationsStatus }: DocItemProps) {
  const { profile } = useProfile();
  const [silenced, setSilenced] = useState(false);
  const [listMenu, setListMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    const { user } = profile;

    if (user == null) {
      return;
    }
    
    let slack = doc?.slack ?? true;
    if (integrationsStatus == null || !integrationsStatus['slack']) { slack = false }
    const email = doc?.email ?? true;
    setSilenced(!slack && !email);
    
    const menu = [];

    if (integrationsStatus != null && integrationsStatus['slack']) {
      const slack = doc?.slack ?? true;
      menu.push({
        name: slack ? 'Disable Slack alerts' : 'Enable Slack alerts',
        isGreen: !slack,
        isRed: false,
        onClick: () => {
          axios.put(`${API_ENDPOINT}/routes/docs/${doc._id}/slack`, {
            slack: !slack
          });
        }
      })
    }

    // menu.push({
    //   name: email ? 'Disable email alerts' : 'Enable email alerts',
    //   isGreen: !email,
    //   isRed: false,
    //   onClick: () => {
    //     axios.put(`${API_ENDPOINT}/routes/docs/${doc._id}/email`, {
    //       email: !email
    //     });
    //   }
    // })

    menu.push({
      name: 'Delete',
      isRed: true,
      isGreen: false,
      onClick: () => {
        setDocs(docs.filter(oneOfTheDocs => oneOfTheDocs._id !== doc._id));
        setSelectedDoc(undefined);
        axios.delete(`${API_ENDPOINT}/routes/docs/${doc._id}`, {
          params: {
            userId: user.userId,
            subdomain: getSubdomain(window.location.host)
          }
        });
      }
    });
    setListMenu(menu);
  }, [doc, integrationsStatus, docs, setDocs, setSelectedDoc, profile]);



  return <div key={doc._id}>
  {!removeSeparators && <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div> }
  <li
    className={classNames("relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer", doc._id === selectedDoc?._id ? 'bg-gray-50' : '')}
    onClick={() => onClick(doc)}
  >
    <div className="flex items-center justify-between space-x-4">
      {/* Repo name and link */}
      <div className="min-w-0 space-y-2">
        <div className="flex items-center space-x-3">
          <span className="block">
            <h2 className="text-sm font-medium text-gray-700">
              <div className="flex items-center space-x-2">
                <DocTitleIcon method={doc.method} favicon={doc.favicon} />
                <Link
                  href={doc.url}
                > 
                  <a target="_blank" className="space-x-1 group flex items-center decoration-gray-300 hover:underline">
                    <span>
                      {doc.title}
                    </span>
                    <ExternalLinkIcon className="w-4 h-4 text-gray-400 invisible group-hover:visible" />
                  </a>
                </Link>
              </div>
            </h2>
          </span>
        </div>
        <a className="relative group flex items-center space-x-2.5">
          <span className="flex items-center space-x-2.5 text-sm text-gray-500 truncate">
            <div>
              <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" className="w-3 h-3 text-gray-500">
                <path fill="currentColor" fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
              </svg>
            </div>
            <div>
              Last updated {timeAgo.format(Date.parse(doc.lastUpdatedAt))}
            </div>
          </span>
        </a>
      </div>
      <div className="sm:hidden">
        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      {/* Repo meta info */}
      <div className="hidden sm:flex flex-col flex-shrink-0 items-end space-y-2">
        <span className="flex items-center space-x-4">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="p-1 rounded-full flex items-center text-gray-400 hover:text-gray-600">
                <span className="sr-only">Open options</span>
                <DotsVerticalIcon className="h-4 w-4" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Menu.Items className="origin-top-right absolute right-0 mt-2 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1 w-40">
                  {
                    listMenu.map((menu) => (
                      <Menu.Item key={menu.name}>
                        {({ active }) => (
                          <button
                            type="button"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              menu.isRed ? 'text-red-700' : '',
                              'w-full flex items-center space-x-2 px-3 py-1.5 text-sm',
                              menu.isGreen ? 'text-green-800' : '')}
                              onClick={(e) => {
                                e.stopPropagation();
                                menu.onClick();
                              }}
                          >
                            <span>{menu.name}</span>
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  }
                </div>
              </Menu.Items>
          </Menu>
        </span>
        <div className="flex items-center space-x-2">
          <div className="flex flex-shrink-0 space-x-1">
            <div className="h-6 w-6"></div>
            {doc.code.map((code) => (
              <a key={code._id} >
                <ConnectionIcon
                  outerSize={6}
                  innerSize={4}
                />
              </a>
            ))}
            {silenced && (
              <SilencedDocIcon
                outerSize={6}
                innerSize={4} 
              />
            )}  
          </div>
        </div>
      </div>
    </div>
  </li>
  </div>
}