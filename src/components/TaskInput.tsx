interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskInput({ value, onChange }: TaskInputProps) {
  return (
    <div className="w-full max-w-sm">
      <label htmlFor="task" className="sr-only">
        What are you working on?
      </label>
      <input
        id="task"
        value={value}
        maxLength={60}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
        }}
        placeholder="What are you working on?"
        className="h-11 w-full border-b-2 border-white/30 bg-transparent text-center text-lg font-medium text-white placeholder:text-white/60 focus:border-white focus:outline-none"
      />
    </div>
  );
}
