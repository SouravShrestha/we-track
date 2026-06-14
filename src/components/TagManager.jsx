"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  fetchTags,
  addTagToFolder,
  removeTagFromFolder,
  removeMainFolder,
  fetchMainFolders,
} from "../utils/api";
const purgeUnusedTags = () =>
  fetch("/api/tags", { method: "DELETE" }).then((r) => r.json());
const folderImg = "/images/folder.png";
import Tag from "./Tag";
import { getRandomColorPair } from "../utils/colorUtils";
const folderIcon = "/images/folder-settings.png";
const trashIcon = "/images/bin.png";

const TagManager = ({ isOpen, onClose, refreshTags, onFolderRemoved }) => {
  const [courses, setCourses] = useState([]);
  const [mainFolders, setMainFolders] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [mobileView, setMobileView] = useState("list");

  const unusedTags = useMemo(() => {
    if (!selectedCourse) return [];
    return allTags.filter(
      (t) => !selectedCourse.tags.some((ct) => ct.name === t.name),
    );
  }, [allTags, selectedCourse]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    } else {
      document.removeEventListener("keydown", handleEscapeKey);
    }
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [allFolders, mf, fetchedTags] = await Promise.all([
      fetch("/api/folders").then((r) => r.json()),
      fetchMainFolders(),
      fetchTags(),
    ]);
    const tagsWithColor = fetchedTags.map((t) => ({
      ...t,
      color: getRandomColorPair(),
    }));
    setAllTags(tagsWithColor);
    setMainFolders(mf);
    setCourses(
      allFolders.map((f) => ({
        ...f,
        tags: f.tags.map((t) => ({ ...t, color: getRandomColorPair() })),
      })),
    );
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setMobileView("detail");
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    await addTag(newTag);
  };

  const addTag = async (tagName) => {
    if (!tagName.trim() || !selectedCourse) return;
    if (
      selectedCourse.tags.some((t) => t.name === tagName.trim().toLowerCase())
    )
      return;
    const updatedTag = await addTagToFolder(
      selectedCourse.id,
      tagName.trim().toLowerCase(),
    );
    const tagWithColor = { ...updatedTag, color: getRandomColorPair() };
    const updatedCourse = {
      ...selectedCourse,
      tags: [...selectedCourse.tags, tagWithColor],
    };
    setSelectedCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
    );
    setAllTags((prev) =>
      prev.some((t) => t.name === tagWithColor.name)
        ? prev
        : [...prev, tagWithColor],
    );
    setNewTag("");
    await refreshTags(selectedCourse.id);
  };

  const removeTag = async (tag) => {
    if (!selectedCourse) return;
    await removeTagFromFolder(selectedCourse.id, tag.name);
    const updatedCourse = {
      ...selectedCourse,
      tags: selectedCourse.tags.filter((t) => t.name !== tag.name),
    };
    setSelectedCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
    );
    await refreshTags(selectedCourse.id);
  };

  const handleRemoveMainFolder = async (mf) => {
    await removeMainFolder(mf.id);
    setConfirmRemove(null);
    setSelectedCourse(null);
    await loadData();
    onFolderRemoved?.();
  };

  const handlePurgeUnusedTags = async () => {
    await purgeUnusedTags();
    await loadData();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:py-24 bg-primarydark/70"
      onClick={onClose}
    >
      <div
        className="w-full h-full rounded-md bg-primary border border-colorborder sm:w-5/6 lg:w-2/3 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-base sm:text-xl font-semibold w-full flex items-center justify-between px-4 border-b border-colorborder min-h-14 shrink-0">
          <div className="flex items-center">
            {mobileView === "detail" && (
              <button
                className="sm:hidden mr-3 text-sm text-colortextsecondary"
                onClick={() => setMobileView("list")}
              >
                ←
              </button>
            )}
            <img
              src={folderIcon}
              alt="Folder Manager"
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-4"
            />
            <span>Folder Manager</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePurgeUnusedTags}
              className="hidden sm:block text-xs font-normal text-colortextsecondary hover:text-red-400 border border-colorborder px-3 py-1 rounded-sm hover:border-red-400 transition-colors duration-150"
              title="Delete tags not assigned to any course"
            >
              Clean unused tags
            </button>
            <button
              onClick={onClose}
              className="text-2xl font-light hover:text-red-400 leading-none -mt-0.5 ml-2"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left panel / Mobile list view ── */}
          <div
            className={`
            flex flex-col overflow-hidden
            w-full sm:w-2/5 sm:border-r sm:border-colorborder
            ${mobileView === "detail" ? "hidden sm:flex" : "flex"}
          `}
          >
            <div className="px-4 py-2.5 text-xs font-semibold text-colortextsecondary uppercase tracking-wider border-b border-colorborder shrink-0">
              Courses
            </div>
            <ul className="overflow-y-auto flex-1 py-1">
              {courses.length === 0 && (
                <li className="px-4 py-3 text-sm text-colortextsecondary">
                  No courses found.
                </li>
              )}
              {courses.map((course) => (
                <li key={course.id}>
                  <div
                    onClick={() => handleSelectCourse(course)}
                    className={`flex items-center px-4 py-3 sm:py-2.5 cursor-pointer hover:bg-colorsecondary border-l-4 transition-colors duration-150 ${
                      selectedCourse?.id === course.id
                        ? "border-l-gradientEnd bg-colorsecondary"
                        : "border-l-transparent"
                    }`}
                  >
                    <img
                      src={folderImg}
                      alt="Folder"
                      className="w-4 h-4 mr-2.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {course.name}
                      </div>
                      <div className="text-xs text-colortextsecondary truncate font-mono">
                        {course.path}
                      </div>
                    </div>
                    <span className="sm:hidden text-colortextsecondary text-lg ml-2">
                      ›
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Main folders section */}
            <div className="border-t border-colorborder shrink-0">
              <div className="px-4 py-2.5 text-xs font-semibold text-colortextsecondary uppercase tracking-wider border-b border-colorborder flex justify-between items-center">
                Main Folders
                <button
                  onClick={handlePurgeUnusedTags}
                  className="sm:hidden text-[10px] font-normal text-colortextsecondary hover:text-red-400 border border-colorborder px-2 py-0.5 rounded-sm"
                >
                  Clean unused tags
                </button>
              </div>
              <ul className="py-1 max-h-36 overflow-y-auto">
                {mainFolders.map((mf) => (
                  <li
                    key={mf.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-colorsecondary"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {mf.name || mf.path}
                      </div>
                      <div className="text-xs text-colortextsecondary truncate font-mono">
                        {mf.path}
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmRemove({ item: mf })}
                      className="ml-2 shrink-0 p-1"
                      title="Remove main folder"
                    >
                      <img
                        src={trashIcon}
                        alt="Remove"
                        className="w-4 h-4 opacity-60 hover:opacity-100"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right panel / Mobile detail view ── */}
          <div
            className={`
            flex-1 overflow-y-auto p-5
            ${mobileView === "list" ? "hidden sm:block" : "block"}
          `}
          >
            {selectedCourse ? (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-0.5">
                  {selectedCourse.name}
                </h2>
                <p className="text-xs font-mono text-colortextsecondary mb-5 break-all">
                  {selectedCourse.path}
                </p>

                {/* Active tags */}
                <div className="flex items-start mb-5">
                  <div className="mr-2 font-semibold text-gradientStart mt-0.5">
                    🔖
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-8">
                    {selectedCourse.tags.length > 0 ? (
                      selectedCourse.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="hover:cursor-pointer hover:scale-105 transform ease-in-out duration-200"
                          onClick={() => removeTag(tag)}
                        >
                          <Tag text={tag.name} color={tag.color} />
                        </span>
                      ))
                    ) : (
                      <p className="text-colortextsecondary text-sm">
                        No tags — add some below
                      </p>
                    )}
                  </div>
                </div>

                {/* Add tag input */}
                <div className="relative flex items-center w-full sm:w-52 mb-5">
                  <form onSubmit={handleAddTag} className="w-full">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full py-2 sm:py-1.5 bg-primarydark text-sm border-colorborder border px-2 pr-10 rounded-sm focus:outline-none focus:ring-1 focus:ring-white"
                      placeholder="# add a tag"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 text-white rounded-md hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd px-2"
                    >
                      ⏎
                    </button>
                  </form>
                </div>

                {/* Unused tags */}
                {unusedTags.length > 0 && (
                  <>
                    <div className="mb-1.5 font-medium text-colortextsecondary text-[9px] uppercase tracking-wide">
                      Click to add
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {unusedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="hover:cursor-pointer hover:scale-105 transform ease-in-out duration-200"
                          onClick={() => addTag(tag.name)}
                        >
                          <Tag text={tag.name} color={tag.color} />
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex flex-col items-center justify-center h-full text-colortextsecondary text-sm">
                <img
                  src={folderImg}
                  alt="Select a course"
                  className="w-12 h-12 mb-3 opacity-30"
                />
                <p>Select a course to manage its tags</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm remove dialog */}
        {confirmRemove && (
          <div className="absolute inset-0 flex items-end sm:items-center justify-center bg-primarydark/80 z-20">
            <div className="bg-primary border border-colorborder rounded-t-2xl sm:rounded-sm p-6 w-full sm:max-w-sm sm:mx-4 shadow-lg">
              <p className="text-sm font-medium mb-1">
                Remove this main folder and all its courses?
              </p>
              <p className="text-xs text-colortextsecondary font-mono mb-3 break-all">
                {confirmRemove.item.path}
              </p>
              <p className="text-xs text-red-400 mb-5">
                All courses inside this folder will be removed from the tracker.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmRemove(null)}
                  className="px-4 py-1.5 text-sm border border-colorborder rounded-sm hover:bg-colorsecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveMainFolder(confirmRemove.item)}
                  className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager;
