import { useIntercom } from 'react-use-intercom';
import { ChatAlt2Icon, CogIcon, DocumentTextIcon, LightningBoltIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import AddDocumentation from './commands/documentation/AddDocumentation'
import ProfilePicture from './ProfilePicture';
import { Org, useProfile, User } from '../context/ProfileContext';

type SidebarProps = {
  setIsAddDocLoading: (isAddingDoc: boolean) => void;
  isAddDocumentOpen: boolean;
  setIsAddDocumentOpen: (isAddingDoc: boolean) => void;
}

export default function Sidebar({
  setIsAddDocLoading,
  isAddDocumentOpen,
  setIsAddDocumentOpen
}: SidebarProps) {
  const { boot, show } = useIntercom();
  const { profile } = useProfile();

  const { user, org } = profile;
  if (user == null || org == null) {
    return null;
  }

  const fullName = user.firstName + ' ' + user.lastName;
  const onClickHelp = () => {
    boot({ userId: user.userId, email: user.email, company: { companyId: org._id, name: org.name } })
    show();
  }

  return (
    <>
    <AddDocumentation
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
                    <svg className="h-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path d="M414.8 40.79L286.8 488.8C281.9 505.8 264.2 515.6 247.2 510.8C230.2 505.9 220.4 488.2 225.2 471.2L353.2 23.21C358.1 6.216 375.8-3.624 392.8 1.232C409.8 6.087 419.6 23.8 414.8 40.79H414.8zM518.6 121.4L630.6 233.4C643.1 245.9 643.1 266.1 630.6 278.6L518.6 390.6C506.1 403.1 485.9 403.1 473.4 390.6C460.9 378.1 460.9 357.9 473.4 345.4L562.7 256L473.4 166.6C460.9 154.1 460.9 133.9 473.4 121.4C485.9 108.9 506.1 108.9 518.6 121.4V121.4zM166.6 166.6L77.25 256L166.6 345.4C179.1 357.9 179.1 378.1 166.6 390.6C154.1 403.1 133.9 403.1 121.4 390.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4L121.4 121.4C133.9 108.9 154.1 108.9 166.6 121.4C179.1 133.9 179.1 154.1 166.6 166.6V166.6z"/>
                    </svg>
                    Create Code Connection
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
              <Link href="/settings/integrations">
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