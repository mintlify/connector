import { Fragment, useState } from 'react'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { PlusIcon, LinkIcon } from '@heroicons/react/solid'
import { FolderAddIcon, FolderIcon, HashtagIcon, TagIcon } from '@heroicons/react/outline'
import { classNames } from '../helpers/functions'

const quickActions = [
  { name: 'Add website link', icon: LinkIcon, shortcut: 'L', url: '#' },
  { name: 'Add Notion page', icon: FolderAddIcon, shortcut: 'N', url: '#' },
  { name: 'Add Google docs', icon: HashtagIcon, shortcut: 'G', url: '#' },
  { name: 'Add Confluence page', icon: TagIcon, shortcut: 'C', url: '#' },
]

type AddDocumentCommandProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void,
}

export default function AddDocumentCommand({ isOpen, setIsOpen }: AddDocumentCommandProps) {
  const [query, setQuery] = useState('');

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setQuery('')} appear>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={(item) => {}} value={''}>
                <div className="relative rounded-xl">
                  <PlusIcon
                    className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full rounded-t-xl border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-0"
                    placeholder="Add link"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                {(query === '') && (
                  <Combobox.Options static className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto">
                    {query === '' && (
                      <li className="p-2">
                        <h2 className="sr-only">Quick actions</h2>
                        <ul className="text-sm text-gray-700">
                          {quickActions.map((action) => (
                            <Combobox.Option
                              key={action.shortcut}
                              value={action}
                              className={({ active }) =>
                                classNames(
                                  'flex cursor-default select-none items-center rounded-md px-3 py-2',
                                  active ? 'bg-primary text-white' : ''
                                )
                              }
                            >
                              {({ active }) => (
                                <>
                                  <action.icon
                                    className={classNames('h-6 w-6 flex-none', active ? 'text-white' : 'text-gray-400')}
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">{action.name}</span>
                                  <span
                                    className={classNames(
                                      'ml-3 flex-none text-xs font-semibold',
                                      active ? 'text-indigo-100' : 'text-gray-400'
                                    )}
                                  >
                                    <kbd className="font-sans">⌘</kbd>
                                    <kbd className="font-sans">{action.shortcut}</kbd>
                                  </span>
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}
                  </Combobox.Options>
                )}

                {query !== '' &&  (
                  <div className="py-14 px-6 text-center sm:px-14">
                    <FolderIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 text-sm text-gray-900">
                      We couldn&apos;t find any projects with that term. Please try again.
                    </p>
                  </div>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}