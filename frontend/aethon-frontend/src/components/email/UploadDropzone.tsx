import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "../../utils/classNames";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, disabled }: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFile(acceptedFiles[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "message/rfc822": [".eml"],
      "application/vnd.ms-outlook": [".msg"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={cn(
        "dropzone",
        isDragActive && "dropzone--active",
        disabled && "dropzone--disabled",
        file && "dropzone--has-file"
      )}
      id="email-dropzone"
      aria-label="Drop email file here or click to browse"
    >
      <input {...getInputProps()} aria-label="Email file upload" />
      {file ? (
        <div className="dropzone__file">
          <FileText size={24} className="dropzone__file-icon" />
          <div>
            <p className="dropzone__file-name">{file.name}</p>
            <p className="dropzone__file-size">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ) : (
        <div className="dropzone__prompt">
          <UploadCloud size={32} className="dropzone__prompt-icon" />
          <p className="dropzone__prompt-primary">
            {isDragActive ? "Drop the file here" : "Drop an .eml, .msg, or .txt file"}
          </p>
          <p className="dropzone__prompt-secondary">or click to browse</p>
        </div>
      )}
    </div>
  );
}
