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

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", priority: "", dueDate: "" });

  // used by the tour to decide whether to show for logged-out users
  const isAuthed = localStorage.getItem("isLoggedIn") === "true";

  // Load tasks from backend (fallback to localStorage)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}api/tasks`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) throw new Error("Backend not responding");

        const data = await response.json();
        const taskArray = Array.isArray(data) ? data : data.tasks || [];

        setTasks(taskArray);
        setFilteredTasks(taskArray);
        localStorage.setItem("tasks", JSON.stringify(taskArray));
      } catch (err) {
        console.warn("Backend failed, using localStorage only.", err);
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          setTasks(parsed);
          setFilteredTasks(parsed);
        }
      }
    }

    fetchTasks();
  }, [])

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
    })

    setFilteredTasks(filtered);
  }

  // Add Task
  const handleAddTask = async (newTask: Task) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) throw new Error("Backend not reachable");

      const savedTask = await response.json();
      const updated = [...tasks, savedTask];
      setTasks(updated);
      setFilteredTasks(updated);
      localStorage.setItem("tasks", JSON.stringify(updated));

      // tell the tour a task was created
      window.dispatchEvent(new Event("task-created"));
    } catch (err) {
      console.warn("Backend failed, using localStorage only.", err);
      const fallbackTask = { ...newTask, _id: Date.now().toString() }
      const updated = [...tasks, fallbackTask];
      setTasks(updated);
      setFilteredTasks(updated);
      localStorage.setItem("tasks", JSON.stringify(updated));

      // tell the tour a task was created (fallback)
      window.dispatchEvent(new Event("task-created"));
    }
  }

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}api/tasks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Backend not reachable");
    } catch (err) {
      console.warn("Backend failed, using localStorage only.", err);
    }

    const updated = tasks.filter((t) => t._id !== id);
    setTasks(updated);
    setFilteredTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  }

  // Open modal (and notify tour the modal opened)
  const openCreateTask = () => {
    setIsModalOpen(true);
    window.dispatchEvent(new Event("task-modal-open"));
  }

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

      <TaskList tasks={filteredTasks} onDelete={handleDeleteTask} />

      {isModalOpen && (
        <TaskModal onClose={() => setIsModalOpen(false)} onSave={handleAddTask} />
      )}
    </div>
  )
}

export default TaskBoard;