import React from "react";

interface TaskCardProps {
    title: string;
    description?: string;
}

const Task: React.FC<TaskCardProps> = ({title, description}) => {
    return (
        <div style={{border: "1px solid #ccc", padding: "1rem", margin: "0.5rem"}}>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </div>
    )
}

export default Task;