import { Button } from "antd"
import "./index.scss"
import { ReactComponent as GoBackIcon } from "../../assets/icons/go-back.svg";

const ModalFooter = ({ isEditing, isNewNote, onAction, onGoBack }: { isEditing: boolean, isNewNote: boolean, onAction: () => void, onGoBack: () => void }) => {
    return (
        <div className="note-modal-footer">
            <Button size="small" type="text" icon={<GoBackIcon />} className="note-modal-footer-back-button" onClick={onGoBack}>go back</Button>
            <Button size="small" type="primary" onClick={onAction}>{!isEditing ? "Edit note" : isNewNote ? "Create note" : "Update note"}</Button>
        </div>
    )
}

export default ModalFooter;