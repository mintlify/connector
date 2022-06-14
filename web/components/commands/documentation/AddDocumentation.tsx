import { Fragment, useEffect, useState } from 'react'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { classNames } from '../../../helpers/functions'
import { DocumentationTypeIcon } from '../../../helpers/Icons'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { Org, User } from '../../../pages'
import DocumentationConfig from './DocumentationConfig'

export type AddDocumentationType = 'webpage' | 'notion' | 'googledocs' | 'confluence';

type AddDocumentationSelection = {
  type: AddDocumentationType
  title: string
  description: string
}

export const addDocumentationMap: Record<AddDocumentationType, AddDocumentationSelection> = {
  webpage: {
    type: 'webpage',
    title: 'Web page',
    description: 'Add content from a website',
  },
  notion: {
    type: 'notion',
    title: 'Notion',
    description: 'Add Notion pages',
  },
  confluence: {
    type: 'confluence',
    title: 'Confluence',
    description: 'Add Confluence documents',
  },
  googledocs: {
    type: 'googledocs',
    title: 'Google Docs',
    description: 'Add Google Docs documents',
  },
}

type AddDocumentationProps = {
  user: User;
  org: Org;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsAddDocLoading: (isAddingAutomation: boolean) => void;
  overrideSelectedRuleType?: AddDocumentationType;
}

export default function AddDocumentation({ user, org, isOpen, setIsOpen, setIsAddDocLoading, overrideSelectedRuleType }: AddDocumentationProps) {
  const [selectedRuleType, setSelectedRuleType] = useState<AddDocumentationType>();

  useEffect(() => {
    setSelectedRuleType(overrideSelectedRuleType);
  }, [overrideSelectedRuleType])

  const onClickOption = async (item: AddDocumentationSelection) => {
    setSelectedRuleType(item.type)
  }

  const onToPrimarySelection = () => {
    if (overrideSelectedRuleType) {
      setIsOpen(false);
      return;
    }
    setSelectedRuleType(undefined);
  }

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
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
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterLeave={onToPrimarySelection}
          >
            <Dialog.Panel className="fixed inset-0 mx-4 my-4 sm:my-6 md:my-20 sm:mx-auto max-w-xl transform divide-y divide-gray-100 rounded-xl transition-all">
              <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
              <div className="absolute w-full max-h-full bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10 overflow-auto">
              <DocumentationConfig
                user={user}
                org={org}
                documentationType={selectedRuleType}
                onCancel={onToPrimarySelection}
                setIsAddDocumentationOpen={setIsOpen}
                setIsAddDocLoading={setIsAddDocLoading}
              />
              {selectedRuleType == null && (
                <Combobox onChange={() => {}} value="">
                  <Combobox.Options static className="max-h-96 scroll-py-3 p-3">
                    {Object.values(addDocumentationMap).map((item) => (
                      <Combobox.Option
                        key={item.type}
                        value={item}
                        className={({ active }) =>
                          classNames(
                            'flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer',
                            active ? 'bg-gray-50' : ''
                          )
                        }
                        onClick={() => onClickOption(item)}
                      >
                        {({ active }) => (
                          <>
                            <DocumentationTypeIcon type={item.type} />
                            <div className="ml-4 flex-auto">
                              <p className={classNames('text-sm font-medium', active ? 'text-gray-900' : 'text-gray-700')}>
                                {item.title}
                              </p>
                              <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                                {item.description}
                              </p>
                            </div>
                            <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-700" aria-hidden="true" />
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox>
              )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}
