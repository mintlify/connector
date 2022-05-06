import { Menu } from "@headlessui/react";
import { ChevronRightIcon, ChevronDownIcon, DotsVerticalIcon, SortAscendingIcon } from "@heroicons/react/solid";
import { TrashIcon, PauseIcon, PencilIcon } from "@heroicons/react/outline";
import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import { classNames } from "../helpers/functions";
import Layout from "../components/layout";
import { getTypeIcon } from "../helpers/Icons";

export type SourceType = 'github' | 'doc';
export type DestinationType = 'doc' | 'slack' | 'email';
type RuleType = 'Update Request' | 'Notification';

type Rule = {
  active: boolean,
  name: string,
  type: RuleType,
  source: SourceType,
  sourceName: string,
  sourceHref: string,
  destination: DestinationType,
  destinationName: string,
}

const rules: Rule[] = [
  {
    active: true,
    name: 'User properties document syncing',
    type: 'Update Request',
    source: 'github',
    sourceName: 'writer - src/models/User.ts',
    sourceHref: '',
    destination: 'doc',
    destinationName: 'User Model',
  },
  {
    active: true,
    name: 'Email when technical architecture is changed',
    type: 'Notification',
    source: 'doc',
    sourceName: 'Technical Overview',
    sourceHref: '',
    destination: 'email',
    destinationName: 'hi@mintlify.com',
  },
  {
    active: true,
    name: 'Alert when payment endpoints config is updated',
    type: 'Notification',
    source: 'github',
    sourceName: 'writer - src/payments.ts:24-36',
    sourceHref: '',
    destination: 'slack',
    destinationName: '#doc-changes',
  },
  {
    active: false,
    name: 'Database schema document syncing',
    type: 'Update Request',
    source: 'github',
    sourceName: 'connect - server/services/mongoose.ts',
    sourceHref: '',
    destination: 'doc',
    destinationName: 'Mongoose Database',
  },
]

const integrations = [
  {
    name: 'GitHub',
    role: 'Not installed',
    imageUrl: '/assets/integrations/github.svg',
  },
  {
    name: 'VS Code',
    role: 'Installed',
    imageUrl: '/assets/integrations/vscode.svg',
  },
  {
    name: 'Slack',
    role: 'Not installed',
    imageUrl: '/assets/integrations/slack.svg',
  },
]

const listMenu = [
  {
    name: 'Edit',
  },
  {
    name: 'Turn off',
  },
  {
    name: 'Delete',
    isRed: true,
  }
]

const Rules: NextPage = () => {
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
              <h1 className="flex-1 text-lg font-medium">Rules</h1>
              <Menu as="div" className="relative">
                <Menu.Button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <SortAscendingIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Sort
                  <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items className="origin-top-right z-10 absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
            {rules.map((rule) => (
              <li
                key={rule.name}
                className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
              >
                <div className="flex items-center justify-between space-x-4">
                  {/* Repo name and link */}
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={classNames(
                          rule.active ? 'bg-green-100' : 'bg-gray-100',
                          'h-5 w-5 rounded-full flex items-center justify-center'
                        )}
                        aria-hidden="true"
                      >
                        <span
                          className={classNames(
                            rule.active ? 'bg-secondary' : 'bg-gray-400',
                            'h-2.5 w-2.5 rounded-full'
                          )}
                        />
                      </span>

                      <span className="block">
                        <h2 className="text-sm font-medium">
                          <a href={rule.sourceHref}>
                            <span className="absolute inset-0" aria-hidden="true" />
                            {rule.name}{' '}
                            <span className="sr-only">{rule.active ? 'Running' : 'Not running'}</span>
                          </a>
                        </h2>
                      </span>
                    </div>
                    <div className="ml-0.5 flex items-center space-x-1">
                      <div>
                        <a href={rule.sourceHref} className="relative group flex items-center space-x-2">
                          {getTypeIcon(rule.source, 'flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-500')}
                          <span className="text-sm text-gray-500 group-hover:text-gray-900 truncate">
                            {rule.sourceName}
                          </span>
                        </a>
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" className="h-4 w-4 text-gray-500">
                          <path d="M118.6 105.4l128 127.1C252.9 239.6 256 247.8 256 255.1s-3.125 16.38-9.375 22.63l-128 127.1c-9.156 9.156-22.91 11.9-34.88 6.943S64 396.9 64 383.1V128c0-12.94 7.781-24.62 19.75-29.58S109.5 96.23 118.6 105.4z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <a href={rule.sourceHref} className="relative group flex items-center space-x-2">
                          {getTypeIcon(rule.destination, 'flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-500')}
                          <span className="text-sm text-gray-500 group-hover:text-gray-900 truncate">
                            {rule.destinationName}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="sm:hidden">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  {/* Repo meta info */}
                  <div className="hidden sm:flex flex-col flex-shrink-0 items-end space-y-3">
                    <span className="flex items-center space-x-4">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="p-1 rounded-full flex items-center text-gray-400 hover:text-gray-600">
                            <span className="sr-only">Open options</span>
                            <DotsVerticalIcon className="h-4 w-4" aria-hidden="true" />
                          </Menu.Button>
                        </div>
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-28 z-10 rounded-md shadow-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
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
                    <p className="flex text-gray-500 text-xs space-x-2">
                      <span>{rule.type}</span>
                    </p>
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
            <h2 className="text-sm font-semibold">Integrations</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="relative rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <div className="flex-shrink-0">
                  <img className="h-6 w-6" src={integration.imageUrl} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <a href="#" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                    <p className="text-xs text-gray-500 truncate">{integration.role}</p>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  )
};

export default Rules;