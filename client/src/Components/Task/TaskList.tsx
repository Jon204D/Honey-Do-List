import React from "react";
import TaskCard from "./TaskCard";
import {Task} from "./TaskBoard";

interface Props {
  tasks: Task[];
  onDelete: (id: string) => void;
}

const TaskList: React.FC<Props> = ({tasks, onDelete}) => {
  if (!tasks.length)
    return <p style={{color: "#212121"}}>No tasks found. Add one!</p>;

  return (
    <div style={{display: "grid", gap: "1rem"}}>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default TaskList;