import { ChevronRightIcon, MailIcon } from "@heroicons/react/solid";
import { BellIcon } from "@heroicons/react/outline";
import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import { classNames } from "../helpers/functions";
import Layout from "../components/layout";
import { getRuleTypeIcon, getTypeIcon } from "../helpers/Icons";

export type SourceType = 'github' | 'doc';
export type DestinationType = 'doc' | 'slack' | 'email';
export type RuleType = 'Update' | 'Notification';

type Rule = {
  id: string,
  active: boolean,
  type: RuleType,
  source: SourceType,
  sourceName: string,
  sourceHref: string,
  destination: DestinationType,
  destinationName: string,
}

const tabs = [
  { name: 'Active', href: '#', count: '2', current: true },
  { name: 'Paused', href: '#', count: '0', current: false },
]

const rules: Rule[] = [
  {
    id: '1',
    active: true,
    type: 'Update',
    source: 'github',
    sourceName: 'writer - src/models/User.ts',
    sourceHref: '',
    destination: 'doc',
    destinationName: 'User Model',
  },
  {
    id: '2',
    active: true,
    type: 'Notification',
    source: 'doc',
    sourceName: 'Technical Overview',
    sourceHref: '',
    destination: 'email',
    destinationName: 'hi@mintlify.com',
  },
  {
    id: '3',
    active: true,
    type: 'Notification',
    source: 'github',
    sourceName: 'writer - src/payments.ts:24-36',
    sourceHref: '',
    destination: 'slack',
    destinationName: '#doc-changes',
  },
  {
    id: '4',
    active: false,
    type: 'Update',
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

const getDestinationTitle = (ruleType: RuleType) => {
  if (ruleType === 'Update') {
    return 'Requires updating';
  }

  return 'Notifies';
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
          <div className="pl-4 pr-6 pt-4 pb-4 border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
          <div className="px-4 sm:px-0">
              <h2 className="text-lg font-medium text-gray-900">Rules</h2>

              {/* Tabs */}
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                  id="tabs"
                  name="tabs"
                  className="mt-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  defaultValue={tabs.find((tab) => tab.current)?.name}
                >
                  {tabs.map((tab) => (
                    <option key={tab.name}>{tab.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="mt-2 -mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          tab.current
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                      >
                        {tab.name}
                        {tab.count ? (
                          <span
                            className={classNames(
                              tab.current ? 'bg-green-100 text-primary' : 'bg-gray-100 text-gray-900',
                              'hidden ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                            )}
                          >
                            {tab.count}
                          </span>
                        ) : null}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Stacked list */}
            <ul role="list" className="mt-5 border-t border-gray-200 divide-y divide-gray-200 sm:mt-0 sm:border-t-0">
              {rules.map((rule) => (
                <li key={rule.id}>
                  <a href="#" className="group block">
                    <div className="flex items-center py-5 px-4 sm:py-6 sm:px-0">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          {getRuleTypeIcon(rule.type)}
                        </div>
                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                          <div>
                            <p className="text-sm truncate">Trigger</p>
                            <p className="mt-1.5 flex items-center text-xs text-gray-500">
                              {getTypeIcon(rule.source, 'flex-shrink-0 mr-1.5 h-4 w-4')}
                              <span className="truncate">{rule.sourceName}</span>
                            </p>
                          </div>
                          <div className="hidden md:block">
                            <div>
                              <p className="text-sm text-gray-900">
                                {getDestinationTitle(rule.type)}
                              </p>
                              <p className="mt-1.5 flex items-center text-xs text-gray-500">
                                {getTypeIcon(rule.destination, 'flex-shrink-0 mr-1.5 h-4 w-4')}
                                <span className="truncate">{rule.destinationName}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <ChevronRightIcon
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
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