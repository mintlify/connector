import { Combobox } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useState } from "react";
import { classNames } from "../../helpers/functions";
import { DocumentationTypeIcon } from "../../helpers/Icons";
import { addDocumentationMap } from "../commands/documentation/AddDocumentation";

const rolesOptions = [
  { id: 'founder', title: 'Founder' },
  { id: 'executive', title: 'Executive' },
  { id: 'em', title: 'Engineering Manager' },
  { id: 'pm', title: 'Product Manager' },
  { id: 'engineer', title: 'Engineer' },
  { id: 'tw', title: 'Technical Writer' },
  { id: 'other', title: 'Other' },
]

const sizeOptions = [
  { id: '1', title: 'Individual' },
  { id: '2-5', title: '2 - 10' },
  { id: '11-50', title: '11 - 50' },
  { id: '51-200', title: '51 - 200' },
  { id: '200+', title: '200+' },
]

const appsOptions = [
  { id: 'github', title: 'GitHub' },
  { id: 'vscode', title: 'VS Code' },
  { id: 'slack', title: 'Slack' },
  { id: 'none', title: 'None of the above' },
]

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  return <div className="mt-4 flex space-x-2">
  {[0, 1, 2, 3].map((i) => (
      <>
        {
          i > currentStep && <span key={i} className="h-1 w-14 bg-slate-200 rounded-sm"></span>
        }
        {
          i <= currentStep && <span key={i} className="h-1 w-14 bg-primary rounded-sm"></span>
        }
      </>
    ))
  }
  </div>
}

export default function Onboarding() {
  const [step, setStep] = useState(0);

  const CurrentStep = () => {
    switch (step) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return null;
    }
  }

  const isLastPage = step === 3;

  const nextPage = () => {
    if (isLastPage) {
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="max-w-3xl mx-auto py-12">
          <CurrentStep />
          <div className="flex mt-8 space-x-2">
            {
              step > 0 && <button
              className="bg-white border border-gray-500 hover:bg-gray-100 py-1 px-6 rounded-sm text-gray-600"
              onClick={() => setStep(step - 1)}
            >Back</button>
            }
            <button
              className="bg-primary hover:bg-hover py-1 px-6 rounded-sm text-white"
              onClick={nextPage}
            >{isLastPage ? 'Complete' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step0() {
  const currentStep = 0;
  return <>
    <h1 className="text-3xl font-semibold">
      Welcome <span className="text-primary">Han</span> 👋
    </h1>
    <p className="mt-1 text-gray-600">
      First things first, tell us about yourself
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={roleOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={sizeOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </>;
}

function Step1() {
  const currentStep = 1;
  return <>
    <h1 className="text-3xl font-semibold">
      Let&apos;s add some <span className="text-primary">documentation</span> 🗃
    </h1>
    <p className="mt-1 text-gray-600">
      You can import or link your existing pages
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8 w-96 max-w-full">
      <div className="bg-white rounded-md shadow-md">
        <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
            {Object.values(addDocumentationMap).map((item) => (
              <Combobox.Option
                key={item.type}
                value={item}
                className={({ active }) =>
                  classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                }
                onClick={() => {}}
              >
                {({ active }) => (
                  <>
                    <DocumentationTypeIcon
                      type={item.type}
                    />
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
      </Combobox>
      </div>
      <div>
        <h1 className="text-lg">Documents added</h1>
        <div className="mt-2 bg-white rounded-md p-3 shadow-md">
          <div
                  className={classNames("relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer", false ? 'bg-gray-50' : '')}
                  onClick={() => {}}
                >
                  <div className="flex items-center justify-between space-x-4">
                    {/* Repo name and link */}
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="block">
                          <h2 className="text-sm font-medium text-gray-700">
                            <div className="flex items-center space-x-2">
                              <div>
                                {/* <DocTitleIcon doc={doc} /> */}
                              </div>
                              <Link
                                href={"https://google.com"}
                              >
                                <a target="_blank" className="decoration-gray-300 hover:underline">
                                  {/* {doc.title} */}
                                  Hey there
                                </a>
                              </Link>
                            </div>
                          </h2>
                        </span>
                      </div>
                      <a className="relative group flex items-center space-x-2.5">
                        <span className="flex items-center space-x-2.5 text-sm text-gray-500 truncate">
                          <div>
                            <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" className="w-3 h-3 text-gray-500">
                              <path fill="currentColor" fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
                            </svg>
                          </div>
                          <div>
                            Last updated f
                          </div>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
          </div>
        </div>
    </div>
  </>;
}

function Step2() {
  const currentStep = 2;
  return <>
    <h1 className="text-3xl font-semibold">
      Let&apos;s get you{' '}<span className="text-primary">integrated</span> 🔌
    </h1>
    <p className="mt-1 text-gray-600">
      Connect with the apps that you use
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={roleOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={sizeOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </>;
}

function Step3() {
  const currentStep = 3;
  return <>
    <h1 className="text-3xl font-semibold">
      Invite your{' '}<span className="text-primary">team</span> ✉️
    </h1>
    <p className="mt-1 text-gray-600">
      You can also do this later in the app
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={roleOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={sizeOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </>;
}