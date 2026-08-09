"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PreviewProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Preview({ src, alt = "", width, height, className }: PreviewProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;

    dialogRef.current?.showModal();

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previous;
    };
  }, [opened]);

  if (!src) return null;

  const close = () => {
    setOpened(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={alt ? `${alt} 확대해서 보기` : "이미지 확대해서 보기"}
        onClick={() => setOpened(true)}
        className="my-6 block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={cn("block h-auto w-full", className)}
        />
      </button>

      {opened &&
        createPortal(
          <dialog
            ref={dialogRef}
            onClose={close}
            onClick={(event) => {
              if (event.target === dialogRef.current) close();
            }}
            className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80"
          >
            <div className="relative flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-[90dvh] max-w-[92vw] cursor-zoom-out object-contain"
                onClick={close}
              />
              <button
                type="button"
                aria-label="닫기"
                onClick={close}
                className="absolute top-6 right-6 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-xl leading-none text-white transition-colors hover:bg-black/80"
              >
                <span aria-hidden>×</span>
              </button>
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
}
