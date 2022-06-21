import { DocumentationTypeIcon } from '../../../helpers/Icons'
import AddConfluence from './AddConfluence'
import { addDocumentationMap, AddDocumentationType } from './AddDocumentation'
import AddGoogleDocs from './AddGoogleDocs'
import AddNotion from './AddNotion'

type DocConfigSettings = {
  inputComponent: JSX.Element | null
}

type DocumentationConfigProps = {
  documentationType?: AddDocumentationType
  onCancel: () => void
  setIsAddDocumentationOpen: (isOpen: boolean) => void
  setIsAddDocLoading: (isAddingAutomation: boolean) => void
}

export default function DocumentationConfig({
  documentationType,
  onCancel,
  setIsAddDocumentationOpen,
  setIsAddDocLoading,
}: DocumentationConfigProps) {
  if (documentationType == null) {
    return null
  }

  const configOptions: Record<AddDocumentationType, DocConfigSettings> = {
    notion: {
      inputComponent: (
        <AddNotion />
      ),
    },
    googledocs: {
      inputComponent: <AddGoogleDocs
      onCancel={onCancel}
      setIsAddDocumentationOpen={setIsAddDocumentationOpen}
      setIsAddDocLoading={setIsAddDocLoading}
    />,
    },
    confluence: {
      inputComponent: <AddConfluence />,
    },
  }

  const ruleData = addDocumentationMap[documentationType]
  const ConfigureInput = () => {
    return configOptions[documentationType].inputComponent
  }

  return (
    <div className="px-6 py-6 z-10">
      <div>
        <div className="flex space-x-4">
          <DocumentationTypeIcon type={documentationType} />
          <div>
            <h1 className="text-sm font-medium text-gray-900">{ruleData.title}</h1>
            <p className="text-sm text-gray-500">{ruleData.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <ConfigureInput />
        </div>
      </div>
    </div>
  )
}
