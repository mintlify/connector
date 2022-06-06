import axios from 'axios';
import { ReactComponentElement, useEffect, useState } from 'react'
import { API_ENDPOINT } from '../../../helpers/api';
import { classNames } from '../../../helpers/functions'
import { DocumentationTypeIcon } from '../../../helpers/Icons';
import { getSubdomain } from '../../../helpers/user';
import { User } from '../../../pages';
import { addDocumentationMap, AddDocumentationType } from './AddDocumentation';
import AddWebpage, { isUrlValid } from './AddWebpage';

type DocumentationConfigProps = {
  user: User,
  documentationType?: AddDocumentationType,
  onCancel: () => void,
  setIsAddDocumentationOpen: (isOpen: boolean) => void,
  setIsAddDocLoading: (isAddingAutomation: boolean) => void;
}

export default function DocumentationConfig(
    { user, documentationType, onCancel, setIsAddDocumentationOpen, setIsAddDocLoading }: DocumentationConfigProps
  ) {
  const [webpageValue, setWebpageValue] = useState('');

  useEffect(() => {
  }, [user, documentationType]);

  if (documentationType == null) {
    return null;
  }

  const onBackButton = () => {
    setWebpageValue('');
    onCancel();
  }

  const configOptions: Record<AddDocumentationType, { validation: boolean, inputComponent: JSX.Element | null, onSubmit: () => void }> = {
    webpage: {
      validation: isUrlValid(webpageValue),
      inputComponent: <AddWebpage value={webpageValue} setValue={setWebpageValue} />,
      onSubmit: () => {
        setIsAddDocLoading(true);
        axios
          .post(
            `${API_ENDPOINT}/routes/docs`,
            {
              url: webpageValue,
            },
            {
              params: {
                userId: user.userId,
                subdomain: getSubdomain(window.location.host),
              },
            }
        ).then(() => setIsAddDocLoading(false))
      }
    },
    // notion: {
    //   validation: false,
    //   inputComponent: null,
    //   onSubmit: () => {}
    // },
    // confluence: {
    //   validation: false,
    //   inputComponent: null,
    //   onSubmit: () => {}
    // },
    // googledocs: {
    //   validation: false,
    //   inputComponent: null,
    //   onSubmit: () => {}
    // }
  }

  const onCreateButton = async () => {
    configOptions[documentationType].onSubmit();
    setIsAddDocumentationOpen(false);
  }

  const ruleData = addDocumentationMap[documentationType];
  const ConfigureInput = () => {
    return configOptions[documentationType].inputComponent;
  }

  const isCompletedForm = configOptions[documentationType].validation;
  
  return <div className="px-6 py-6 z-10">
    <div>
      <div className="flex space-x-4">
        <DocumentationTypeIcon
          type={documentationType}
        />
        <div>
          <h1 className="text-sm font-medium text-gray-900">{ruleData.title}</h1>
          <p className="text-sm text-gray-500">
            {ruleData.description}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <ConfigureInput />
      </div>

      <div className="mt-4 flex justify-end">
        {/* <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={onBackButton}
        >
          Back
        </button> */}
        <button
          type="submit"
          disabled={!isCompletedForm}
          className={classNames("ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
          isCompletedForm ? "bg-primary hover:bg-hover" : "bg-gray-300 cursor-default")}
          onClick={onCreateButton}
        >
          Add Documentation
        </button>
      </div>
    </div>
  </div>
}