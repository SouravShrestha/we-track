"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { addMainFolder, fetchMainFolders } from "../utils/api";
const newFolderIcon = "/images/add-folder.png";

const Popup = ({ isOpen, onClose, onFoldersUpdate }) => {
  const [folderPath, setFolderPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const loadFolders = async () => {
    const stored = await fetchMainFolders();
    setFolders(stored);
  };

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      inputRef.current?.focus();
      setFolderPath("");
      setMessage("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    try {
      await addMainFolder(folderPath);
      setErrorMessage("");
      setMessage("🎉 Folder added successfully!");
      await loadFolders();
      onFoldersUpdate();
      onClose();
    } catch (error) {
      setMessage("");
      setErrorMessage(error.message);
    }
    setFolderPath("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center bg-primarydark/70"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="
          w-full rounded-t-xl sm:rounded-md
          bg-primary border border-colorborder
          px-5 pt-8 pb-8 sm:px-8 sm:py-6
          sm:w-3/4 md:w-1/2 lg:w-1/3
          relative
          animate-slide-up sm:animate-none
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-colortextsecondary hover:text-red-400 text-2xl leading-none"
          onClick={onClose}
          aria-label="Close popup"
        >
          &times;
        </button>

        {/* Existing folders */}
        <div className="mb-4">
          <h3 className="mb-3 text-sm font-semibold">Existing Folders</h3>
          <div className="max-h-36 overflow-y-auto flex flex-wrap gap-2">
            {folders.length ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="max-w-full px-2 py-1 border border-colorborder rounded-sm text-xs truncate"
                  title={folder.path}
                >
                  {folder.path}
                </div>
              ))
            ) : (
              <div className="text-colortextsecondary text-xs">
                No folders available. Add a new folder below 👇
              </div>
            )}
          </div>
        </div>

        {/* Add new folder */}
        <div className="flex items-center mb-3 mt-5">
          <img
            src={newFolderIcon}
            alt="Add folder"
            className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3"
          />
          <h2 className="text-sm md:text-base font-semibold">
            Add a new folder
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="w-full py-2 sm:py-1.5 bg-primarydark text-sm border-colorborder border px-3 pr-10 mb-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="Enter folder path"
              ref={inputRef}
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 text-white rounded-md hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd px-2 py-0.5"
            >
              ⏎
            </button>
          </div>
        </form>
        {message && (
          <div className="text-colortextsecondary text-xs">{message}</div>
        )}
        {errorMessage && (
          <div className="text-red-400 text-xs">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Popup;
