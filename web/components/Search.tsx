import { Fragment, useEffect, useState } from 'react'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { SearchIcon } from '@heroicons/react/solid'
import { DocumentTextIcon, ExclamationIcon } from '@heroicons/react/outline'
import { classNames } from '../helpers/functions'
import axios from 'axios'
import { API_ENDPOINT } from '../helpers/api'
import { Org, User } from '../pages'

type DocResult = {
  objectID: string,
  name: string,
  content: string,
  url: string,
  org: string,
  favicon?: string,
}

type SearchResults = {
  docs: DocResult[],
}

type SearchProps = {
  user: User,
  org: Org,
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
}

export default function Search({ user, org, isOpen, setIsOpen }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ docs: [] });

  useEffect(() => {
    if (!query) {
      setResults({ docs: [] });
      return;
    }

    axios.get(`${API_ENDPOINT}/routes/search`, {
      params: {
        query,
        orgId: org._id
      }
    })
      .then(({ data: { results } }: { data: { results: SearchResults } }) => {
        setResults(results)
      })
  }, [query, user, org._id]);

  if (!isOpen) {
    return null;
  }

  const docsResults = results.docs;

  const onSelectionChange = (result: any) => {
    if (result.type != null) {
      setIsOpen(false);
      return
    }

    axios.get(`${API_ENDPOINT}/routes/search/click`, {
      params: {
        userId: user.userId,
      }
    })

    window.open(result.url, '_blank')
  }

  const onClose = () => {
    setQuery('');
    setIsOpen(false);
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox value={query} onChange={onSelectionChange}>
                <div className="relative">
                  <SearchIcon
                    className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                {docsResults.length > 0 && (
                  <Combobox.Options
                    static
                    className="max-h-80 scroll-py-10 scroll-py-10 scroll-pb-2 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
                  >
                    {docsResults.length > 0 && (
                      <li>
                        <h2 className="text-xs font-semibold text-gray-900">Documentation</h2>
                        <ul className="-mx-4 mt-2 text-sm text-gray-700">
                          {docsResults.map((docResult) => (
                            <Combobox.Option
                              key={docResult.objectID}
                              value={docResult}
                              className={({ active }) =>
                                classNames(
                                  'flex cursor-pointer select-none items-center px-4 py-2',
                                  active ? 'bg-primary text-white' : ''
                                )
                              }
                            >
                              {({ active }) => (
                                <>
                                {
                                  docResult.favicon
                                    ? <img className={classNames('h-6 w-6 flex-none', active ? 'grayscale brightness-200' : '')} src={docResult.favicon} alt="Logo" />
                                    : <DocumentTextIcon
                                        className={classNames('h-6 w-6 flex-none', active ? 'text-white' : 'text-gray-400')}
                                        aria-hidden="true"
                                      />
                                }
                                  <span className="ml-2 flex-auto truncate">{docResult.name}</span>
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}
                  </Combobox.Options>
                )}

                {query !== '' && query !== '?' && docsResults.length === 0 && (
                  <div className="py-14 px-6 text-center text-sm sm:px-14">
                    <ExclamationIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-gray-900">No results found</p>
                    <p className="mt-2 text-gray-500">We couldn’t find anything with that query</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center bg-gray-50 py-2.5 px-4 text-xs text-gray-700">
                  Universal search across all documentation. Type
                  <kbd
                    className={classNames(
                      'mx-1 flex h-5 px-1 items-center justify-center rounded border bg-white border-gray-400 text-gray-900 font-medium sm:mx-1',
                    )}
                  >
                    esc
                  </kbd>{' '}
                  to close
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}