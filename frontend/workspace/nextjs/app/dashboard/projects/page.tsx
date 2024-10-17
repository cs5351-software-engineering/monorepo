"use client"

import React, { Key, useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from 'axios';
import { Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Context
import { ProjectListContext, UserIdContext } from '@/app/dashboard/layout';
import { useRouter } from 'next/navigation';

// Form schema
const formSchema = z.object({
  project_name: z.string().min(2).max(50),
  description: z.string().min(2).max(100),
  language: z.enum(["any", "python"]),
  file: z.instanceof(File),
})

// Fake projects for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fakeProjects = [
  { project_name: "Project Name 1", language: "Python", description: "Description 1 xxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx" },
  { project_name: "Project Name 2", language: "Any", description: "Description 2" },
  { project_name: "Project Name 3", language: "Python", description: "Description 3" },
  { project_name: "Project Name 4", language: "Any", description: "Description 4" },
]

const ProjectsPage: React.FC = () => {

  // Context
  const userId = useContext(UserIdContext);
  const { projects, updateProjectList } = useContext(ProjectListContext);

  // Router
  const router = useRouter();

  // State
  const [openDialog, setOpenDialog] = useState(false);

  // shadcn components need to use with form which is also from shadcn
  // Reference: https://ui.shadcn.com/docs/components/form

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: "",
      description: "",
      language: "any",
      file: undefined,
    },
  })

  // On dialog submit
  async function onDialogSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userinfo') || '{}');

      // Create a FormData object
      const formData = new FormData();
      formData.append('project_name', values.project_name);
      formData.append('description', values.description);
      formData.append('language', values.language);
      formData.append('email', userInfo.email);
      formData.append('file', values.file);

      // Upload project
      const response = await axios.post('http://localhost:8080/file/upload/project', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);
      updateProjectList();
      form.reset();
      setOpenDialog(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  // Handle button clicks on existing projects card footer

  // Upload project (new version)
  const handleUploadProject = async (projectId: Key | null | undefined) => {
    console.log('Uploading project with id:', projectId);
  }

  // Download project
  const handleDownloadProject = async (projectId: Key | null | undefined) => {
    console.log('Downloading project with id:', projectId);
  }

  // Delete project
  const handleDeleteProject = async (projectId: Key | null | undefined) => {
    console.log('Deleting project with id:', projectId);
    try {
      await axios.delete(`http://localhost:8080/project/delete/`, {
        params: {
          userId: userId,
          projectId: projectId,
        },
      });
      updateProjectList();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      {/* Top bar */}
      <div className="ml-auto flex items-center gap-2 mb-8">

        {/* File upload button and dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Upload project (.zip)</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onDialogSubmit)} className="space-y-8">

                {/* Dialog header */}
                <DialogHeader>
                  <DialogTitle>Upload project (.zip)</DialogTitle>
                  <DialogDescription>
                    Upload your project here. Click confirm when you&lsquo;re done.
                  </DialogDescription>
                </DialogHeader>

                {/* Form fields */}
                <div className="grid gap-4 py-4">

                  {/* Project name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project_name" className="text-right">
                      Project name
                    </Label>
                    <FormField
                      control={form.control}
                      name="project_name"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input id="project_name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input id="description" className="col-span-3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Language selector */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="language" className="text-right">
                      Language
                    </Label>

                    {/* Reference: https://ui.shadcn.com/docs/components/select#form */}
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* File upload */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    File
                  </Label>

                  {/* Reference: https://github.com/shadcn-ui/ui/discussions/2137 */}
                  <FormField
                    control={form.control}
                    name="file"
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept="application/zip"
                            onChange={(event) =>
                              onChange(event.target.files && event.target.files[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Confirm button */}
                <DialogFooter>
                  <Button type="submit">Confirm</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>

      <h2 className="text-xl font-bold mb-8">Existing projects</h2>

      {/* Existing projects list */}
      <div className="flex flex-wrap gap-4">
        {projects.length === 0 && (
          <div className="text-gray-400">No projects found</div>
        )}
        {projects.map((project) => (
          <Card key={project.id} className="w-[420px]">

            {/* Card header, title and language */}
            <CardHeader>
              <CardTitle className="mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  <div className="text-lg">{project.projectName}</div>
                </div>
              </CardTitle>
              <CardDescription className="mb-2 text-sm text-gray-400">
                <p>Language: {project.language}</p>
                <p>Version: {project.version}</p>
                <p>Last updated: {project.updatedDatetime}</p>
              </CardDescription>
            </CardHeader>

            {/* Card content, description */}
            <CardContent className="h-[80px]">
              <p className="line-clamp-3 text-sm text-gray-400 mb-2">{project.description.slice(0, 100)}...</p>
            </CardContent>

            {/* Card footer, buttons */}
            <CardFooter className="flex justify-end gap-2">

              {/* Detail button */}
              <Button size="sm" className='text-sm' variant="outline" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>Detail</Button>

              {/* <Button size="sm" className='text-sm' variant="outline">View</Button> */}
              <Button size="sm" className='text-sm' variant="outline" onClick={() => handleUploadProject(project.id)}>Upload</Button>
              <Button size="sm" className='text-sm' variant="outline" onClick={() => handleDownloadProject(project.id)}>Download</Button>

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button size="sm" className='text-sm bg-red-500 text-white hover:bg-red-600' variant="outline">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your project
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className='bg-red-500 text-white hover:bg-red-600' onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default ProjectsPage;

