import React from "react";
import {useState, useEffect} from "react";
import TaskList from "../Components/TaskList";
import TaskModal from "../Components/TaskModal";

const Home: React.FC = () => {
     useEffect(() => {
        document.title = "Honey-Do List Home";
    }, []);
    
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div>

            <TaskList/>
            <button onClick={() => setModalOpen(true)}>+ Add Tasks</button>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="New Task"
                description="Write Description"
            />
        </div>
    )    
}

export default Home;