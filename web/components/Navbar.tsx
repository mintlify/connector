import { Fragment, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import {
  SearchIcon,
  MenuIcon
} from '@heroicons/react/solid'
import { XIcon } from '@heroicons/react/outline'
import { classNames } from '../helpers/functions'
import Link from 'next/link'
import ProfilePicture from './ProfilePicture'
import Search from './Search'
import { useProfile } from '../context/ProfileContext'

const userNavigation = [
  { name: 'Account', href: '/settings/account' },
  { name: 'Organization', href: '/settings/organization' },
  { name: 'Integrations', href: '/settings/integrations' },
  { name: 'Sign out', href: '/api/logout' },
]

export default function Navbar() {
  const { profile } = useProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useHotkeys('cmd+k', () => setIsSearchOpen(true));

  const { user, org } = profile;
  if (user == null || org == null) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  
  return (
    <>
    <Search
      isOpen={isSearchOpen}
      setIsOpen={setIsSearchOpen}
    />
    <Disclosure as="nav" className="bg-background z-20">
      {({ open }) => (
        <>
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="pr-16 sm:text-center sm:px-16">
              <p className="font-medium text-white text-sm">
                <span className="inline">14 days left on the trial</span>
                <span className="block sm:ml-2 sm:inline-block">
                  <a href="#" className="text-white font-bold underline">
                    {' '}
                    Upgrade now <span aria-hidden="true">&rarr;</span>
                  </a>
                </span>
              </p>
            </div>
            <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
              <button
                type="button"
                className="flex p-2 rounded-md hover:bg-hover focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="relative flex items-center justify-between h-16 flex-row">
              <div className="flex items-center px-2 lg:px-0">
                <Link href="/">
                  <button className="flex-shrink-0">
                    <img
                      className="block h-5 w-auto"
                      src={org.logo || "/assets/mintlify-worded.svg"}
                      alt="Mintlify"
                    />
                  </button>
                </Link>
              </div>
              <div className="flex lg:justify-end focus:outline-none">
                <button
                  className="md:w-96 lg:max-w-xs w-full"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative cursor-pointer">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none hover:bg-gray-600 sm:text-sm cursor-pointer"
                      placeholder="Search"
                      disabled
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <kbd className="inline-flex items-center border border-gray-200 border-opacity-60 rounded px-2 text-sm font-sans font-medium text-gray-400">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="hidden lg:block lg:ml-4">
                <div className="flex flex-row-reverse">

                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-4 relative flex-shrink-0">
                    <Menu.Button className="bg-gray-800 rounded-full flex text-sm text-white">
                      <span className="sr-only">Open user menu</span>
                      <ProfilePicture
                        size={8}
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                     <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                        <div className="px-4 py-3">
                          <p className="text-sm">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                        <Link href="/settings/account">
                            <Menu.Item>
                              {({ active }) => (
                                  <a
                                    className={classNames(
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                      'block px-4 py-2 text-sm cursor-pointer'
                                    )}
                                  >
                                    Account settings
                                  </a>
                              )}
                            </Menu.Item>
                          </Link>
                          <Link href="/settings/organization">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block px-4 py-2 text-sm cursor-pointer'
                                )}
                              >
                                Organization
                              </a>
                            )}
                          </Menu.Item>
                          </Link>
                          <Link href="/settings/integrations">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block px-4 py-2 text-sm cursor-pointer'
                                )}
                              >
                                Integrations
                              </a>
                            )}
                          </Menu.Item>
                          </Link>
                        </div>
                        <div className="py-1">
                        <Link href="/api/logout">
                          <Menu.Item>
                            {({ active }) => (
                                <button
                                  type="submit"
                                  className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'block w-full text-left px-4 py-2 text-sm'
                                  )}
                                >
                                  Sign out
                                </button>
                            )}
                          </Menu.Item>
                          </Link>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <ProfilePicture
                    size={10}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{fullName}</div>
                  <div className="text-sm font-medium text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {
                  userNavigation.map((nav) => (
                    <Disclosure.Button
                      as="a"
                      key={nav.name}
                      href={nav.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      {nav.name}
                    </Disclosure.Button>
                  ))
                }
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
    </>
  )
}