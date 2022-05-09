import { CogIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import { useState } from 'react'
import AddDocument from './commands/AddDocument'
import AddAutomation from './commands/AddAutomation'

export default function Sidebar() {
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
  return (
    <>
    <AddDocument
      isOpen={isAddDocumentOpen}
      setIsOpen={setIsAddDocumentOpen}
    />
    <AddAutomation
      isOpen={isAddAutomationOpen}
      setIsOpen={setIsAddAutomationOpen}
    />
    <div className="xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200">
      <div className="pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-8">
            <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between sm:items-center xl:block xl:space-y-8">
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="https://res.cloudinary.com/mintlify/image/upload/v1652115323/han_o6mnrb.jpg"
                    alt="Profile"
                  />
                </div>
                <div className="space-y-px">
                  <div className="text-sm font-medium text-gray-900">Han Wang</div>
                  <a href="#" className="group flex items-center space-x-1 group-hover:text-gray-900">
                    <span className="text-sm text-gray-500 font-medium">
                      Mintlify
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
                <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  onClick={() => setIsAddAutomationOpen(true)}
                >
                  Add Automation
                </button>
              </div>
            </div>
            {/* Meta info */}
            <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
              <div className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-gray-700">
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-medium">Invite team member</span>
              </div>
              <Link href="/settings">
                <div className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-gray-700">
                  <CogIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}