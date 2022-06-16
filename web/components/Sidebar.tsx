import { useIntercom } from 'react-use-intercom';
import { ChatAlt2Icon, CogIcon, DocumentTextIcon, LightningBoltIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import AddDocumentation from './commands/documentation/AddDocumentation'
import ProfilePicture from './ProfilePicture';
import { Org, User } from '../context/ProfileContex';

type SidebarProps = {
  user: User;
  org: Org;
  setIsAddDocLoading: (isAddingDoc: boolean) => void;
  isAddDocumentOpen: boolean;
  setIsAddDocumentOpen: (isAddingDoc: boolean) => void;
}

export default function Sidebar({
  user,
  org,
  setIsAddDocLoading,
  isAddDocumentOpen,
  setIsAddDocumentOpen
}: SidebarProps) {
  const { boot, show } = useIntercom();
  const fullName = user.firstName + ' ' + user.lastName;
  const onClickHelp = () => {
    boot({ userId: user.userId, email: user.email, company: { companyId: org._id, name: org.name } })
    show();
  }

  return (
    <>
    <AddDocumentation
      user={user}
      org={org}
      isOpen={isAddDocumentOpen}
      setIsOpen={setIsAddDocumentOpen}
      setIsAddDocLoading={setIsAddDocLoading}
    />
    <div className="xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200">
      <div className="pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-8 z-10">
            <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between sm:items-center xl:block xl:space-y-8">
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <ProfilePicture
                    size={12}
                    user={user}
                  />
                </div>
                <div className="space-y-px">
                  <div className="text-sm font-medium text-gray-900">{fullName}</div>
                  <a href="#" className="group flex items-center space-x-1 group-hover:text-gray-900">
                    <span className="text-sm text-gray-500 font-medium">
                      {org.name}
                    </span>
                  </a>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row xl:flex-col">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-hover xl:w-full"
                  onClick={() => setIsAddDocumentOpen(true)}
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Add Documentation
                </button>
                <Link href="vscode://mintlify.connector/prefill-doc?docId=id">
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  >
                    <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M305.8 2.076C314.4 5.932 320 14.52 320 24V64H336C406.7 64 464 121.3 464 192V358.7C492.3 371 512 399.2 512 432C512 476.2 476.2 512 432 512C387.8 512 352 476.2 352 432C352 399.2 371.7 371 400 358.7V192C400 156.7 371.3 128 336 128H320V168C320 177.5 314.4 186.1 305.8 189.9C297.1 193.8 286.1 192.2 279.9 185.8L199.9 113.8C194.9 109.3 192 102.8 192 96C192 89.2 194.9 82.71 199.9 78.16L279.9 6.161C286.1-.1791 297.1-1.779 305.8 2.077V2.076zM432 456C445.3 456 456 445.3 456 432C456 418.7 445.3 408 432 408C418.7 408 408 418.7 408 432C408 445.3 418.7 456 432 456zM112 358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 .0004 80 .0004C124.2 .0004 160 35.82 160 80C160 112.8 140.3 140.1 112 153.3V358.7zM80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56zM80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408z"/></svg>
                    Add Review Check
                  </button>
                </Link>
              </div>
            </div>
            {/* Meta info */}
            <div className="flex flex-col space-y-5 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-5">
              <Link href="/settings/organization#invite">
                <div className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-gray-700">
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">Invite team member</span>
                </div>
              </Link>
              <Link href="/settings/organization#integrations">
                <div className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-gray-700">
                  <ViewGridAddIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">Manage Integrations</span>
                </div>
              </Link>
              <button onClick={onClickHelp}>
                <div className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-gray-700">
                  <ChatAlt2Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">Help</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}