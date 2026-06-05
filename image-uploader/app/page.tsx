"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);

type Preview = {
  url: string;
  kind: "image" | "pdf";
};

export default function Home() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, []);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(extension)) {
      return "Invalid file type. Please upload a JPG, PNG or PDF.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File is too large. Maximum allowed size is 5MB.";
    }

    return null;
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const nextUrl = URL.createObjectURL(file);

    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
    }

    const kind: Preview["kind"] = file.type === "application/pdf" ? "pdf" : "image";

    previousUrlRef.current = nextUrl;
    setPreview({ url: nextUrl, kind });
    setErrorMessage(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    handleFile(droppedFile);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    handleFile(selectedFile);
    event.target.value = "";
  };

  return (
    <main className="page">
      <h1 className="title">Image Uploader</h1>

      <label
        className="uploadZone"
        htmlFor="image-upload"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="image-upload"
          className="hiddenInput"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handleInputChange}
        />
        <span className="uploadHeading">Click to upload or drag &amp; drop</span>
        <span className="uploadSubtext">JPG, PNG or PDF, up to 5MB</span>
      </label>

      {errorMessage ? (
        <p className="errorMessage" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}

      {preview ? (
        <section className="previewSection">
          <h2 className="previewTitle">Preview</h2>
          {preview.kind === "image" ? (
            <img className="previewImage" src={preview.url} alt="Uploaded preview" />
          ) : (
            <embed
              className="previewEmbed"
              src={preview.url}
              type="application/pdf"
              title="PDF preview"
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
