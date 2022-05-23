import type { GetServerSideProps } from 'next'
import axios from 'axios'
import { Menu } from '@headlessui/react'
import {
  ChevronRightIcon,
  DotsVerticalIcon,
} from '@heroicons/react/solid'
import Sidebar from '../components/Sidebar'
import { classNames } from '../helpers/functions'
import Layout from '../components/layout'
import Link from 'next/link'
import { getAutomationTypeIcon, getConnectionIcon } from '../helpers/Icons'
import { useEffect, useState } from 'react'
import timeAgo from '../services/timeago'
import { API_ENDPOINT } from '../helpers/api'
import Head from 'next/head'
import 'react-loading-skeleton/dist/skeleton.css'
import LoadingItem from '../components/LoadingItem'
import { withSession } from '../lib/withSession'
import SignIn from '../components/SignIn'
import Setup from '../components/Setup'
import { Automation } from './automations'
import { DocumentTextIcon } from '@heroicons/react/outline'
import { Event } from '../components/Event'
import ActivityBar from '../components/ActivityBar'

type Code = {
  _id: string,
  file: string,
  url: string,
}

export type Doc = {
  _id: string,
  title: string,
  lastUpdatedAt: string,
  createdAt: string,
  url: string,
  code: Code[],
  automations: Automation[],
  favicon?: string,
}

export type UserSession = {
  userId: string,
  user?: User,
  org?: Org,
  tempAuthData?: {
    email: string,
    firstName?: string,
    lastName?: string,
    orgId?: string,
    orgName?: string,
  }
}

export type Org = {
  _id: string,
  name: string,
}

export type User = {
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  profilePicture?: string,
  org: {
    _id: string,
    name: string,
  }
  pending?: boolean;
}

export default function Home({ userSession }: { userSession: UserSession }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doc>();
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);

  useEffect(() => {
    if (userSession == null) {
      return;
    }

    const userId = userSession.userId;

    axios.get(`${API_ENDPOINT}/routes/docs?userId=${userId}`)
      .then((docsResponse) => {
        const { docs } = docsResponse.data;
        setDocs(docs);
      })
      .finally(() => {
        setIsLoading(false);
      })
    
    let eventsQuery = `${API_ENDPOINT}/routes/events?userId=${userId}`;
    if (selectedDoc) eventsQuery += `&doc=${selectedDoc._id}`;
    axios.get(eventsQuery)
      .then((eventsResponse) => {
        const { events } = eventsResponse.data;
        setEvents(events);
      });
  }, [userSession, selectedDoc, isAddingDoc]);

  if (!userSession) {
    return <>
      <Head>
        <title>Sign in to Mintlify</title>
      </Head>
      <SignIn />
    </>
  }

  if (userSession.user == null) {
    return <>
      <Head>
        <title>Finish setting up your account</title>
      </Head>
      <Setup userSession={userSession} />
    </>;
  }

  if (userSession.org == null) {
    return <div>You do not have permission to this organization</div>
  }

  const listMenu = [
    {
      name: 'Delete',
      isRed: true,
      onClick: (docId: string) => {
        setDocs(docs.filter(doc => doc._id !== docId));
        setSelectedDoc(undefined);
        axios.delete(`${API_ENDPOINT}/routes/docs/${docId}?userId=${userSession.userId}`);
      }
    }
  ]

  const ClearSelectedFrame = () => {
    if (!selectedDoc) return null;
    return <div className="absolute inset-0" onClick={() => setSelectedDoc(undefined)}></div>
  }

  const hasDocs = (docs && docs.length > 0) || isAddingDoc;

  return (
    <>
    <Head>
      <title>Mintlify Dashboard</title>
    </Head>
    <Layout user={userSession.user}>
    <ClearSelectedFrame />
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 xl:flex">
        <Sidebar
          org={userSession.org}
          user={userSession.user}
          setIsAddingDoc={setIsAddingDoc}
          isAddAutomationOpen={isAddAutomationOpen}
          setIsAddAutomationOpen={setIsAddAutomationOpen}
          isAddDocumentOpen={isAddDocumentOpen}
          setIsAddDocumentOpen={setIsAddDocumentOpen}
        />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <ClearSelectedFrame />
          <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
            <div className="flex items-center">
              {hasDocs && <h1 className="flex-1 text-lg font-medium text-gray-800">Documentation</h1> } 
            </div>
          </div>
          {
            !hasDocs && !isLoading && <div className="pb-8">
              <div className="flex items-center justify-center">
                <img className="w-24 h-24" src="/assets/empty/docs.svg" alt="No documentations" />
              </div>
              <p className="text-center mt-6 text-gray-600 font-medium">
                No documentation found
              </p>
              <p className="mt-1 text-center text-sm text-gray-400">
                Add one to get started
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  className="inline-flex items-center justify-center text-sm bg-primary text-white rounded-md shadow-sm py-2 font-medium px-8 hover:bg-hover"
                  onClick={() => setIsAddDocumentOpen(true)}
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Add Documentation
                </button>
              </div>
            </div>
          }
          <ul role="list" className="relative z-0">
            { isAddingDoc && <LoadingItem /> }
            {docs?.map((doc) => (
              <div key={doc._id}>
              <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
              <li
                className={classNames("relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer", doc._id === selectedDoc?._id ? 'bg-gray-50' : '')}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center justify-between space-x-4">
                  {/* Repo name and link */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="block">
                        <h2 className="text-sm font-medium text-gray-700">
                          <div className="flex items-center space-x-2">
                            <div>
                              { doc.favicon ? <img src={doc.favicon} alt="favicon" className="h-5 w-5 rounded-sm" /> : <DocumentTextIcon className="h-5 w-5 text-gray-600" /> }
                            </div>
                            <Link
                              href={doc.url || ''}
                            >
                              <a target="_blank" className="decoration-gray-300 hover:underline">
                                {doc.title}
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
                            <div className="py-1 w-32">
                              {
                                listMenu.map((menu) => (
                                  <Menu.Item key={menu.name}>
                                    {({ active }) => (
                                      <button
                                        type="button"
                                        className={classNames(
                                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                          menu.isRed ? 'text-red-700' : '',
                                          'w-full flex items-center space-x-2 px-3 py-1.5 text-sm')}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            menu.onClick(doc._id);
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
                            {getConnectionIcon(6, 4)}
                          </a>
                        ))}
                        {
                          doc.automations.map((automation) => (
                          <a key={automation._id}>
                            {getAutomationTypeIcon(automation.type, 6, 4)}
                          </a>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              </div>
            ))}
          </ul>
        </div>
      </div>
      {/* Activity feed */}
      <div className="relative bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0 z-10">
        <ActivityBar
          events={events}
          selectedDoc={selectedDoc}
          userSession={userSession}
          setIsAddAutomationOpen={setIsAddAutomationOpen}
        />
      </div>
    </div>
    </Layout>
    </>
  )
}

const getServerSidePropsHandler: GetServerSideProps = async ({req}: any) => {
  const userSession = req.session.get('user') ?? null;
  const props = {userSession};
  return {props};
}

export const getServerSideProps = withSession(getServerSidePropsHandler);