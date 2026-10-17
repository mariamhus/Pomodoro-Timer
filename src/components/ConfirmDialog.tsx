import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => open && onCancel()}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      className="sheet max-w-sm"
    >
      <div className="px-6 pt-6 pb-5">
        <h2 id="confirm-title" className="text-xl font-bold tracking-tight">
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 text-muted">
          {message}
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-full border border-line px-5 font-medium transition-colors hover:border-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-10 items-center rounded-full bg-tomato px-5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
