import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { getAutomationTypeIcon } from '../../helpers/Icons';
import { AutomationType } from '../../pages/automations';
import { BellIcon, CheckIcon, MailIcon, SelectorIcon } from '@heroicons/react/solid';
import { automationMap } from './AddAutomation';

const repos = [
  { id: 0, name: 'Select repo', icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />, isDefault: true },
  { id: 1, name: 'writer', icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" /> },
  { id: 2, name: 'connect', icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" /> },
  { id: 3, name: 'backend', icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" /> },
]

const alertChannels = [
  {
    id: 0,
    name: 'Select method',
    icon: <BellIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
    isDefault: true,
  },
  {
    id: 1,
    name: 'Email',
    icon: <MailIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
  },
  {
    id: 2,
    name: 'Slack',
    icon: <img src="/assets/integrations/slack.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />,
  },
  {
    id: 3,
    name: 'Webhook',
    icon: <img src="/assets/integrations/slack.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />,
  }
]

export default function AutomationConfig({ automationType, onCancel }: { automationType: AutomationType, onCancel: () => void }) {
  const [selectedRepo, setSelectedRepo] = useState(repos[0])
  const [selectedChannel, setSelectedChannel] = useState(alertChannels[0]);

  const ruleData = automationMap[automationType];

  const onBackButton = () => {
    onCancel();
  }

  const onCreateButton = () => {
    // Submit form
  }
  
  return <div className="px-6 py-6 z-10">
    <div>
      <div className="flex space-x-4">
        {getAutomationTypeIcon(automationType)}
        <div>
          <h1 className="text-sm font-medium text-gray-900">{ruleData.title}</h1>
          <p className="text-sm text-gray-500">
            {ruleData.description}
          </p>
        </div>
      </div>
          <div className="mt-4">
            <Listbox value={selectedRepo} onChange={setSelectedRepo}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium text-gray-700">Trigger</Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm">
                      <span className="flex items-center">
                        {selectedRepo.icon}
                        <span className="ml-3 block truncate">{selectedRepo.name}</span>
                      </span>
                      <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {repos.map((repo) => (
                          <Listbox.Option
                            key={repo.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'text-white bg-primary' : 'text-gray-900',
                                'cursor-default select-none relative py-2 pl-3 pr-9'
                              )
                            }
                            value={repo}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {repo.icon}
                                  <span
                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {repo.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4'
                                    )}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>

            {!selectedRepo?.isDefault && (
              <div>
              <fieldset className="space-y-3">
              <legend className="sr-only">Notifications</legend>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="comments"
                    aria-describedby="comments-description"
                    name="comments"
                    type="checkbox"
                    className="focus:ring-0 h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span id="comments-description" className="text-gray-500">
                    Only get triggered by <span className="underline decoration-dashed decoration-gray-300">connected code</span>
                  </span>
                </div>
              </div>
            </fieldset>
            <div className="mt-4">
            <Listbox value={selectedChannel} onChange={setSelectedChannel}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium text-gray-700">Send alert to</Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm">
                      <span className="flex items-center">
                        {selectedChannel.icon}
                        <span className="ml-3 block truncate">{selectedChannel.name}</span>
                      </span>
                      <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {alertChannels.map((channel) => (
                          <Listbox.Option
                            key={channel.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'text-white bg-primary' : 'text-gray-900',
                                'cursor-default select-none relative py-2 pl-3 pr-9'
                              )
                            }
                            value={channel}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {channel.icon}
                                  <span
                                    className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {channel.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-indigo-600',
                                      'absolute inset-y-0 right-0 flex items-center pr-4'
                                    )}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>
            </div>
            {
              !selectedChannel?.isDefault && <div>
                <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <span className="text-sm text-gray-500" id="email-optional">
                  Optional
                </span>
              </div>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Send slack alert when writer changes"
                />
              </div>
            </div>
              </div>
            }
            </div>
            )}
            </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={onBackButton}
        >
          Back
        </button>
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary"
          onClick={onCreateButton}
        >
          Create Rule
        </button>
      </div>
    </div>
  </div>
}