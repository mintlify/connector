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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/>
                  </svg>
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
                <Link href="vscode://mintlify.connector/prefill-doc?docId=id">
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 mr-1.5" viewBox="0 0 512 512"><path d="M490.3 40.4C512.2 62.27 512.2 97.73 490.3 119.6L460.3 149.7L362.3 51.72L392.4 21.66C414.3-.2135 449.7-.2135 471.6 21.66L490.3 40.4zM172.4 241.7L339.7 74.34L437.7 172.3L270.3 339.6C264.2 345.8 256.7 350.4 248.4 353.2L159.6 382.8C150.1 385.6 141.5 383.4 135 376.1C128.6 370.5 126.4 361 129.2 352.4L158.8 263.6C161.6 255.3 166.2 247.8 172.4 241.7V241.7zM192 63.1C209.7 63.1 224 78.33 224 95.1C224 113.7 209.7 127.1 192 127.1H96C78.33 127.1 64 142.3 64 159.1V416C64 433.7 78.33 448 96 448H352C369.7 448 384 433.7 384 416V319.1C384 302.3 398.3 287.1 416 287.1C433.7 287.1 448 302.3 448 319.1V416C448 469 405 512 352 512H96C42.98 512 0 469 0 416V159.1C0 106.1 42.98 63.1 96 63.1H192z"/></svg>
                    Add Update Request
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