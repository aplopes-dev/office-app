import { DocumentEditor } from "@onlyoffice/document-editor-react";

const DOCUMENT_SERVER_URL = process.env.NEXT_PUBLIC_ONLYOFFICE_API_URL;
const DOCUMENT_CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL;

function onDocumentReady(event: any) {
  console.log("Document is loaded");
}

function onLoadComponentError(errorCode: any, errorDescription: any) {
  console.error(`Error loading component: ${errorCode} - ${errorDescription}`);
}

type OnlyofficeUploadProps = {
  fileType?: string;
  documentType?: string;
  key: string;
  title: string;
  url: string;
  token?: string;
};

export default function OnlyofficeUpload({
  fileType = "docx",
  documentType = "word",
  key,
  title,
  url,
  token
}: OnlyofficeUploadProps) {
  return (
    <DocumentEditor
      id="docxEditor"
      documentServerUrl={`${DOCUMENT_SERVER_URL}`}
      config={{
        document: {
          fileType,
          key,
          title,
          url,
        },
        documentType,
        token,
        editorConfig: {
          mode: "edit",
          callbackUrl: `${DOCUMENT_CALLBACK_URL}/api/onlyoffice/callback`,
          lang: "pt-BR",
          user: {
            id: "1",
            name: "User"
          }
        },
        height: "100%",
      }}
      events_onDocumentReady={onDocumentReady}
      onLoadComponentError={onLoadComponentError}
    />
  );
}