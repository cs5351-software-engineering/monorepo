'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  name: string;
  // Add other project properties as needed
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8080/project');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post('http://localhost:8080/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchProjects(); // Refresh the project list after upload
    } catch (error) {
      console.error('Error uploading folder:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-5xl font-bold mb-8 text-gray-800">Projects</h1>
      
      <div className="mb-8">
        <input
          type="file"
          multiple
          onChange={handleFolderUpload}
          className="hidden"
          id="folderUpload"
        />
        <Button asChild className="hover:bg-primary/90 transition-colors">
          <label htmlFor="folderUpload">
            <Folder className="mr-2 h-4 w-4" /> Upload Folder
          </label>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card key={index} className={cn("w-[380px]")}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Project details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Code />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Project Files
                  </p>
                  <p className="text-sm text-muted-foreground">
                    View and manage project files.
                  </p>
                </div>
              </div>
              {/* Add more project details here if needed */}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Open Project
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
