import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

interface ViewerProps {
    content: any;
}

export default function Viewer({ content }: ViewerProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content,
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none text-slate-700',
            },
        },
        immediatelyRender: false,
    })

    if (!content) return null;

    return <EditorContent editor={editor} />;
}
