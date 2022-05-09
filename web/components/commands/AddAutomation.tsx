import { Fragment, useState } from 'react'
import { Combobox, Dialog, Menu, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { getAutomationTypeIcon, getTypeIcon } from '../../helpers/Icons';
import { AutomationType } from '../../pages/automations';
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon, SelectorIcon } from '@heroicons/react/solid';

type AutomationData = {
  type: AutomationType;
  title: string;
  description: string;
}

const ruleMap: { Notification: AutomationData, Update: AutomationData } = {
  Update: {
    type: 'Update',
    title: 'Require documentation review',
    description: 'Require reviews when relevant code changes',
  },
  Notification: {
    type: 'Notification',
    title: 'Send alert on change',
    description: 'Be notified when documentation or code changes',
  },
};

type AddAutomationProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void,
}

export default function AddAutomation({ isOpen, setIsOpen }: AddAutomationProps) {
  const [selectedRuleType, setSelectedRuleType] = useState<AutomationType>();

  const onToPrimarySelection = () => {
    setSelectedRuleType(undefined);
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              { selectedRuleType && (
                <RuleConfig ruleType={selectedRuleType} onCancel={onToPrimarySelection} />
              ) }
              {
                selectedRuleType == null && (<Combobox onChange={() => {}} value="">
                  <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                    {Object.values(ruleMap).map((item) => (
                      <Combobox.Option
                        key={item.type}
                        value={item}
                        className={({ active }) =>
                          classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                        }
                        onClick={() => setSelectedRuleType(item.type)}
                      >
                        {({ active }) => (
                          <>
                            {getAutomationTypeIcon(item.type)}
                            <div className="ml-4 flex-auto">
                              <p
                                className={classNames(
                                  'text-sm font-medium',
                                  active ? 'text-gray-900' : 'text-gray-700'
                                )}
                              >
                                {item.title}
                              </p>
                              <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                                {item.description}
                              </p>
                            </div>
                            <ChevronRightIcon
                              className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
              </Combobox>)
              }
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

const repos = [
  { id: 1, name: 'writer' },
  { id: 2, name: 'connect' },
  { id: 3, name: 'backend' },
]

function RuleConfig({ ruleType, onCancel }: { ruleType: AutomationType, onCancel: () => void }) {
  const [reposQuery, setReposQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState()
  const [page, setPage] = useState(1)

  const filteredRepos =
    reposQuery === ''
      ? repos
      : repos.filter((repo) => {
          return repo.name.toLowerCase().includes(reposQuery.toLowerCase())
        })

  const ruleData = ruleMap[ruleType];

  const onBackButton = () => {
    if (page === 1) {
      onCancel();
    }

    setPage(page - 1);
  }

  const onNextButton = () => {
    if (page === 1) {
      setPage(2);
      return;
    }

    // Submit form
  }
  
  return <div className="px-6 py-6 z-10">
    <div>
      <div className="flex space-x-4">
        {getAutomationTypeIcon(ruleType)}
        <div>
          <h1 className="text-sm font-medium text-gray-900">{ruleData.title}</h1>
          <p className="text-sm text-gray-500">
            {ruleData.description}
          </p>
        </div>
      </div>

      {
        page === 1 && (
          <div className="mt-6">
            <div className="flex space-x-2">
              <div>
                <Menu as="div" className="relative w-full inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {getTypeIcon('github', 'h-5 w-5 mr-2')}
                    mintlify
                    <ChevronDownIcon className="-mr-1 ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
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
                            mintlify
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
                            Add account
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              </div>
              <div className="flex-1">
                <Combobox as="div" value={selectedRepo} onChange={setSelectedRepo}>
                  <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                    <Combobox.Input
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pr-10 shadow-sm pl-10 text-sm focus:ring-0 focus:border-gray-300"
                      onChange={(event) => setReposQuery(event.target.value)}
                      displayValue={(person: any) => person?.name || ''}
                      placeholder="Search repo..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>

                    {filteredRepos.length > 0 && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredRepos.map((repo) => (
                          <Combobox.Option
                            key={repo.id}
                            value={repo}
                            className={({ active }) =>
                              classNames(
                                'relative cursor-pointer select-none py-2 pl-3 pr-9',
                                active ? 'bg-primary text-white' : 'text-gray-900'
                              )
                            }
                          >
                            {({ active, selected }) => (
                              <>
                                <span className={classNames('block truncate', selected ? 'font-semibold' : '')}>{repo.name}</span>

                                {selected && (
                                  <span
                                    className={classNames(
                                      'absolute inset-y-0 right-0 flex items-center pr-4',
                                      active ? 'text-white' : 'text-primary'
                                    )}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}
                  </div>
                </Combobox>
              </div>
            </div>

            {selectedRepo && (
              <div className="mt-2">
              <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Directory
                </label>
                <span className="text-xs text-gray-500" id="email-optional">
                  Optional
                </span>
              </div>
              <div className="mt-1">
                <input
                  type="text"
                  className="shadow-sm focus:ring-0 focus:border-gray-300 bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md focus:bg-white"
                  placeholder="./"
                />
              </div>
            </div> 
            )}
            </div>
        )
      }

      {
        page === 2 && (
          <div className="mt-6">
            Hello there
          </div>
        )
      }

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
          onClick={onNextButton}
        >
          {
            page === 1 ? 'Next' : 'Create Rule'
          }
        </button>
      </div>
    </div>
  </div>
}