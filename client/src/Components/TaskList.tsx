import React from "react";
import Task from "./Task";

const TaskList: React.FC = () => {
    const tasks = [
        {title: "Walmart", description: "Buldak, Cheese, Hotdogs"},
        {title: "House Duties", description: "Mop the floor, Wipe furniture"},
    ]

    return (
        <div>
            <h2>Your Tasks</h2>
            {tasks.map((task, index) => (
                <Task key={index} title={task.title} description={task.description} />
            ))}
        </div>
    )
}

export default TaskList;