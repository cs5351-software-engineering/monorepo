import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import ProjectDetail from '../components/ProjectDetail';
import { FaPlus } from 'react-icons/fa';
import '../styles/Dashboard.css';

function Dashboard() {
  const [menuSelection, setMenuSelection] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const handleCreateProject = () => {
    if (newProjectName.trim() === '') return;

    const newProject = {
      id: Date.now(),
      name: newProjectName,
      files: [],
    };
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setShowCreateModal(false);
  };

  //Handle selecting a project
  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  //Handle going back to projects list
  const handleBack = () => {
    setSelectedProject(null);
  };

  //Handle file upload
  const handleUploadFile = (projectId, file) => {
    const updatedProjects = projects.map((proj) => {
      if (proj.id === projectId) {
        return {
          ...proj,
          files: [...proj.files, file.name],
        };
      }
      return proj;
    });

    setProjects(updatedProjects);

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        files: [...selectedProject.files, file.name],
      });
    }
  };

  //Render main content based on menu selection and project selection
  const renderMainContent = () => {
    if (selectedProject) {
      return (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBack}
          onUploadFile={handleUploadFile}
        />
      );
    }

    switch (menuSelection) {
      case 'Dashboard':
        return (
          <div className="fade-in">
            <h2 className="mb-4">Welcome to the Dashboard</h2>
            <p>This is the main dashboard area. You can add some statistics or quick actions here.</p>
          </div>
        );
      case 'User':
        return (
          <div className="fade-in">
            <h2 className="mb-4">User Management</h2>
            <p>Manage your users here. You can add a user list or user management features.</p>
          </div>
        );
      case 'Project':
        return (
          <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Button variant="light" onClick={() => setShowCreateModal(true)}>
                <FaPlus className="me-2" /> New Project
              </Button>
            </div>
            {projects.length === 0 ? (
              <Alert variant="info">You haven't created any projects yet. Click the "New Project" button to get started!</Alert>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {projects.map((project) => (
                  <Col key={project.id}>
                    <ProjectCard project={project} onSelectProject={handleSelectProject} />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="fade-in">
            <h2 className="mb-4">Settings</h2>
            <p>Configure your application settings here. You can add various configuration options.</p>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="App">
      <div className="AppGlass">
        <Sidebar selected={menuSelection} setSelected={setMenuSelection} />
        {renderMainContent()}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="projectName">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Close

            </Button>
            <Button variant="primary" onClick={handleCreateProject} disabled={newProjectName.trim() === ''}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Dashboard;

//   // Handle creating a new project
//   const handleCreateProject = () => {
//     if (newProjectName.trim() === '') return;

//     const newProject = {
//       id: Date.now(),
//       name: newProjectName,
//       files: [],
//     };
//     setProjects([...projects, newProject]);
//     setNewProjectName('');
//     setShowCreateModal(false);
//   };

//   // Handle selecting a project
//   const handleSelectProject = (project) => {
//     setSelectedProject(project);
//   };

//   // Handle going back to projects list
//   const handleBack = () => {
//     setSelectedProject(null);
//   };

//   // Handle file upload
//   const handleUploadFile = (projectId, file) => {
//     const updatedProjects = projects.map((proj) => {
//       if (proj.id === projectId) {
//         return {
//           ...proj,
//           files: [...proj.files, file.name],
//         };
//       }
//       return proj;
//     });

//     setProjects(updatedProjects);

//     if (selectedProject && selectedProject.id === projectId) {
//       setSelectedProject({
//         ...selectedProject,
//         files: [...selectedProject.files, file.name],
//       });
//     }
//   };

//   // Render main content based on menu selection and project selection
//   const renderMainContent = () => {
//     if (selectedProject) {
//       return (
//         <ProjectDetail
//           project={selectedProject}
//           onBack={handleBack}
//           onUploadFile={handleUploadFile}
//         />
//       );
//     }

//     switch (menuSelection) {
//       case 'dashboard':
//         return (
//           <div className="fade-in">
//             <h2 className="mb-4">Welcome to the Dashboard</h2>
//             <p>This is the main dashboard area. You can add some statistics or quick actions here.</p>
//           </div>
//         );
//       case 'user':
//         return (
//           <div className="fade-in">
//             <h2 className="mb-4">User Management</h2>
//             <p>Manage your users here. You can add a user list or user management features.</p>
//           </div>
//         );
//       case 'projects':
//         return (
//           <div className="fade-in">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <h2>Projects</h2>
//               <Button variant="primary" onClick={() => setShowCreateModal(true)}>
//                 <FaPlus className="me-2" /> New Project
//               </Button>
//             </div>
//             {projects.length === 0 ? (
//               <Alert variant="info">You haven't created any projects yet. Click the "New Project" button to get started!</Alert>
//             ) : (
//               <Row xs={1} md={2} lg={3} className="g-4">
//                 {projects.map((project) => (
//                   <Col key={project.id}>
//                     <ProjectCard project={project} onSelectProject={handleSelectProject} />
//                   </Col>
//                 ))}
//               </Row>
//             )}
//           </div>
//         );
//       case 'settings':
//         return (
//           <div className="fade-in">
//             <h2 className="mb-4">Settings</h2>
//             <p>Configure your application settings here. You can add various configuration options.</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Container fluid className="dashboard-container">
//       <Row className="h-100">
//         <Col md={2} className="p-0">
//           <Sidebar onSelectMenu={setMenuSelection} activeMenu={menuSelection} />
//         </Col>
//         <Col md={10} className="main-content">
//           {renderMainContent()}
//         </Col>
//       </Row>

//       <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Create New Project</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="projectName">
//               <Form.Label>Project Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter project name"
//                 value={newProjectName}
//                 onChange={(e) => setNewProjectName(e.target.value)}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleCreateProject} disabled={newProjectName.trim() === ''}>
//             Create
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };