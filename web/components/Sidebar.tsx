import { useIntercom } from 'react-use-intercom';
import { ChatAlt2Icon, ViewGridAddIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import AddDocumentation from './commands/documentation/AddDocumentation'
import ProfilePicture from './ProfilePicture';
import { useProfile } from '../context/ProfileContext';
import { IntegrationsStatus } from '../pages';
import { ConnectIcon } from '../helpers/Icons';

type SidebarProps = {
  isAddDocumentOpen: boolean;
  setIsAddDocumentOpen: (isAddingDoc: boolean) => void;
  integrationsStatus: IntegrationsStatus;
  refresh: () => void,
}

export default function Sidebar({
  isAddDocumentOpen,
  setIsAddDocumentOpen,
  integrationsStatus,
  refresh
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
      integrationsStatus={integrationsStatus}
      refresh={refresh}
    />
    <div className="xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200">
      <div className="pl-4 pr-6 py-6 md:pl-6 lg:pl-8 xl:pl-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-8 z-10">
            <div className="space-y-8 md:space-y-0 md:flex md:justify-between md:items-center xl:block xl:space-y-8">
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
              <div className="flex flex-col md:flex-row xl:flex-col">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-hover xl:w-full"
                  onClick={() => setIsAddDocumentOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/>
                  </svg>
                  Import Documentation
                </button>
                <Link href="vscode://mintlify.connector/prefill-doc?docId=id">
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:mt-0 md:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  >
                    <ConnectIcon className="h-3 mr-1.5" />
                    Create Code Connection
                  </button>
                </Link>
              </div>
            </div>
            {/* Meta info */}
            <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-5">
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