"use client";

import { useRef, useState, useTransition } from "react";
import { uploadDocumentoMezzo } from "./actions";

export function FileDropzone({ mezzoId }: { mezzoId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !inputRef.current) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(files[0]);
    inputRef.current.files = dataTransfer.files;
    startTransition(() => {
      formRef.current?.requestSubmit();
    });
  }

  return (
    <form ref={formRef} action={uploadDocumentoMezzo} className="contents">
      <input type="hidden" name="mezzo_id" value={mezzoId} />
      <input ref={inputRef} type="file" name="file" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-md border border-dashed px-4 py-6 text-sm transition-colors ${
          isDragging
            ? "border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-200"
            : "border-zinc-300 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        }`}
      >
        {isPending ? "Caricamento…" : "Trascina un file qui o clicca per selezionarlo"}
      </button>
    </form>
  );
}
