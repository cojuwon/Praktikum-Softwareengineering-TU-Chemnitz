import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import BoldExtension from '@tiptap/extension-bold' // Rename to avoid conflict with Icon
import ItalicExtension from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import History from '@tiptap/extension-history'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react'
import clsx from 'clsx'
import { useEffect } from 'react'

interface RichTextEditorProps {
    content: any; // JSON or HTML
    onChange: (json: any) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    const Button = ({ onClick, isActive, disabled, children, title }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "p-1.5 rounded-md transition-colors text-slate-600 hover:bg-slate-100",
                isActive && "bg-blue-50 text-blue-600",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            title={title}
            type="button"
        >
            {children}
        </button>
    )

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50/50">
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Fett"
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Kursiv"
            >
                <Italic className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Unterstrichen"
            >
                <UnderlineIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Liste"
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Nummerierte Liste"
            >
                <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

            <Button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
            >
                <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
            >
                <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
            >
                <AlignRight className="w-4 h-4" />
            </Button>

        </div>
    )
}

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            BoldExtension,
            ItalicExtension,
            Strike,
            BulletList,
            OrderedList,
            ListItem,
            History,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Notiz schreiben...',
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] p-4 max-w-none',
            },
        },
        immediatelyRender: false,
    })

    // Update content if it changes externally (e.g. loading)
    useEffect(() => {
        if (editor && content) {
            // Check if content is different to avoid cursor jumps or loops is tricky with JSON
            // Simple check: if editor is empty and content provided, set it.
            // For distinct updates, we might need a deep check or control via key.
            if (editor.isEmpty && Object.keys(content).length > 0) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    )
}
