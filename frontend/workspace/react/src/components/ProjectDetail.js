// src/components/ProjectDetail.js
import React, { useState } from 'react';
import { Card, Button, Form, Alert, Row } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';

const ProjectDetail = ({ project, onBack, onUploadFile }) => {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    onUploadFile(project.id, uploadFile);
    setUploadFile(null);
    setUploadSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <>
      <div >
   
        <h2>{project.name}
        
        </h2>
          
        
        <hr />
        <div>
        <Card className="mb-3">
          <Card.Body>
            <h5>Upload Code</h5>
            {uploadSuccess && <Alert variant="success">File uploaded successfully!</Alert>}
            <Form onSubmit={handleFileUpload}>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Select File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </Form.Group>
              <Button variant="success" type="submit" disabled={!uploadFile}>
                Upload
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <Button className="float-end" variant="secondary" onClick={onBack}>
            <FaArrowLeft className="me-2" /> Back to Projects
          </Button>
    </div>
      </div>
      <Card>
        <Card.Body>
          <h5>Files</h5>
          {project.files.length > 0 ? (
            <ul>
              {project.files.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </Card.Body>
      </Card>
      
    </>
  );
};

export default ProjectDetail;