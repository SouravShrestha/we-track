"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import LibraryExplorer from "./LibraryExplorer";
import VideoPlayer from "./VideoPlayer";
import { fetchSubfolders, getVideoUrl } from "../utils/api";

const CourseDetail = () => {
  const params = useParams();
  const id = params?.id;
  const [contents, setContents] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedVideoPath, setSelectedVideoPath] = useState("");
  const [videoProgress, setVideoProgress] = useState({});
  const searchParams = useSearchParams();
  const videoIdToPlay = searchParams.get("videoIdToPlay");
  const [isManualChange, setIsManualChange] = useState(false);

  const handleVideoClick = (video) => {
    setIsManualChange(true); // Mark manual change
    setSelectedVideo(video);
    setSelectedVideoPath(video.path);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSubfolders(id);
        setContents(data); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching subfolders:", error); // Handle any errors
      }
    };

    fetchData();
  }, [id]); // Fetch data when the 'id' changes

  // Function to update video progress
  const updateVideoProgress = (videoId, progress) => {
    setVideoProgress((prevProgress) => ({
      ...prevProgress,
      [videoId]: progress,
    }));
    setIsManualChange(false);
  };

  const videoList = contents.flatMap((content) => {
    if (content.lessons && content.lessons.length > 0) {
      return content.lessons.flatMap((ls) => ls.videos || []);
    }
    return content.videos || [];
  });

  const currentIndex = videoList.findIndex(
    (video) => video.id === selectedVideo.id,
  );
  const nextVideo =
    currentIndex < videoList.length - 1 ? videoList[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? videoList[currentIndex - 1] : null;
  const nextVideoNum = nextVideo ? currentIndex + 2 : null;
  const prevVideoNum = prevVideo ? currentIndex : null;

  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  useEffect(() => {
    if (isExplorerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isExplorerOpen]);

  return (
    <div className="flex flex-col sm:flex-row w-full">
      {/* Mobile Header Toggle Button */}
      <div
        className="sm:hidden absolute right-2 top-0 h-20 flex items-center z-[60] cursor-pointer group"
        onClick={() => setIsExplorerOpen(!isExplorerOpen)}
      >
        <span className="text-2xl text-colortextsecondary group-hover:text-white px-2">
          ☰
        </span>
      </div>

      {/* Mobile Backdrop */}
      {isExplorerOpen && (
        <div
          className="sm:hidden fixed top-20 bottom-0 inset-x-0 bg-black/60 z-[90]"
          onClick={() => setIsExplorerOpen(false)}
        />
      )}

      {/* Library Explorer Wrapper */}
      <div
        className={`
          fixed top-20 bottom-0 right-0 z-[100] w-80 max-w-[85vw] bg-primary transform transition-transform duration-300 ease-in-out border-l border-colorborder sm:border-none
          ${isExplorerOpen ? "translate-x-0" : "translate-x-full"}
          sm:static sm:translate-x-0 sm:float-left sm:w-2/6 xl:w-p21 sm:bg-transparent
          text-colortextsecondary sm:sticky sm:top-0 sm:h-[calc(100vh-6.5rem)] select-none pt-0 sm:pt-0 sm:mt-4 pl-2
          overflow-y-auto pr-2
        `}
      >
        <LibraryExplorer
          contents={contents}
          onVideoClick={handleVideoClick}
          videoProgress={videoProgress}
          activeVideoPath={selectedVideoPath}
          videoIdToPlay={videoIdToPlay}
        />
      </div>
      <div className="w-full sm:w-5/6 xl:w-p79 h-auto sm:h-[calc(100vh-5rem)] sm:overflow-y-auto">
        <VideoPlayer
          videoPath={selectedVideoPath ? getVideoUrl(selectedVideoPath) : ""}
          video={selectedVideo}
          cUpdateVideoProgress={updateVideoProgress}
          nextVideo={nextVideo}
          prevVideo={prevVideo}
          nextVideoNum={nextVideoNum}
          prevVideoNum={prevVideoNum}
          onVideoChange={handleVideoClick}
          isManualChange={isManualChange}
          setIsManualChange={setIsManualChange}
        />
      </div>
    </div>
  );
};

export default CourseDetail;
