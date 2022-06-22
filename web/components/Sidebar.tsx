import { useIntercom } from 'react-use-intercom';
import { ChatAlt2Icon, CogIcon, DocumentTextIcon, LightningBoltIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import AddDocumentation from './commands/documentation/AddDocumentation'
import ProfilePicture from './ProfilePicture';
import { useProfile } from '../context/ProfileContext';
import { IntegrationsStatus } from '../pages';

type SidebarProps = {
  setIsAddDocLoading: (isAddingDoc: boolean) => void;
  isAddDocumentOpen: boolean;
  setIsAddDocumentOpen: (isAddingDoc: boolean) => void;
  integrationsStatus: IntegrationsStatus;
}

export default function Sidebar({
  setIsAddDocLoading,
  isAddDocumentOpen,
  setIsAddDocumentOpen,
  integrationsStatus
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
      integrationsStatus={integrationsStatus}
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
                  Import Documentation
                </button>
                <Link href="vscode://mintlify.connector/prefill-doc?docId=id">
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  >
                    <svg className="h-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                      <path d="M0 256C0 167.6 71.63 96 160 96H256C273.7 96 288 110.3 288 128C288 145.7 273.7 160 256 160H160C106.1 160 64 202.1 64 256C64 309 106.1 352 160 352H256C273.7 352 288 366.3 288 384C288 401.7 273.7 416 256 416H160C71.63 416 0 344.4 0 256zM480 416H384C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352H480C533 352 576 309 576 256C576 202.1 533 160 480 160H384C366.3 160 352 145.7 352 128C352 110.3 366.3 96 384 96H480C568.4 96 640 167.6 640 256C640 344.4 568.4 416 480 416zM416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H224C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224H416z"/>
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