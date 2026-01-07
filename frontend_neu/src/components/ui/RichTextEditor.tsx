'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700",
                    editor.isActive('bold') && "bg-gray-200 text-black font-medium"
                )}
                title="Fett"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700",
                    editor.isActive('italic') && "bg-gray-200 text-black font-medium"
                )}
                title="Kursiv"
            >
                <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700",
                    editor.isActive('bulletList') && "bg-gray-200 text-black font-medium"
                )}
                title="Liste"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700",
                    editor.isActive('orderedList') && "bg-gray-200 text-black font-medium"
                )}
                title="Nummerierte Liste"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
                title="Rückgängig"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
                title="Wiederholen"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Text eingeben...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none'
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3',
                    className
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content if value changes externally (and isn't the same)
    // This is tricky with Tiptap to avoid loops/cursor jumps, simplistic approach here:
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Only update if drastically different to avoid cursor issues, might need better logic
            // For now, assume this is mostly for initial load or full resets
            if (editor.getText() === '' && value === '') return;
            // If the editor is focused, we probably shouldn't force update unless we are sure
            // For this use case (Forms), usually we want to control it.
            // A safer way is to compare text content or simple HTML
            if (value === '<p></p>' && editor.isEmpty) return;
            editor.commands.setContent(value);
        }
    }, [value, editor]);


    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow bg-white">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
