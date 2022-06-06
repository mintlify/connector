import { ReactElement, useEffect } from 'react'
import { classNames } from '../../../helpers/functions'
import { DocumentationTypeIcon } from '../../../helpers/Icons';
import { User } from '../../../pages';
import { addDocumentationMap, AddDocumentationType } from './AddDocumentation';

type DocumentationConfig = {
  user: User,
  documentationType?: AddDocumentationType,
  onCancel: () => void,
  setIsAddDocumentationOpen: (isOpen: boolean) => void,
  setIsAddingDocumentation?: (isAddingAutomation: boolean) => void;
}

export default function DocumentationConfig(
    { user, documentationType, onCancel, setIsAddDocumentationOpen, setIsAddingDocumentation }: DocumentationConfig
  ) {
  
  useEffect(() => {
  }, [user, documentationType]);

  if (documentationType == null) {
    return null;
  }

  const onBackButton = () => {
    onCancel();
  }

  const onCreateButton = async () => {
    setIsAddDocumentationOpen(false);
  }

  const ruleData = addDocumentationMap[documentationType];
  const isCompletedForm = false;
  
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
          <div className="mt-4"></div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={onBackButton}
        >
          Back
        </button>
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