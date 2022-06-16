import { Org, User } from '../../../context/ProfileContex'
import { DocumentationTypeIcon } from '../../../helpers/Icons'
import AddConfluence from './AddConfluence'
import { addDocumentationMap, AddDocumentationType } from './AddDocumentation'
import AddGoogleDocs from './AddGoogleDocs'
import AddNotion from './AddNotion'
import AddWebpage from './AddWebpage'

type DocConfigSettings = {
  inputComponent: JSX.Element | null
}

type DocumentationConfigProps = {
  user: User
  org: Org
  documentationType?: AddDocumentationType
  onCancel: () => void
  setIsAddDocumentationOpen: (isOpen: boolean) => void
  setIsAddDocLoading: (isAddingAutomation: boolean) => void
}

export default function DocumentationConfig({
  user,
  org,
  documentationType,
  onCancel,
  setIsAddDocumentationOpen,
  setIsAddDocLoading,
}: DocumentationConfigProps) {
  if (documentationType == null) {
    return null
  }

  const configOptions: Record<AddDocumentationType, DocConfigSettings> = {
    webpage: {
      inputComponent: (
        <AddWebpage
          user={user}
          onCancel={onCancel}
          setIsAddDocumentationOpen={setIsAddDocumentationOpen}
          setIsAddDocLoading={setIsAddDocLoading}
        />
      ),
    },
    notion: {
      inputComponent: (
        <AddNotion
          user={user}
          org={org}
          onCancel={onCancel}
          setIsAddDocumentationOpen={setIsAddDocumentationOpen}
          setIsAddDocLoading={setIsAddDocLoading}
        />
      ),
    },
    googledocs: {
      inputComponent: <AddGoogleDocs
      user={user}
      org={org}
      onCancel={onCancel}
      setIsAddDocumentationOpen={setIsAddDocumentationOpen}
      setIsAddDocLoading={setIsAddDocLoading}
    />,
    },
    confluence: {
      inputComponent: <AddConfluence
      user={user}
      org={org}
      onCancel={onCancel}
      setIsAddDocumentationOpen={setIsAddDocumentationOpen}
      setIsAddDocLoading={setIsAddDocLoading}
    />,
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
