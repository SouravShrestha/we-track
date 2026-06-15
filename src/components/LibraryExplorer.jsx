"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
const checkIcon = "/images/check.png";
const newIcon = "/images/new.png";
const progressIcon = "/images/progress.png";
const playingIcon = "/images/playing.png";
import { convertDurationToSeconds } from "../utils/convertors";
import { formatTitle } from "../utils/formatTitle";

const LibraryExplorer = ({
  contents,
  onVideoClick,
  videoProgress,
  activeVideoPath,
  videoIdToPlay,
  onDropdownVisibilityChange,
}) => {
  const contentRefs = useRef([]);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  const getChapterVideos = (content) => {
    if (content.lessons && content.lessons.length > 0) {
      return content.lessons.flatMap((ls) =>
        (ls.videos || []).sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
    return (content.videos || []).sort((a, b) => a.name.localeCompare(b.name));
  };

  const chaptersWithContent = useMemo(
    () => contents.filter((c) => getChapterVideos(c).length > 0),
    [contents],
  );

  const allVideos = useMemo(
    () => chaptersWithContent.flatMap(getChapterVideos),
    [chaptersWithContent],
  );

  // Global video number map: video.id → 1-based index across all chapters
  const videoNumberMap = useMemo(() => {
    const map = {};
    allVideos.forEach((v, i) => {
      map[v.id] = i + 1;
    });
    return map;
  }, [allVideos]);

  const handleContentClick = (index) => {
    contentRefs.current[index].scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeVideoPath) {
      const activeVideo = allVideos.find((v) => v.path === activeVideoPath);
      if (activeVideo && videoRefs.current[activeVideo.id]) {
        videoRefs.current[activeVideo.id].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeVideoPath]);

  useEffect(() => {
    const findPassedVideo = (videoId) => {
      if (!videoId) return null;
      return (
        allVideos.find((v) => v.id.toString() === videoId.toString()) ?? null
      );
    };

    const findFirstUnwatchedVideo = () => {
      let firstVideo = null;
      for (const video of allVideos) {
        firstVideo = firstVideo || video;
        if (video.progress < convertDurationToSeconds(video.duration))
          return video;
      }
      return firstVideo;
    };

    const target = videoIdToPlay
      ? findPassedVideo(videoIdToPlay)
      : findFirstUnwatchedVideo();
    if (target) onVideoClick(target);
  }, [contents]);

  const handleVideoClick = (video) => {
    if (Object.prototype.hasOwnProperty.call(videoProgress, video.id)) {
      video.progress = videoProgress[video.id];
    }
    onVideoClick(video);
  };



  const VideoItem = ({ video }) => {
    const progress =
      videoProgress[video.id] !== undefined
        ? videoProgress[video.id]
        : video.progress;
    const isActive = video.path === activeVideoPath;
    const isComplete = progress >= convertDurationToSeconds(video.duration);
    const globalNum = String(videoNumberMap[video.id]).padStart(2, "0");
    const label = `${globalNum}. ${formatTitle(video.name)}`;

    return (
      <li
        ref={(el) => (videoRefs.current[video.id] = el)}
        className={`flex justify-between text-base py-2 items-center cursor-pointer bg-clip-text ${
          isActive
            ? "text-transparent font-550 bg-gradient-to-r from-gradientEnd to-gradientStart"
            : "hover:text-colortext font-normal"
        } hover:no-underline ${isComplete && !isActive ? "line-through" : ""}`}
        onClick={() => handleVideoClick(video)}
      >
        <div className="flex items-center w-4/5 justify-start gap-2">
          {/* Status icon */}
          {!isActive &&
            (progress <= 0 ? (
              <img
                src={newIcon}
                alt="New"
                className="inline-block w-5 h-5 shrink-0"
              />
            ) : isComplete ? (
              <img
                src={checkIcon}
                alt="Done"
                className="inline-block w-6 h-6 shrink-0"
              />
            ) : (
              <img
                src={progressIcon}
                alt="In progress"
                className="inline-block w-6 h-6 shrink-0"
              />
            ))}
          <div className="w-full truncate text-[14px]">{label}</div>
        </div>
        <div className="w-auto flex justify-end shrink-0 ml-1">
          {!isActive ? (
            <span className="text-[10px] mt-0.5 text-colortextsecondary hover:no-underline transition duration-200">
              {video.duration}
            </span>
          ) : (
            <img
              src={playingIcon}
              alt="Playing"
              className="inline-block w-5 h-5"
            />
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="relative ml-3 mr-3 overflow-y-auto" ref={containerRef}>
      {/* Chapter list */}
      {chaptersWithContent.map((content, index) => {
        const hasLessons = content.lessons && content.lessons.length > 0;

        return (
          <div
            className="pb-2 relative mb-6 z-0"
            key={content.id}
            ref={(el) => (contentRefs.current[index] = el)}
          >
            {/* Chapter header */}
            <div className="text-base font-semibold sticky top-0 bg-primary -ml-1 pl-1 sm:pt-0 pt-4">
              <div className="flex items-center pb-3">
                <span className="mr-3 flex items-center justify-center w-7 h-7 rounded-sm bg-gradient-to-r from-gradientEnd to-gradientStart text-white font-semibold min-w-7">
                  {index + 1}
                </span>
                <span className="chapter">{formatTitle(content.name)}</span>
              </div>
              <hr className="border-colorborder" />
            </div>

            {hasLessons ? (
              // Pattern B: lessons grouped under chapter
              <div className="mt-3 space-y-4">
                {content.lessons
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((lesson) => (
                    <div key={lesson.id}>
                      {content.lessons.length > 1 && (
                        <div className="text-xs font-semibold text-colortextsecondary ml-1 mb-2 flex items-center gap-2">
                          {formatTitle(lesson.name)}
                        </div>
                      )}
                      <ul className="mr-2 pl-1 w-full space-y-3">
                        {lesson.videos
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((video) => (
                            <VideoItem key={video.id} video={video} />
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            ) : (
              // Pattern A: direct videos under chapter
              <ul className="mt-3 mr-2 pl-1 w-full space-y-3">
                {content.videos
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((video) => (
                    <VideoItem key={video.id} video={video} />
                  ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LibraryExplorer;
