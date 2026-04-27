'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipImage from '@tiptap/extension-image';
import TipLink from '@tiptap/extension-link';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as LI, Image as ImgI, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, TipImage, TipLink.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'outline-none', 'data-placeholder': 'Write your story...' } },
  });

  if (!editor) return null;

  const TB = ({ onClick, active, icon: I, title }: { onClick: () => void; active?: boolean; icon: any; title: string }) => (
    <button type="button" title={title} onClick={onClick}
      className={cn('w-8 h-8 flex items-center justify-center transition-colors', active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}>
      <I className="w-4 h-4" />
    </button>
  );

  return (
    <div className="tiptap-wrap border border-gray-200 bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <TB onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
        <TB onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
        <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="List" />
        <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered" />
        <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Quote" />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <TB onClick={() => { const u = prompt('URL:'); if (u) editor.chain().focus().setLink({ href: u }).run(); }} active={editor.isActive('link')} icon={LI} title="Link" />
        <TB onClick={() => { const u = prompt('Image URL:'); if (u) editor.chain().focus().setImage({ src: u }).run(); }} icon={ImgI} title="Image" />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
