import type { NextPage } from 'next'
import { Menu } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  StarIcon,
} from '@heroicons/react/solid'
import Sidebar from './components/Sidebar'
import { classNames } from './helpers/functions'

const projects = [
  {
    name: 'Workcation',
    href: '#',
    siteHref: '#',
    repoHref: '#',
    repo: 'debbielewis/workcation',
    lastDeploy: '3h ago',
    location: 'United states',
    starred: true,
    active: true,
  },
  {
    name: 'Workcation',
    href: '#',
    siteHref: '#',
    repoHref: '#',
    repo: 'debbielewis/workcation',
    lastDeploy: '3h ago',
    location: 'United states',
    starred: true,
    active: true,
  },
  // More projects...
]
const activityItems = [
  { project: 'Workcation', commit: '2d89f0c8', environment: 'production', time: '1h' },
  // More items...
]

const Home: NextPage = () => {
  return (
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 bg-white xl:flex">
        <Sidebar />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
            <div className="flex items-center">
              <h1 className="flex-1 text-lg font-medium">Sources</h1>
              <Menu as="div" className="relative">
                <Menu.Button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <SortAscendingIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Sort
                  <ChevronDownIcon className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items className="origin-top-right z-10 absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                          Name
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
                          Date modified
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
                          Date created
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
          <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
            {projects.map((project) => (
              <li
                key={project.repo}
                className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
              >
                <div className="flex items-center justify-between space-x-4">
                  {/* Repo name and link */}
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={classNames(
                          project.active ? 'bg-green-100' : 'bg-gray-100',
                          'h-4 w-4 rounded-full flex items-center justify-center'
                        )}
                        aria-hidden="true"
                      >
                        <span
                          className={classNames(
                            project.active ? 'bg-green-400' : 'bg-gray-400',
                            'h-2 w-2 rounded-full'
                          )}
                        />
                      </span>

                      <span className="block">
                        <h2 className="text-sm font-medium">
                          <a href={project.href}>
                            <span className="absolute inset-0" aria-hidden="true" />
                            {project.name}{' '}
                            <span className="sr-only">{project.active ? 'Running' : 'Not running'}</span>
                          </a>
                        </h2>
                      </span>
                    </div>
                    <a href={project.repoHref} className="relative group flex items-center space-x-2.5">
                      <svg
                        className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-gray-500"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.99917 0C4.02996 0 0 4.02545 0 8.99143C0 12.9639 2.57853 16.3336 6.15489 17.5225C6.60518 17.6053 6.76927 17.3277 6.76927 17.0892C6.76927 16.8762 6.76153 16.3104 6.75711 15.5603C4.25372 16.1034 3.72553 14.3548 3.72553 14.3548C3.31612 13.316 2.72605 13.0395 2.72605 13.0395C1.9089 12.482 2.78793 12.4931 2.78793 12.4931C3.69127 12.5565 4.16643 13.4198 4.16643 13.4198C4.96921 14.7936 6.27312 14.3968 6.78584 14.1666C6.86761 13.5859 7.10022 13.1896 7.35713 12.965C5.35873 12.7381 3.25756 11.9665 3.25756 8.52116C3.25756 7.53978 3.6084 6.73667 4.18411 6.10854C4.09129 5.88114 3.78244 4.96654 4.27251 3.72904C4.27251 3.72904 5.02778 3.48728 6.74717 4.65082C7.46487 4.45101 8.23506 4.35165 9.00028 4.34779C9.76494 4.35165 10.5346 4.45101 11.2534 4.65082C12.9717 3.48728 13.7258 3.72904 13.7258 3.72904C14.217 4.96654 13.9082 5.88114 13.8159 6.10854C14.3927 6.73667 14.7408 7.53978 14.7408 8.52116C14.7408 11.9753 12.6363 12.7354 10.6318 12.9578C10.9545 13.2355 11.2423 13.7841 11.2423 14.6231C11.2423 15.8247 11.2313 16.7945 11.2313 17.0892C11.2313 17.3299 11.3937 17.6097 11.8501 17.522C15.4237 16.3303 18 12.9628 18 8.99143C18 4.02545 13.97 0 8.99917 0Z"
                          fill="currentcolor"
                        />
                      </svg>
                      <span className="text-sm text-gray-500 group-hover:text-gray-900 font-medium truncate">
                        {project.repo}
                      </span>
                    </a>
                  </div>
                  <div className="sm:hidden">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  {/* Repo meta info */}
                  <div className="hidden sm:flex flex-col flex-shrink-0 items-end space-y-3">
                    <p className="flex items-center space-x-4">
                      <a
                        href={project.siteHref}
                        className="relative text-sm text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Visit site
                      </a>
                      <button
                        type="button"
                        className="relative bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <span className="sr-only">
                          {project.starred ? 'Add to favorites' : 'Remove from favorites'}
                        </span>
                        <StarIcon
                          className={classNames(
                            project.starred
                              ? 'text-yellow-300 hover:text-yellow-400'
                              : 'text-gray-300 hover:text-gray-400',
                            'h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </p>
                    <p className="flex text-gray-500 text-sm space-x-2">
                      <span>Last deploy {project.lastDeploy}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{project.location}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Activity feed */}
      <div className="bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0">
        <div className="pl-6 lg:w-80">
          <div className="pt-6 pb-2">
            <h2 className="text-sm font-semibold">Activity</h2>
          </div>
          <div>
            <ul role="list" className="divide-y divide-gray-200">
              {activityItems.map((item) => (
                <li key={item.commit} className="py-4">
                  <div className="flex space-x-3">
                    <img
                      className="h-6 w-6 rounded-full"
                      src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
                      alt=""
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">You</h3>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Deployed {item.project} ({item.commit} in master) to {item.environment}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="py-4 text-sm border-t border-gray-200">
              <a href="#" className="text-primary font-semibold hover:text-hover">
                View all activity <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
