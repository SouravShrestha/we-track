import { convertDurationToSeconds } from "./convertors";

export const calculateVideoStats = (folders) => {
  let numberOfVideos = 0;
  let startedVideosCount = 0;
  let totalProgress = 0;

  folders?.subfolders?.forEach((subfolder) => {
    const videos = [];
    if (subfolder.lessons && subfolder.lessons.length > 0) {
      subfolder.lessons.forEach(ls => {
        if (ls.videos) videos.push(...ls.videos);
      });
    }
    if (subfolder.videos) {
      videos.push(...subfolder.videos);
    }

    numberOfVideos += videos.length;
    videos.forEach((video) => {
      if (video.progress > 0) startedVideosCount++;
      const durationSeconds = convertDurationToSeconds(video.duration);
      if (durationSeconds > 0) {
        totalProgress += Math.min(video.progress / durationSeconds, 1);
      } else {
        totalProgress += video.progress > 0 ? 1 : 0;
      }
    });
  });

  const completionPercentage = numberOfVideos > 0 ? Math.round((totalProgress / numberOfVideos) * 100) : 0;
  return { numberOfVideos, startedVideosCount, completionPercentage };
};
