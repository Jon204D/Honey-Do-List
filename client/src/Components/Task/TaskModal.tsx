import React from "react";

interface TaskModalProp 
{
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string; 
}

const TaskModal: React.FC<TaskModalProp> = ({isOpen, onClose, title, description}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", 
            justifyContent: "center", alignItems: "center", zIndex: 1000 
        }}>
            <div style={{backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "400px"}}>
                <h2>{title || "Task Title"}</h2>
                <p>{description || "Task Description"}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>     
    )
}
export default TaskModal;