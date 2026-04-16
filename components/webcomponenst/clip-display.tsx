"use client";

import { getClipPlayURL } from "@/actions/generation";
import { Clip } from "@prisma/client";
import { DownloadIcon, Loader2Icon, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

function ClipCard({ clip }: { clip: Clip }) {
     const [playurl, setplayurl] = useState<string | null>(null);
     const [isLoadingurl, setIsLoadingUrl] = useState(true);

     useEffect(() => {
          async function fetchplayer() {
               try {
                    const result = await getClipPlayURL(clip.id);
                    if (result.success) {
                         setplayurl(result.url || null);
                    } else if (result.error) {
                         console.error("Failed to get clip play URL:", result.error);
                    }
               } catch (error) {
                    console.error("Error fetching clip play URL:", error);
               } finally {
                    setIsLoadingUrl(false);
               }
          }
          fetchplayer();
     }, [clip.id]);

     const handleDownload = () => {
          if (playurl) {
               const link = document.createElement('a');
               link.href = playurl;
               link.style.display = 'none';
               document.body.appendChild(link);
               link.click();
               document.body.removeChild(link);
          }
     };

     return (
          <div className="flex max-w-52 flex-col gap-3">
               <div className="bg-muted aspect-video w-full rounded-lg">
                    {isLoadingurl ? (
                         <div className="flex h-full w-full items-center justify-center">
                              <Loader2Icon className="text-muted-foreground h-8 w-8 animate-spin" />
                         </div>
                    ) : playurl ? (
                         <video src={playurl} controls preload="metadata" className="h-full w-full rounded-md object-cover" />
                    ) : (
                         <div className="flex h-full w-full items-center justify-center">
                              <Play className="text-muted-foreground h-10 w-10 opacity-50" />
                         </div>
                    )}
               </div>
               <div className="flex flex-col gap-3">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                         <DownloadIcon className="mr-1.5 h-4 w-4" /> Download
                    </Button>
               </div>
          </div>
     );
}

export default function ClipDisplay({ clips }: { clips: Clip[] }) {
     if (clips.length === 0) {
          return (
               <p className="text-muted-foreground text-2xl text-center">No clips generated yet</p>
          );
     }

     return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
               {clips.map((clip) => (
                    <ClipCard key={clip.id} clip={clip} />
               ))}
          </div>
     );
}
