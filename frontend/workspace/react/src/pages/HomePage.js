import { useState } from 'react';
import axios from 'axios';

const HomePage = () => {
    const [projectData, setProjectData] = useState(null);

    const fetchProjectData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/project');
            setProjectData(response.data);
        } catch (error) {
            console.error('Error fetching project data:', error);
            setProjectData({ error: 'Failed to fetch project data' });
        }
    };

    return (
        <>
            <h1>Home page</h1>
            <button onClick={fetchProjectData}>Fetch Project Data</button>
            {projectData && (
                <div>
                    <h2>Project Data:</h2>
                    <pre>{JSON.stringify(projectData, null, 2)}</pre>
                </div>
            )}
        </>
    );
}

export default HomePage;