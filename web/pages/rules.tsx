import { Menu } from "@headlessui/react";
import { ChevronRightIcon, ChevronDownIcon, DotsVerticalIcon, MailIcon, PencilIcon, SortAscendingIcon } from "@heroicons/react/solid";
import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import { classNames } from "../helpers/functions";
import Layout from "../components/layout";

type RuleType = 'Update Request' | 'Notification';
type SourceType = 'github' | 'doc';
type DestinationType = 'doc' | 'slack' | 'email';

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

const getIcon = (type: SourceType | DestinationType, className: string) => {
  if (type === 'github') {
    return <svg
      className={className}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.99917 0C4.02996 0 0 4.02545 0 8.99143C0 12.9639 2.57853 16.3336 6.15489 17.5225C6.60518 17.6053 6.76927 17.3277 6.76927 17.0892C6.76927 16.8762 6.76153 16.3104 6.75711 15.5603C4.25372 16.1034 3.72553 14.3548 3.72553 14.3548C3.31612 13.316 2.72605 13.0395 2.72605 13.0395C1.9089 12.482 2.78793 12.4931 2.78793 12.4931C3.69127 12.5565 4.16643 13.4198 4.16643 13.4198C4.96921 14.7936 6.27312 14.3968 6.78584 14.1666C6.86761 13.5859 7.10022 13.1896 7.35713 12.965C5.35873 12.7381 3.25756 11.9665 3.25756 8.52116C3.25756 7.53978 3.6084 6.73667 4.18411 6.10854C4.09129 5.88114 3.78244 4.96654 4.27251 3.72904C4.27251 3.72904 5.02778 3.48728 6.74717 4.65082C7.46487 4.45101 8.23506 4.35165 9.00028 4.34779C9.76494 4.35165 10.5346 4.45101 11.2534 4.65082C12.9717 3.48728 13.7258 3.72904 13.7258 3.72904C14.217 4.96654 13.9082 5.88114 13.8159 6.10854C14.3927 6.73667 14.7408 7.53978 14.7408 8.52116C14.7408 11.9753 12.6363 12.7354 10.6318 12.9578C10.9545 13.2355 11.2423 13.7841 11.2423 14.6231C11.2423 15.8247 11.2313 16.7945 11.2313 17.0892C11.2313 17.3299 11.3937 17.6097 11.8501 17.522C15.4237 16.3303 18 12.9628 18 8.99143C18 4.02545 13.97 0 8.99917 0Z"
        fill="currentcolor"
      />
    </svg>
  }

  if (type === 'doc') {
    return <PencilIcon className={className} />
  }

  if (type === 'email') {
    return <MailIcon className={className} />
  }

  if (type === 'slack') {
    return <svg className={className} viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="currentColor"/>
      <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z" fill="currentColor"/>
      <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="currentColor"/>
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="currentColor"/>
    </svg>
  }

  return null;
}

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
                          {getIcon(rule.source, 'flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-500')}
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
                          {getIcon(rule.destination, 'flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-500')}
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