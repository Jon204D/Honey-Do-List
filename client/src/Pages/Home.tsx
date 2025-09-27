import React from "react";
import {useState} from "react";
import NavigationBar from "../Components/NavigationBar";
import TaskList from "../Components/TaskList";
import TaskModal from "../Components/TaskModal";

const Home: React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div>

            <h1>Welcome to the Honey-Do List!</h1>

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