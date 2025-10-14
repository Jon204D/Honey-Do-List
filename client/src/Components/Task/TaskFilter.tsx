import React, {useState} from "react";
import {AuthButton} from "../Auth/AuthStyles";

interface Props {
  onFilter: (filters: {status: string; priority: string; dueDate: string }) => void;
  onApply: () => void;
}

const TaskFilter: React.FC<Props> = ({onFilter, onApply}) => {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dueDate: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    const updated = {...filters, [name]: value};
    setFilters(updated);
    onFilter(updated);
  }

  const clearFilters = () => {
    const cleared = {status: "", priority: "", dueDate: ""};
    setFilters(cleared);
    onFilter(cleared);
    onApply();
  }

  return (
    <div
    className="task-filter"
      style = {{
        backgroundColor: "#212121",
        color: "orange",
        padding: "1rem",
        borderRadius: "10px",
        marginBottom: "1.5rem",
      }}
    >
      <h3>Filter Tasks</h3>
      <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select name="priority" value={filters.priority} onChange={handleChange}>
          <option value="">Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input type="date" name="dueDate" value={filters.dueDate} onChange={handleChange}/>
        <AuthButton variant="primary" onClick={onApply}>
          Apply
        </AuthButton>
        <AuthButton variant="secondary" onClick={clearFilters}>
          Clear
        </AuthButton>
      </div>
    </div>
  )
}

export default TaskFilter;