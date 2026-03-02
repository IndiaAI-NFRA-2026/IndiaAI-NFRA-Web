'use client';

import { Editor, EditorContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  editor: Editor;
  updateKey: number;
  setUpdateKey: (updater: (prev: number) => number) => void;
  error?: string;
}

export function RichTextEditor({ editor, updateKey, setUpdateKey, error }: Readonly<RichTextEditorProps>) {
  return (
    <div>
      {/* Toolbar */}
      <div
        data-update-key={updateKey}
        className={cn(
          'mt-1 mb-0 flex flex-wrap items-center gap-1 rounded-t-md border bg-white px-2 py-1',
          error ? 'border-red-500 border-b-(--color-filters-border)' : 'border-(--color-filters-border)'
        )}
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2">
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleBold().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('bold') && 'bg-gray-300'
            )}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('italic') && 'bg-gray-300'
            )}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleUnderline().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('underline') && 'bg-gray-300'
            )}
            aria-label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleStrike().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('strike') && 'bg-gray-300'
            )}
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().setTextAlign('left').run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive({ textAlign: 'left' }) && 'bg-gray-300'
            )}
            aria-label="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().setTextAlign('center').run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive({ textAlign: 'center' }) && 'bg-gray-300'
            )}
            aria-label="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().setTextAlign('right').run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive({ textAlign: 'right' }) && 'bg-gray-300'
            )}
            aria-label="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().setTextAlign('justify').run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive({ textAlign: 'justify' }) && 'bg-gray-300'
            )}
            aria-label="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('bulletList') && 'bg-gray-300'
            )}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
              setUpdateKey((prev) => prev + 1);
            }}
            className={cn(
              'color-(--color-table-text-color) max-h-8 cursor-pointer rounded bg-transparent px-2 py-0 hover:bg-gray-200',
              editor.isActive('orderedList') && 'bg-gray-300'
            )}
            aria-label="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={cn('rounded-b-md border-x border-b border-(--color-filters-border)', error && 'border-red-500')}>
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:min-h-[60px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:outline-none"
        />
      </div>
    </div>
  );
}
