import React, { useEffect, useState } from "react";
import { AuthButton } from "../Auth/AuthStyles";
import TaskList from "./TaskList";
import TaskModal from "./TaskModal";
import TaskFilter from "./TaskFilter";
import OnboardingTour from "../Tour/OnboardingTour";

export interface Task {
  _id?: string;
  title: string;
  description: string;
  priority: string;
  status?: string;
  dueDate?: string;
}

// Interface for the partial update data
export interface TaskUpdateData {
  priority?: string;
  status?: string;
}

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", priority: "", dueDate: "" });

  // used by the tour to decide whether to show for logged-out users
  const isAuthed = localStorage.getItem("isLoggedIn") === "true";

  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);

    if (!filters.status && !filters.priority && !filters.dueDate) {
      setFilteredTasks(newTasks);
    } else {
      const filtered = newTasks.filter((task) => {
        const statusMatch = !filters.status || task.status === filters.status;
        const priorityMatch = !filters.priority || task.priority === filters.priority;
        const dueMatch = !filters.dueDate || task.dueDate === filters.dueDate;
        return statusMatch && priorityMatch && dueMatch;
      });
      setFilteredTasks(filtered);
    }
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  };


  // Load tasks from backend (fallback to localStorage)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/tasks`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Backend not responding");

        const data = await response.json();
        const taskArray = Array.isArray(data) ? data : data.tasks || [];

        updateTasksState(taskArray);

      } catch (err) {
        console.warn("Backend failed, using localStorage only.", err);
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          updateTasksState(parsed);
        }
      }
    };

    fetchTasks();
  }, []);

  // Filters
  const applyFilters = () => {
    if (!filters.status && !filters.priority && !filters.dueDate) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter((task) => {
      const statusMatch = !filters.status || task.status === filters.status;
      const priorityMatch = !filters.priority || task.priority === filters.priority;
      const dueMatch = !filters.dueDate || task.dueDate === filters.dueDate;
      return statusMatch && priorityMatch && dueMatch;
    });

    setFilteredTasks(filtered);
  };

  // Add Task
  const handleAddTask = async (newTask: Task) => {
    try {
      console.log('Creating task:', newTask);
      
      // FIXED: Convert priority and status to lowercase to match backend enum values
      const cleanTask = {
        ...newTask,
        priority: newTask.priority?.toLowerCase() || 'medium',
        status: newTask.status?.toLowerCase() || 'pending',
      };
      
      console.log('Sending cleaned task:', cleanTask);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error("Backend not reachable");
      }

      const savedTask = await response.json();
      console.log('Task created successfully:', savedTask);
      
      const updated = [...tasks, savedTask];
      updateTasksState(updated);

      // tell the tour a task was created
      window.dispatchEvent(new Event("task-created"));
    } catch (err) {
      console.warn("Backend failed, using localStorage only.", err);
      const fallbackTask = { ...newTask, _id: Date.now().toString() };
      const updated = [...tasks, fallbackTask];
      updateTasksState(updated);

      // tell the tour a task was created (fallback)
      window.dispatchEvent(new Event("task-created"));
    }
  };

  const handleUpdateTask = async (id: string, updateData: TaskUpdateData) => {
    if (!id) return;

    const cleanUpdateData: TaskUpdateData = {};
    if (updateData.priority) {
        cleanUpdateData.priority = updateData.priority.toLowerCase();
    }
    if (updateData.status) {
        cleanUpdateData.status = updateData.status.toLowerCase();
    }

    const updatedTasksOptimistic = tasks.map((task) => 
      task._id === id ? { ...task, ...cleanUpdateData } : task
    );
    updateTasksState(updatedTasksOptimistic);

    try {
        console.log(`Updating task ${id} with:`, cleanUpdateData);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanUpdateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend update error:', errorData);
          throw new Error("Backend not reachable or update failed");
        }

        const savedTask = await response.json();
        console.log('Task updated successfully:', savedTask);
        
        const updatedTasks = tasks.map((task) => 
            task._id === id ? savedTask : task
        );
        updateTasksState(updatedTasks);

    } catch (err) {
        console.warn("Backend failed to update, using localStorage only.", err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      console.log('Deleting task:', id);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Backend not reachable");
      
      console.log('Task deleted successfully');
    } catch (err) {
      console.warn("Backend failed, using localStorage only.", err);
    }

    const updated = tasks.filter((t) => t._id !== id);
    updateTasksState(updated);
  };

  // Open modal (and notify tour the modal opened)
  const openCreateTask = () => {
    setIsModalOpen(true);
    window.dispatchEvent(new Event("task-modal-open"));
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Onboarding tour (only shows for logged-out users) */}
      <OnboardingTour isAuthed={isAuthed} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontSize: "2rem", color: "#212121" }}>Your Tasks</div>

        <AuthButton
          data-tour="create-task-button"
          onClick={openCreateTask}
          style={{ backgroundColor: "#212121", color: "orange" }}
        >
          + Create Task
        </AuthButton>
      </div>

      <TaskFilter onFilter={setFilters} onApply={applyFilters} />

      <TaskList tasks={filteredTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />

      {isModalOpen && (
        <TaskModal onClose={() => setIsModalOpen(false)} onSave={handleAddTask} />
      )}
    </div>
  );
};

export default TaskBoard;