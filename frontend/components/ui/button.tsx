import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex w-full justify-center rounded-lg bg-[#294D9D] px-5 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#1E40AF] focus:outline-none focus:ring-4 focus:ring-blue-300 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
