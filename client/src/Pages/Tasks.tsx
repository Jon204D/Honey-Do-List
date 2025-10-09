import React, {useEffect} from "react";
import TaskBoard from "../Components/Task/TaskBoard";

const Tasks: React.FC = () => {
       useEffect(() => {
            document.title = "Tasks - Honey-Do List";
        }, []);
    return <TaskBoard/>;
}

export default Tasks;