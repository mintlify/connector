import type { NextPage } from 'next'
import { Menu } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DotsVerticalIcon,
  SortAscendingIcon,
  StarIcon,
} from '@heroicons/react/solid'
import Sidebar from '../components/Sidebar'
import { classNames } from '../helpers/functions'
import Layout from '../components/layout'

const sources = [
  {
    id: '1',
    name: 'API Quickstart',
    lastUpdated: '3 days ago',
    icon: 'https://files.readme.io/6966a5f-small-In_Rectangle.png',
    href: 'https://mintlify.readme.io/reference/start',
    lastDeploy: '3h ago',
    location: 'United states',
    starred: true,
    members: [
      {
        name: 'Courtney Henry',
        handle: 'courtneyhenry',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Tom Cook',
        handle: 'tomcook',
        imageUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ]
  },
  {
    id: '2',
    name: 'Mintlify Connect Technical Specs',
    lastUpdated: '1 hour ago',
    icon: 'https://cdn.worldvectorlogo.com/logos/notion-logo-1.svg',
    href: 'https://mintlify.readme.io/reference/start',
    lastDeploy: '3h ago',
    location: 'United states',
    starred: true,
    members: [
      {
        name: 'Dries Vincent',
        handle: 'driesvincent',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Lindsay Walton',
        handle: 'lindsaywalton',
        imageUrl:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Courtney Henry',
        handle: 'courtneyhenry',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Tom Cook',
        handle: 'tomcook',
        imageUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ]
  },
  // More projects...
]
const activityItems = [
  { project: 'Workcation', commit: '2d89f0c8', environment: 'production', time: '1h' },
  // More items...
]

const Home: NextPage = () => {
  return (
    <Layout>
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 xl:flex">
        <Sidebar />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
            <div className="flex items-center">
              <h1 className="flex-1 text-lg font-medium">Sources</h1>
              <Menu as="div" className="relative">
                <Menu.Button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <SortAscendingIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Sort
                  <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items className="origin-top-right z-10 absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
          <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
            {sources.map((source) => (
              <li
                key={source.id}
                className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer"
              >
                <div className="flex items-center justify-between space-x-4">
                  {/* Repo name and link */}
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="block">
                        <h2 className="text-sm font-medium text-gray-700">
                          <div className="flex items-center space-x-1.5">
                            <div>
                              <img src={source.icon} alt="Icon" className="h-4 w-4" />
                            </div>
                            <div>
                              {source.name}
                            </div>
                          </div>
                        </h2>
                      </span>
                    </div>
                    <a className="relative group flex items-center space-x-2.5">
                      <span className="flex items-center space-x-2 text-sm text-gray-500 group-hover:text-gray-900 truncate">
                        <div>
                          <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" className="w-3 h-3 text-gray-500">
                            <path fill="currentColor" fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
                          </svg>
                        </div>
                        <div>
                          Last updated {source.lastUpdated}
                        </div>
                      </span>
                    </a>
                  </div>
                  <div className="sm:hidden">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  {/* Repo meta info */}
                  <div className="hidden sm:flex flex-col flex-shrink-0 items-end space-y-3">
                    <span className="flex items-center space-x-4">
                      <a
                        href={source.href}
                        className="relative text-sm text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Visit site
                      </a>
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="p-1 rounded-full flex items-center text-gray-400 hover:text-gray-600">
                            <span className="sr-only">Open options</span>
                            <DotsVerticalIcon className="h-4 w-4" aria-hidden="true" />
                          </Menu.Button>
                        </div>
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    type="button"
                                    className={classNames(
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                      'w-full flex justify-between px-4 py-2 text-sm'
                                    )}
                                  >
                                    <span>Copy email address</span>
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    href="#"
                                    className={classNames(
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                      'flex justify-between px-4 py-2 text-sm'
                                    )}
                                  >
                                    <span>Previous conversations</span>
                                  </a>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    href="#"
                                    className={classNames(
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                      'flex justify-between px-4 py-2 text-sm'
                                    )}
                                  >
                                    <span>View original</span>
                                  </a>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                      </Menu>
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-shrink-0">
                        {source.members.map((member) => (
                          <img
                            key={member.handle}
                            className="max-w-none h-4 w-4 rounded-full ring-2 ring-white"
                            src={member.imageUrl}
                            alt={member.name}
                          />
                        ))}
                      </div>
                      {source.members.length > 5 ? (
                        <span className="flex-shrink-0 text-xs leading-5 font-medium">
                          +{source.members.length - 1}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
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
                View all activity <span aria-hidden="true">&rarr;</span>
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
