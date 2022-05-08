import { Fragment, useState } from 'react'
import { Combobox, Dialog, RadioGroup, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { getRuleTypeIcon } from '../../helpers/Icons';
import { RuleType } from '../../pages/rules';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/solid';

type RuleItem = {
  id: string,
  type: RuleType,
  title: string,
  description: string,
}

const ruleItems: RuleItem[] = [
  {
    id: '1',
    type: 'Update',
    title: 'Require documentation review',
    description: 'Require reviews when relevant code changes',
  },
  {
    id: '2',
    type: 'Notification',
    title: 'Send alert on change',
    description: 'Be notified when documentation or code changes',
  },
];

type AddRuleProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void,
}

export default function AddRule({ isOpen, setIsOpen }: AddRuleProps) {
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(null);

  const onToPrimarySelection = () => {
    setSelectedRuleType(null);
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
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
              { selectedRuleType && (
                <RuleConfig onCancel={onToPrimarySelection} />
              ) }
              {
                selectedRuleType == null && (<Combobox onChange={() => {}} value="">
                  <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                    {ruleItems.map((item) => (
                      <Combobox.Option
                        key={item.id}
                        value={item}
                        className={({ active }) =>
                          classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                        }
                        onClick={() => setSelectedRuleType(item.type)}
                      >
                        {({ active }) => (
                          <>
                            {getRuleTypeIcon(item.type)}
                            <div className="ml-4 flex-auto">
                              <p
                                className={classNames(
                                  'text-sm font-medium',
                                  active ? 'text-gray-900' : 'text-gray-700'
                                )}
                              >
                                {item.title}
                              </p>
                              <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                                {item.description}
                              </p>
                            </div>
                            <ChevronRightIcon
                              className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
              </Combobox>)
              }
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

function RuleConfig({ onCancel }: { onCancel: () => void }) {
  return <form className="px-6 py-6">
  <div className="space-y-5">
    <div className="flex space-x-4">
      {getRuleTypeIcon('Update')}
      <div>
        <h1 className="text-sm font-medium text-gray-900">Require documentation update</h1>
        <p className="text-sm text-gray-500">
          Enforce updates when relevant code changes
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <div className="space-y-1">
        <label htmlFor="add-team-members" className="block text-sm font-medium text-gray-700">
          Repository
        </label>
        <p id="add-team-members-helper" className="sr-only">
          Search by email address
        </p>
        <div className="flex">
          <div className="flex-grow">
            <input
              type="text"
              name="add-team-members"
              id="add-team-members"
              className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
              aria-describedby="add-team-members-helper"
            />
          </div>
          <span className="ml-3">
            <button
              type="button"
              className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <PlusIcon className="-ml-2 mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>GitHub</span>
            </button>
          </span>
        </div>
      </div>
    </div>

    <div>
      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
        Tags
      </label>
      <input
        type="text"
        name="tags"
        id="tags"
        className="mt-1 block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
      />
    </div>

    <div className="flex justify-end">
      <button
        type="button"
        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={onCancel}
      >
        Back
      </button>
      <button
        type="submit"
        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary"
      >
        Create Rule
      </button>
    </div>
  </div>
</form>
}