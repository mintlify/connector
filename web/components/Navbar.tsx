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
import { useRouter } from 'next/router'
import ProfilePicture from './ProfilePicture'
import { Org, User } from '../pages'
import Search from './Search'

const navigation = [
  {
    name: 'Overview',
    href: '/',
  },
  {
    name: 'Automations',
    href: '/automations',
  }
]

const userNavigation = [
  { name: 'Settings', href: '/settings' },
  { name: 'Sign out', href: '/api/logout' },
]

const navButtonClass = (isActive: boolean) => {
  return isActive
    ? 'bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-800'
    : 'text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer'
}

type NavbarProps = {
  user: User,
  org: Org
}

export default function Navbar({ user, org }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const fullName = `${user.firstName} ${user.lastName}`;

  useHotkeys('cmd+k', () => setIsSearchOpen(true));
  
  return (
    <>
    <Search
      user={user}
      org={org}
      isOpen={isSearchOpen}
      setIsOpen={setIsSearchOpen}
    />
    <Disclosure as="nav" className="bg-background z-20">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
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
                <div className="hidden lg:block lg:ml-6">
                  <div className="flex space-x-4">
                    {
                      navigation.map((nav) => (
                        <Link
                          key={nav.name}
                          href={nav.href}
                        >
                          <span className={navButtonClass(router.pathname === nav.href)}>
                            {nav.name}
                          </span>
                        </Link>
                      ))
                    }
                  </div>
                </div>
              </div>
              <button
                className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end focus:outline-none"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="max-w-lg w-full lg:max-w-xs">
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
                </div>
              </button>
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
              <div className="hidden flex-1 lg:block lg:ml-4">
                <div className="flex flex-row-reverse">

                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-4 relative flex-shrink-0">
                    <div>
                      <Menu.Button className="bg-gray-800 rounded-full flex text-sm text-white">
                        <span className="sr-only">Open user menu</span>
                        <ProfilePicture
                          size={8}
                          user={user}
                        />
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
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        {
                          userNavigation.map((nav) => (
                          <Menu.Item key={nav.href}>
                            {({ active }) => (
                              <a
                                href={nav.href}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {nav.name}
                              </a>
                            )}
                          </Menu.Item>))
                        }
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {
                navigation.map((nav) => (
                  <Disclosure.Button
                    key={nav.name}
                    as="a"
                    href={nav.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    {nav.name}
                  </Disclosure.Button>
                  )
                )
              }
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <ProfilePicture
                    size={10}
                    user={user}
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