"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { useDropzone } from "react-dropzone";
import { UploadCloudIcon } from "lucide-react";
import { Button } from "../ui/button";
import { GenerateUploaderURL } from "@/actions/s3";
import { toast } from "sonner";
import generateVideo from "@/actions/generation";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import ClipDisplay from "./clip-display";

interface DashBoardClientProps {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    createdAt: Date;
    clipCount: number;
  }[];
  clips: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    s3Key: string;
    uploadedFileId: string | null;
  }[];
}

export default function DashBoardClient({
  uploadedFiles,
  clips,
}: DashBoardClientProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setIsUploading] = useState(false);
  const [refreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      // Credits will be updated from the new page props
    }, 600);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
    },
    accept: {
      'video/mp4': ['.mp4']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    const file = files[0]!;
    setIsUploading(true);
    try {
      const { success, signedUrl, key, uploadFileId } =
        await GenerateUploaderURL({
          filename: file.name,
          "content-type": file.type,
        });

      if (!success) throw new Error("Failed to generate uploader URL");
      console.log("Signed URL:", signedUrl);
      console.log("Key:", key);
      console.log("Upload File ID:", uploadFileId);
      console.log("File type:", file.type);

      try {
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        console.log("Upload response status:", uploadResponse.status);
        console.log("Upload response headers:", uploadResponse.headers);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload error response:", errorText);
          throw new Error(
            `Failed to upload file: ${uploadResponse.status} - ${errorText}`,
          );
        }
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        throw fetchError;
      }

      await generateVideo(uploadFileId);

      setFiles([]);

      toast.success("Video uploaded successfully", {
        description:
          "Your video has been scheduled for processing. Check the status below.",
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Upload failed", {
        description:
          "There was a problem uploading your video. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Clipa AI
              </h1>
              <p className="text-lg text-muted-foreground">
                Transform your podcast into viral clips with AI
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Buy Credits
            </Link>
          </div>
        </header>

        <Tabs defaultValue="UploadClip">
          <TabsList className="mb-6 rounded-lg bg-muted p-1">
            <TabsTrigger
              value="UploadClip"
              className="rounded-md cursor-pointer"
            >
              Upload Clip
            </TabsTrigger>
            <TabsTrigger value="MyClips" className="rounded-md cursor-pointer">
              My Clips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="UploadClip">
            <Card>
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-bold">Upload Podcast</h2>
                <CardDescription>
                  Upload your podcast video to generate viral clips using AI
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-8">
                <div
                  {...getRootProps()}
                  className="flex flex-col items-center justify-center gap-5 py-12 px-6 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <div className="rounded-full bg-muted p-4">
                    <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-base font-medium text-foreground">
                      {isDragActive ? "Drop your file here" : "Drag and drop your file here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP4 format · Up to 500 MB
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between">
                  <div>
                    {files.length > 0 && (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Selected file:</p>
                        {files.map((file) => (
                          <p key={file.name} className="text-muted-foreground">
                            {file.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    disabled={files.length === 0 || uploading}
                    onClick={handleUpload}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload and Generate Clips"
                    )}
                  </Button>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-md mb-2 font-medium">Queue status</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                      >
                        {refreshing && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Refresh
                      </Button>
                    </div>
                    <div className="max-h-[300px] overflow-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Clips created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadedFiles.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="max-w-xs truncate font-medium">
                                {item.filename}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {item.status === "queued" && (
                                  <Badge variant="outline">Queued</Badge>
                                )}
                                {item.status === "processing" && (
                                  <Badge variant="outline" className="animate-pulse">Processing</Badge>
                                )}
                                {item.status === "processed" && (
                                  <Badge variant="outline">Processed</Badge>
                                )}
                                {item.status === "no credits" && (
                                  <Badge variant="destructive">
                                    No credits
                                  </Badge>
                                )}
                                {item.status === "failed" && (
                                  <Badge variant="destructive">Failed</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.clipCount > 0 ? (
                                  <span>
                                    {item.clipCount} clip
                                    {item.clipCount !== 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    No clips yet
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="MyClips">
            <Card>
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-bold">My Clips</h2>
                <CardDescription>
                  View and manage your generated clips here. Processing may take
                  a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* display clip content components */}
                <ClipDisplay clips={clips} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
