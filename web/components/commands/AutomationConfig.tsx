import { Fragment, ReactElement, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { getAutomationTypeIcon } from '../../helpers/Icons';
import { AutomationType } from '../../pages/automations';
import { BellIcon, CheckIcon, HashtagIcon, LinkIcon, MailIcon, SelectorIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { automationMap } from './AddAutomation';
import axios from 'axios';
import { API_ENDPOINT } from '../../helpers/api';

type Source = {
  id: string;
  name: string;
  icon: ReactElement<any, any>;
  isDefault?: boolean
}

const defaultDoc: Source = {
  id: '0',
  name: 'Select document',
  icon: <DocumentTextIcon className="flex-shrink-0 h-4 w-4" />,
  isDefault: true
}

const repos: Source[] = [
  {
    id: '0',
    name: 'Select repo',
    icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />,
    isDefault: true
  },
  {
    id: '1',
    name: 'writer',
    icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />
  },
  {
    id: '2',
    name: 'connect',
    icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />
  },
  {
    id: '3',
    name: 'backend',
    icon: <img src="/assets/integrations/github.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />
  },
]

const alertChannels = [
  {
    id: 0,
    name: 'Select method',
    icon: <BellIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
    isDefault: true,
    destination: { icon: MailIcon },
    defaultName: 'message',
  },
  {
    id: 1,
    name: 'Email',
    icon: <MailIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
    destination: {
      title: 'Email address',
      placeholder: 'you@company.com',
      icon: MailIcon,
    },
    defaultName: 'Send email',
  },
  {
    id: 2,
    name: 'Slack',
    icon: <img src="/assets/integrations/slack.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />,
    destination: {
      title: 'Channel',
      placeholder: 'doc-updates',
      icon: HashtagIcon,
    },
    defaultName: 'Send Slack message',
  },
  {
    id: 3,
    name: 'Webhook',
    icon: <img src="/assets/integrations/webhook.svg" alt="Slack" className="flex-shrink-0 h-4 w-4" />,
    destination: {
      title: 'Endpoint URL',
      placeholder: 'https://example.com/webhook',
      icon: LinkIcon,
    },
    defaultName: 'Call API endpoint',
  }
]

export default function AutomationConfig({ automationType, onCancel }: { automationType: AutomationType, onCancel: () => void }) {
  const [docs, setDocs] = useState<Source[]>([defaultDoc]);
  const [selectedDoc, setSelectedDoc] = useState(docs[0])
  const [selectedRepo, setSelectedRepo] = useState(repos[0])
  const [selectedChannel, setSelectedChannel] = useState(alertChannels[0]);

  const ruleData = automationMap[automationType];
  
  useEffect(() => {
    axios.get(`${API_ENDPOINT}/routes/docs?org=mintlify`)
        .then((docsResponse) => {
          const { docs } = docsResponse.data;
          const formattedDocs = docs.map((doc: any) => {
            return {
              id: doc._id,
              name: doc.title,
              icon: <img src={doc.favicon} alt="Slack" className="flex-shrink-0 h-4 w-4 rounded-sm" />
            }
          });
          formattedDocs.unshift(defaultDoc);

          setDocs(formattedDocs);
        });
  }, [])

  const onBackButton = () => {
    onCancel();
  }

  const onCreateButton = () => {
    // Submit form
  }

  let sourceOptions = docs;
  let selectedSource = selectedDoc;
  let setSelectedSource = setSelectedDoc;
  if (automationType === 'code') {
    sourceOptions = repos;
    selectedSource = selectedRepo;
    setSelectedSource = setSelectedRepo;
  }

  const namePlaceholder = `${selectedChannel.defaultName} when ${selectedSource.name} changes`;
  
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
            <Listbox value={selectedSource} onChange={setSelectedSource}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium text-gray-700">Trigger</Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm">
                      <span className="flex items-center">
                        {selectedSource.icon}
                        <span className="ml-3 block truncate">{selectedSource.name}</span>
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
                        {sourceOptions.map((sourceOption) => (
                          <Listbox.Option
                            key={sourceOption.id}
                            className={({ active }) =>
                              classNames(
                                active ? 'text-white bg-primary' : 'text-gray-900',
                                'hover:cursor-pointer select-none relative py-2 pl-3 pr-9'
                              )
                            }
                            value={sourceOption}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {sourceOption.icon}
                                  <span
                                    className={classNames(selected ? 'font-medium' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {sourceOption.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-primary',
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

            {!selectedSource?.isDefault && (
              <div>
                {
                  automationType === 'code' && (
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
                  )
                }
            <div className="mt-4">
            <Listbox value={selectedChannel} onChange={setSelectedChannel}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium text-gray-700">Send alert to</Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm">
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
                                'hover:cursor-pointer select-none relative py-2 pl-3 pr-9'
                              )
                            }
                            value={channel}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {channel.icon}
                                  <span
                                    className={classNames(selected ? 'font-medium' : 'font-normal', 'ml-3 block truncate')}
                                  >
                                    {channel.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-primary',
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
                {selectedChannel.destination.title}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <selectedChannel.destination.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder={selectedChannel.destination.placeholder}
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
                  className="shadow-sm focus:ring-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={namePlaceholder}
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