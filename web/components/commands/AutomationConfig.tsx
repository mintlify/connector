import { Fragment, ReactElement, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { AutomationTypeIcon } from '../../helpers/Icons';
import { AutomationType } from '../../pages/automations';
import { BellIcon, CheckIcon, HashtagIcon, LinkIcon, MailIcon, SelectorIcon } from '@heroicons/react/solid';
import { DocumentTextIcon } from '@heroicons/react/outline';
import { automationMap } from './AddAutomation';
import axios from 'axios';
import { API_ENDPOINT } from '../../helpers/api';
import { Doc, User } from '../../pages';
import { getSubdomain } from '../../helpers/user';

type Source = {
  _id: string;
  name: string;
  icon: ReactElement<any, any>;
  isDefault?: boolean
}

const defaultDoc: Source = {
  _id: '0',
  name: 'Select document',
  icon: <DocumentTextIcon className="flex-shrink-0 h-4 w-4" />,
  isDefault: true
}

const defaultRepo: Source = {
  _id: '0',
  name: 'Select repo',
  icon: <img src="/assets/integrations/github.svg" alt="GitHub" className="flex-shrink-0 h-4 w-4" />,
  isDefault: true
}

type AutomationConfig = {
  user: User,
  automationType: AutomationType,
  onCancel: () => void,
  setIsAddAutomationOpen: (isOpen: boolean) => void,
  setIsAddingAutomation?: (isAddingAutomation: boolean) => void;
}

export default function AutomationConfig({ user, automationType, onCancel, setIsAddAutomationOpen, setIsAddingAutomation }: AutomationConfig) {
  const destinations = [
    {
      id: 0,
      name: 'Select method',
      icon: <BellIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
      destination: { icon: MailIcon },
      defaultName: 'message',
      isDefault: true,
    },
    {
      id: 'email',
      name: 'Email',
      icon: <MailIcon className="flex-shrink-0 h-4 w-4 text-gray-700" />,
      destination: {
        title: 'Email address',
        placeholder: user.email,
        icon: MailIcon,
      },
      defaultName: 'Send email',
    },
    {
      id: 'slack',
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
      id: 'webhook',
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

  const [docs, setDocs] = useState<Source[]>([defaultDoc]);
  const [selectedDoc, setSelectedDoc] = useState(docs[0]);
  const [repos, setRepos] = useState<Source[]>([defaultRepo]);
  const [selectedRepo, setSelectedRepo] = useState(repos[0])
  const [selectedDestinationType, setSelectedDestinationType] = useState(destinations[0]);
  const [destinationValue, setDestinationValue] = useState('');
  const [name, setName] = useState('');

  const ruleData = automationMap[automationType];
  
  useEffect(() => {
    if (automationType === 'doc') {
      axios.get(`${API_ENDPOINT}/routes/docs`, {
        params: {
          userId: user.userId,
          subdomain: getSubdomain(window.location.host),
        }
      })
        .then((docsResponse) => {
          const { docs } = docsResponse.data;
          const formattedDocs = docs.map((doc: Doc) => {
            return {
              _id: doc._id,
              name: doc.title,
              icon: doc.favicon ? <img src={doc.favicon} alt="Slack" className="flex-shrink-0 h-4 w-4 rounded-sm" /> : <DocumentTextIcon className="h-4 w-4 text-gray-600" />
            }
          });
          formattedDocs.unshift(defaultDoc);

          setDocs(formattedDocs);
        });
    }

    else if (automationType === 'code') {
      axios.get(`${API_ENDPOINT}/routes/org/repos`, {
        params: {
          userId: user.userId,
          subdomain: getSubdomain(window.location.host)
        }
      })
        .then((reposResponse) => {
          const { repos } = reposResponse.data;
          const formattedRepos= repos.map((repo: string) => {
            return {
              _id: repo,
              name: repo,
              icon: <img src="/assets/integrations/github.svg" alt="GitHub" className="flex-shrink-0 h-4 w-4" />
            }
          });
          formattedRepos.unshift(defaultRepo);
          setRepos(formattedRepos);
        });
    }
  }, [user, automationType])

  const onBackButton = () => {
    onCancel();
  }

  let sourceOptions = docs;
  let selectedSource = selectedDoc;
  let setSelectedSource = setSelectedDoc;
  if (automationType === 'code') {
    sourceOptions = repos;
    selectedSource = selectedRepo;
    setSelectedSource = setSelectedRepo;
  }

  const namePlaceholder = `${selectedDestinationType.defaultName} when ${selectedSource.name} changes`;

  const onCreateButton = async () => {
    setIsAddAutomationOpen(false);
    if (setIsAddingAutomation) {
      setIsAddingAutomation(true);
    }
    await axios.post(`${API_ENDPOINT}/routes/automations`, {
      type: automationType,
      sourceValue: automationType === 'code' ? selectedRepo.name : selectedDoc._id,
      destinationType: selectedDestinationType.id,
      destinationValue,
      name: name ? name : namePlaceholder
    }, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    });
    if (setIsAddingAutomation) {
      setIsAddingAutomation(false);
    }
  }

  const isCompletedForm = (automationType === 'doc' && selectedDoc.isDefault !== true && selectedDestinationType.isDefault !== true && destinationValue !== '') || (automationType === 'code' && selectedRepo.isDefault !== true && selectedDestinationType.isDefault !== true && destinationValue !== '');
  
  return <div className="px-6 py-6 z-10">
    <div>
      <div className="flex space-x-4">
        <AutomationTypeIcon
          type={automationType}
        />
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
                            key={sourceOption._id}
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
            <div className="mt-4">
            <Listbox value={selectedDestinationType} onChange={setSelectedDestinationType}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium text-gray-700">Send alert to</Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none sm:text-sm">
                      <span className="flex items-center">
                        {selectedDestinationType.icon}
                        <span className="ml-3 block truncate">{selectedDestinationType.name}</span>
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
                        {destinations.map((channel) => (
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
              !selectedDestinationType?.isDefault && <div>
                <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {selectedDestinationType.destination.title}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <selectedDestinationType.destination.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder={selectedDestinationType.destination.placeholder}
                  value={destinationValue}
                  onChange={(e) => setDestinationValue(e.target.value)}
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
                  className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
          disabled={!isCompletedForm}
          className={classNames("ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
          isCompletedForm ? "bg-primary hover:bg-hover" : "bg-gray-300 cursor-default")}
          onClick={onCreateButton}
        >
          Create Automation
        </button>
      </div>
    </div>
  </div>
}