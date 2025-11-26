import React from "react";
import TaskCard from "./TaskCard";
import { Task, TaskUpdateData } from "./TaskBoard"; 

interface Props {
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updateData: TaskUpdateData) => Promise<void>; 
}


const TaskList: React.FC<Props> = ({ tasks, onDelete, onUpdate }) => { 
  if (!tasks.length)
    return <p style={{ color: "#212121" }}>No tasks found. Add one!</p>;

  return (
    <div data-tour="task-list" style={{ display: "grid", gap: "1rem" }}>
      {tasks.map((task) => (
        <TaskCard 
          key={task._id} 
          task={task} 
          onDelete={onDelete} 
          onUpdate={onUpdate} 
        />
      ))}
    </div>
  );
};

export default TaskList;