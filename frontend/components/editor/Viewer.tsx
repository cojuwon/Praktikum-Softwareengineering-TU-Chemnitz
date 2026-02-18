import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import BoldExtension from '@tiptap/extension-bold'
import ItalicExtension from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

interface ViewerProps {
    content: any;
}

export default function Viewer({ content }: ViewerProps) {
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
