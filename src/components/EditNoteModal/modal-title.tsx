import "./index.scss";
import { ReactComponent as DocumentIcon } from "../../assets/icons/document.svg";
import { ReactComponent as PreviewIcon } from "../../assets/icons/preview.svg";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";

const ModalTitle = ({ isEditing, isNewNote, onClose }: { isEditing: boolean, isNewNote: boolean, onClose: () => void }) => {
    return (
        <div className="note-modal-title">
            <div>{!isEditing ? <PreviewIcon className="document-icon" /> : <DocumentIcon className="document-icon" />}{isNewNote ? "New Note" : isEditing ? "Editing" : "Preview"}</div>
            <div className="close-icon-container" onClick={onClose}>
                <CloseIcon className="close-icon" />
            </div>
        </div>
    )
}

export default ModalTitle;