import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import { classNames } from "../helpers/functions";
import Layout from "../components/layout";
import { getAutomationTypeIcon, getTypeIcon } from "../helpers/Icons";
import { Switch } from "@headlessui/react";
import Head from "next/head";

export type SourceType = 'github' | 'doc';
export type DestinationType = 'doc' | 'slack' | 'email';
export type AutomationType = 'doc' | 'code';

type Automation = {
  id: string,
  active: boolean,
  name: string,
  type: AutomationType,
  source: SourceType,
  sourceName: string,
  sourceHref: string,
  destination: DestinationType,
  destinationName: string,
}

const automations: Automation[] = [
  {
    id: '1',
    active: true,
    name: 'Require documentation review',
    type: 'doc',
    source: 'github',
    sourceName: 'writer',
    sourceHref: '',
    destination: 'doc',
    destinationName: 'User Model',
  },
  {
    id: '2',
    active: true,
    name: 'Notify technical review',
    type: 'code',
    source: 'doc',
    sourceName: 'Technical Overview',
    sourceHref: '',
    destination: 'email',
    destinationName: 'hi@mintlify.com',
  },
  {
    id: '3',
    active: true,
    name: 'Slack alert on change',
    type: 'code',
    source: 'github',
    sourceName: 'writer',
    sourceHref: '',
    destination: 'slack',
    destinationName: '#doc-changes',
  },
  {
    id: '4',
    active: false,
    name: 'Require documentation update on Mongoose',
    type: 'code',
    source: 'github',
    sourceName: 'connect',
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

const Automations: NextPage = () => {
  return (
    <>
    <Head>
      <title>Automations</title>
    </Head>
    <Layout>
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 xl:flex">
        <Sidebar />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
          <div className="px-4 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900">Automations</h2>
          </div>
        </div>
        {/* Stacked list */}
        <ul role="list">
            {automations.map((automation) => (
              <li key={automation.id}>
                <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
                <a href="#" className="block hover:bg-gray-50">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        { getAutomationTypeIcon(automation.type, 8, 5) }
                        <p className="text-sm font-medium text-gray-700 truncate">{automation.name}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                      <Switch
                          checked={automation.active}
                          onChange={() => {}}
                          className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-4 w-9 cursor-pointer"
                        >
                          <span className="sr-only">Use setting</span>
                          <span aria-hidden="true" className="pointer-events-none absolute bg-white w-full h-full rounded-md" />
                          <span
                            aria-hidden="true"
                            className={classNames(
                              automation.active ? 'bg-primary' : 'bg-gray-200',
                              'pointer-events-none absolute h-4 w-9 mx-auto rounded-full transition-colors ease-in-out duration-200'
                            )}
                          />
                          <span
                            aria-hidden="true"
                            className={classNames(
                              automation.active ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none absolute left-0 inline-block h-5 w-5 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200'
                            )}
                          />
                        </Switch>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          { getTypeIcon(automation.source, 'flex-shrink-0 mr-1 h-4 w-4 text-gray-400') }
                          {automation.sourceName}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          { getTypeIcon(automation.destination, 'flex-shrink-0 mr-1 h-4 w-4 text-gray-400') }
                          {automation.destinationName}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
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
    </>
  )
};

export default Automations;