// src/components/ProjectCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { FaFolder } from 'react-icons/fa';

const ProjectCard = ({ project, onSelectProject }) => {
  return (
    <Card
      onClick={() => onSelectProject(project)}
      className="project-card fade-in"
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <FaFolder className="text-primary me-2" size={24} />
          <Card.Title>{project.name}</Card.Title>
        </div>
        <Card.Text className="text-muted">
          {project.files.length} file{project.files.length !== 1 && 's'}
        </Card.Text>
        <div className="mt-auto text-end">
          <small className="text-muted">Last updated: 3 days ago</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;