import type { NextPage } from 'next'
import axios from 'axios'
import TimeAgo from 'javascript-time-ago'
import { Menu } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DotsVerticalIcon,
  SortAscendingIcon,
} from '@heroicons/react/solid'
import Sidebar from '../components/Sidebar'
import { classNames } from '../helpers/functions'
import Layout from '../components/layout'
import Link from 'next/link'
import { getRuleTypeIcon } from '../helpers/Icons'
import { useEffect, useState } from 'react'

// TimeAgo
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

type Doc = {
  id: string,
  title: string,
  lastUpdatedAt: string,
  favicon: string,
  url: string
}

const activityItems = [
  { project: 'Workcation', commit: '2d89f0c8', environment: 'production', time: '1h' },
  // More items...
]

const listMenu = [
  {
    name: 'Add rule',
  },
  {
    name: 'Rename',
  },
  {
    name: 'Delete',
    isRed: true,
  }
]

const Home: NextPage = () => {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  useEffect(() => {
    const getDocs = () => {
      axios.get('http://localhost:5000/routes/docs?org=mintlify')
        .then((docsResponse) => {
          const { docs } = docsResponse.data;
          setDocs(docs);
        });
      
      axios.get('http://localhost:5000/routes/events?org=mintlify')
        .then((eventsResponse) => {
          const { events } = eventsResponse.data;
          console.log(events);
        });
    }

    getDocs();
  }, [])
  return (
    <Layout>
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 xl:flex">
        <Sidebar />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
            <div className="flex items-center">
              <h1 className="flex-1 text-lg font-medium">Documentation</h1>
              <Menu as="div" className="relative">
                <Menu.Button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <SortAscendingIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Sort
                  <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-28 z-10 rounded-md shadow-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Name
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Date modified
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Date created
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
          <ul role="list" className="relative z-0">
            {docs?.map((doc) => (
              <div key={doc.id}>
              <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
              <li
                className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer"
              >
                <div className="flex items-center justify-between space-x-4">
                  {/* Repo name and link */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="block">
                        <h2 className="text-sm font-medium text-gray-700">
                          <div className="flex items-center space-x-2">
                            <div>
                              { doc.favicon && <img src={doc.favicon} alt="favicon" className="h-5 w-5 rounded-sm" /> }
                            </div>
                            <Link
                              key={doc.id}
                              href={doc.url}
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
                                          menu.isRed ? 'text-red-500' : '',
                                          'w-full flex items-center space-x-2 px-3 py-1.5 text-sm'
                                        )}
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
                        {getRuleTypeIcon('Notification', 6, 4)}
                      </div>
                      {[].length > 5 ? (
                        <span className="flex-shrink-0 text-xs leading-5 font-medium">
                          +1
                        </span>
                      ) : null}
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
      <div className="bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0">
        <div className="pl-6 lg:w-80">
          <div className="pt-6 pb-2">
            <h2 className="text-sm font-semibold">Activity</h2>
          </div>
          <div>
            <ul role="list" className="divide-y divide-gray-200">
              {activityItems.map((item) => (
                <li key={item.commit} className="py-4">
                  <div className="flex space-x-3">
                    <img
                      className="h-6 w-6 rounded-full"
                      src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
                      alt=""
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">You</h3>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Deployed {item.project} ({item.commit} in master) to {item.environment}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="py-4 text-sm border-t border-gray-200">
              <a href="#" className="text-primary font-semibold hover:text-hover">
                Go to documentation <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  )
}

export default Home
