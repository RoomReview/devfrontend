import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  GripVertical,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react';

const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) =>
          normalizeImageWidth(element.getAttribute('data-width')),
        renderHTML: (attributes) => {
          const width = normalizeImageWidth(attributes.width);
          return { 'data-width': width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) =>
          normalizeImageDimension(element.getAttribute('data-height')),
        renderHTML: (attributes) => {
          const height = normalizeImageDimension(attributes.height);
          return height ? { 'data-height': height } : {};
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) =>
          normalizeImageAlignment(element.getAttribute('data-align')),
        renderHTML: (attributes) => {
          const align = normalizeImageAlignment(attributes.align);
          return { 'data-align': align };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const width = normalizeImageWidth(HTMLAttributes['data-width']);
    const height = normalizeImageDimension(HTMLAttributes['data-height']);
    const align = normalizeImageAlignment(HTMLAttributes['data-align']);
    const margin =
      align === 'left'
        ? '0 auto 0 0'
        : align === 'right'
          ? '0 0 0 auto'
          : '0 auto';

    return [
      'img',
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        style: `display:block;width:${width};max-width:none;height:${height ?? 'auto'};margin:${margin}`,
      },
    ];
  },
});

const BlogTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const fontSize = element.style.fontSize;
          return /^\d{1,2}px$/.test(fontSize) ? fontSize : null;
        },
        renderHTML: (attributes) => {
          const fontSize = normalizeFontSize(attributes.fontSize);
          return fontSize ? { style: `font-size:${fontSize}` } : {};
        },
      },
    };
  },
});

const editorExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
    },
  }),
  BlogTextStyle,
  BlogImage.configure({ allowBase64: true }),
];

const MAX_INLINE_IMAGE_SIZE = 2 * 1024 * 1024;
const allowedImageTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

const normalizeImageWidth = (width: string | null | undefined) =>
  normalizeImageDimension(width) ??
  (width &&
  /^(?:\d+(?:\.\d+)?)%$/.test(width) &&
  Number.isFinite(Number.parseFloat(width)) &&
  Number.parseFloat(width) > 0
    ? width
    : '100%');

const normalizeImageDimension = (dimension: string | null | undefined) => {
  if (!dimension || !/^(?:\d+(?:\.\d+)?)px$/.test(dimension)) return null;
  const parsed = Number.parseFloat(dimension);
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed}px` : null;
};

const normalizeImageAlignment = (align: string | null | undefined) =>
  align && ['left', 'center', 'right'].includes(align) ? align : 'center';

const normalizeFontSize = (fontSize: string | null | undefined) =>
  fontSize && /^\d{1,2}px$/.test(fontSize) &&
  Number.parseInt(fontSize, 10) >= 8 &&
  Number.parseInt(fontSize, 10) <= 96
    ? fontSize
    : null;

const readImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('The image could not be read.'));
    };
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });

interface BlogContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onError: (message: string) => void;
}

const BlogContentEditor = ({
  value,
  onChange,
  disabled,
  onError,
}: BlogContentEditorProps) => {
  const imageInput = useRef<HTMLInputElement>(null);
  const editorContainer = useRef<HTMLDivElement>(null);
  const resizeCleanup = useRef<(() => void) | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [selectedImageBox, setSelectedImageBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{
    index: number;
    top: number;
  } | null>(null);
  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    onSelectionUpdate: () => setSelectionVersion((version) => version + 1),
    editorProps: {
      attributes: {
        class:
          'min-h-[320px] px-5 py-4 text-base leading-7 text-[#2B363B] outline-none [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8B0000] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:my-5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-bold [&_img]:rounded-lg [&_li]:ml-6 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:list-disc',
        id: 'blog-draft-content',
        'aria-label': 'Article content',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || !editorContainer.current) return;
    const updateSelectedImageBox = () => {
      const selectedImage = editor.view.dom.querySelector(
        'img.ProseMirror-selectednode',
      );
      if (!(selectedImage instanceof HTMLImageElement)) {
        setSelectedImageBox(null);
        return;
      }
      const imageRect = selectedImage.getBoundingClientRect();
      setSelectedImageBox({
        left: imageRect.left,
        top: imageRect.top,
        width: imageRect.width,
        height: imageRect.height,
      });
    };

    const frame = requestAnimationFrame(updateSelectedImageBox);
    window.addEventListener('resize', updateSelectedImageBox);
    window.addEventListener('scroll', updateSelectedImageBox, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateSelectedImageBox);
      window.removeEventListener('scroll', updateSelectedImageBox, true);
    };
  }, [editor, selectionVersion]);

  useEffect(
    () => () => {
      resizeCleanup.current?.();
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom;
    const getBlock = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const block = target.closest('.ProseMirror > *');
      return block instanceof HTMLElement && block.parentElement === root
        ? block
        : null;
    };
    const clearDropTarget = () => {
      Array.from(root.children).forEach((child) =>
        child.classList.remove('ring-2', 'ring-[#8B0000]'),
      );
    };
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes('application/x-roomreview-blog-block')) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      clearDropTarget();
      getBlock(event.target)?.classList.add('ring-2', 'ring-[#8B0000]');
    };
    const handleDrop = (event: DragEvent) => {
      const transfer = event.dataTransfer;
      if (!transfer?.types.includes('application/x-roomreview-blog-block')) return;
      event.preventDefault();
      event.stopPropagation();
      const sourceIndex = Number(transfer.getData('application/x-roomreview-blog-block'));
      const target = getBlock(event.target);
      const targetIndex = target ? Array.from(root.children).indexOf(target) : -1;
      const blocks: Array<{
        node: ReturnType<typeof editor.state.doc.child>;
        position: number;
      }> = [];
      editor.state.doc.forEach((node, position) => {
        blocks.push({ node, position });
      });
      if (
        !Number.isInteger(sourceIndex) ||
        sourceIndex < 0 ||
        sourceIndex >= blocks.length ||
        targetIndex < 0 ||
        targetIndex >= blocks.length ||
        sourceIndex === targetIndex
      ) {
        return;
      }
      const [movedBlock] = blocks.splice(sourceIndex, 1);
      blocks.splice(targetIndex, 0, movedBlock);
      editor.commands.setContent({
        type: 'doc',
        content: blocks.map(({ node }) => node.toJSON()),
      });
      editor.view.focus();
      clearDropTarget();
    };

    root.addEventListener('dragover', handleDragOver);
    root.addEventListener('drop', handleDrop);

    return () => {
      root.removeEventListener('dragover', handleDragOver);
      root.removeEventListener('drop', handleDrop);
    };
  }, [disabled, editor]);

  if (!editor) return null;

  const buttonClass = (active = false) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 ${
      active ? 'bg-gray-100 text-[#8B0000]' : 'text-gray-700'
    }`;

  const moveSelectedBlock = (direction: -1 | 1) => {
    const document = editor.state.doc;
    const selectedPosition = editor.state.selection.$from.before(1);
    const blocks: Array<{
      node: ReturnType<typeof document.child>;
      position: number;
    }> = [];
    document.forEach((node, position) => {
      blocks.push({ node, position });
    });

    const selectedIndex = blocks.findIndex(
      ({ position }) => position === selectedPosition,
    );
    const targetIndex = selectedIndex + direction;
    if (selectedIndex < 0 || targetIndex < 0 || targetIndex >= blocks.length) {
      return;
    }

    [blocks[selectedIndex], blocks[targetIndex]] = [
      blocks[targetIndex],
      blocks[selectedIndex],
    ];
    editor.commands.setContent({
      type: 'doc',
      content: blocks.map(({ node }) => node.toJSON()),
    });
    editor.view.focus();
  };

  const handleImageSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      if (!allowedImageTypes.has(file.type)) {
        throw new Error('Choose a PNG, JPEG, GIF, or WebP image.');
      }
      if (file.size > MAX_INLINE_IMAGE_SIZE) {
        throw new Error('Images must be 2 MB or smaller.');
      }
      const src = await readImage(file);
      editor
        .chain()
        .focus()
        .setImage({ src, alt: file.name.replace(/\.[^.]+$/, '') })
        .run();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'The image could not be added.',
      );
    }
  };

  const setLink = () => {
    const currentHref = editor.getAttributes('link').href as
      | string
      | undefined;
    const href = window.prompt('Enter the link URL', currentHref ?? 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    try {
      const url = new URL(href);
      if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) {
        throw new Error('Use an HTTP, HTTPS, or email link.');
      }
      editor.chain().focus().setLink({ href: url.href }).run();
    } catch (error) {
      onError(
        error instanceof Error && error.message === 'Use an HTTP, HTTPS, or email link.'
          ? error.message
          : 'Enter a valid link URL.',
      );
    }
  };

  const imageSelected = editor.isActive('image');
  const currentFontSize = normalizeFontSize(
    editor.getAttributes('textStyle').fontSize,
  );
  const changeFontSize = (amount: -2 | 2) => {
    const currentSize = Number.parseInt(currentFontSize ?? '16px', 10);
    const nextSize = Math.min(96, Math.max(8, currentSize + amount));
    editor
      .chain()
      .focus()
      .setMark('textStyle', { fontSize: `${nextSize}px` })
      .run();
  };
  const resizeImage = (
    event: React.PointerEvent<HTMLButtonElement>,
    horizontalDirection: -1 | 0 | 1,
    verticalDirection: -1 | 0 | 1,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const image = editor.view.dom.querySelector(
      'img.ProseMirror-selectednode',
    );
    if (!(image instanceof HTMLImageElement)) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const imageRect = image.getBoundingClientRect();
    const startWidth = imageRect.width;
    const startHeight = imageRect.height;
    let nextWidth = startWidth;
    let nextHeight = startHeight;
    const pointerId = event.pointerId;

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const horizontalDelta =
        (pointerEvent.clientX - startX) * horizontalDirection;
      const verticalDelta =
        (pointerEvent.clientY - startY) * verticalDirection;

      if (horizontalDirection !== 0) {
        nextWidth = Math.max(1, startWidth + horizontalDelta);
      }
      if (verticalDirection !== 0) {
        nextHeight = Math.max(1, startHeight + verticalDelta);
      }

      image.style.width = `${nextWidth}px`;
      image.style.height = `${nextHeight}px`;
      requestAnimationFrame(() => {
        const imageRect = image.getBoundingClientRect();
        setSelectedImageBox({
          left: imageRect.left,
          top: imageRect.top,
          width: imageRect.width,
          height: imageRect.height,
        });
      });
    };
    const finishResize = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) return;
      if (pointerEvent.type === 'pointercancel') {
        image.style.removeProperty('width');
        image.style.removeProperty('height');
      } else if (
        nextWidth !== startWidth ||
        nextHeight !== startHeight
      ) {
        editor.commands.updateAttributes('image', {
          width: `${nextWidth}px`,
          height: `${nextHeight}px`,
        });
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishResize);
      window.removeEventListener('pointercancel', finishResize);
      resizeCleanup.current = null;
      requestAnimationFrame(() => {
        image.style.removeProperty('width');
        image.style.removeProperty('height');
      });
      editor.view.focus();
    };

    resizeCleanup.current?.();
    resizeCleanup.current = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishResize);
      window.removeEventListener('pointercancel', finishResize);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishResize);
    window.addEventListener('pointercancel', finishResize);
  };
  const handleEditorMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;
    const block = event.target.closest('.ProseMirror > *');
    if (!(block instanceof HTMLElement) || block.parentElement !== editor.view.dom) {
      setDraggedBlock(null);
      return;
    }
    const index = Array.from(editor.view.dom.children).indexOf(block);
    const top =
      block.getBoundingClientRect().top -
      event.currentTarget.getBoundingClientRect().top +
      event.currentTarget.scrollTop;
    setDraggedBlock({ index, top });
  };

  return (
    <div
      ref={editorContainer}
      className="relative overflow-visible rounded-xl border border-gray-300"
      onMouseMove={handleEditorMouseMove}
      onMouseLeave={() => setDraggedBlock(null)}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <button
          type="button"
          aria-label="Heading"
          title="Heading"
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Bold"
          title="Bold"
          className={buttonClass(editor.isActive('bold'))}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          title="Italic"
          className={buttonClass(editor.isActive('italic'))}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Bulleted list"
          title="Bulleted list"
          className={buttonClass(editor.isActive('bulletList'))}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          title="Numbered list"
          className={buttonClass(editor.isActive('orderedList'))}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Quote"
          title="Quote"
          className={buttonClass(editor.isActive('blockquote'))}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Add link"
          title="Add link"
          className={buttonClass(editor.isActive('link'))}
          disabled={disabled}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 border-l border-gray-300" aria-hidden="true" />
        <button
          type="button"
          aria-label="Insert image"
          title="Insert image"
          className={buttonClass()}
          disabled={disabled}
          onClick={() => imageInput.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <label
          className="ml-1 text-xs font-medium text-gray-600"
          htmlFor="blog-draft-font-size"
        >
          Font size
        </label>
        <select
          id="blog-draft-font-size"
          aria-label="Font size"
          title="Font size for selected text"
          value={currentFontSize ?? ''}
          disabled={disabled}
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          onChange={(event) => {
            const fontSize = event.target.value;
            const chain = editor.chain().focus();
            if (fontSize) chain.setMark('textStyle', { fontSize }).run();
            else chain.unsetMark('textStyle').run();
          }}
        >
          <option value="">Default</option>
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(
            (size) => (
              <option key={size} value={`${size}px`}>
                {size}px
              </option>
            ),
          )}
        </select>
        <button
          type="button"
          aria-label="Decrease font size"
          title="Decrease font size"
          className={buttonClass()}
          disabled={disabled}
          onClick={() => changeFontSize(-2)}
        >
          A-
        </button>
        <button
          type="button"
          aria-label="Increase font size"
          title="Increase font size"
          className={buttonClass()}
          disabled={disabled}
          onClick={() => changeFontSize(2)}
        >
          A+
        </button>
        <input
          ref={imageInput}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={handleImageSelection}
        />
        {(['100%', '75%', '50%'] as const).map((width) => (
          <button
            key={width}
            type="button"
            aria-label={`Set image width to ${width}`}
            title={`Image width ${width}`}
            className={buttonClass(
              imageSelected && editor.getAttributes('image').width === width,
            )}
            disabled={disabled || !imageSelected}
            onClick={() =>
              editor.chain().focus().updateAttributes('image', { width }).run()
            }
          >
            {width}
          </button>
        ))}
        <button
          type="button"
          aria-label="Align image left"
          title="Align image left"
          className={buttonClass(
            imageSelected && editor.getAttributes('image').align === 'left',
          )}
          disabled={disabled || !imageSelected}
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes('image', { align: 'left' })
              .run()
          }
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Align image center"
          title="Align image center"
          className={buttonClass(
            imageSelected && editor.getAttributes('image').align === 'center',
          )}
          disabled={disabled || !imageSelected}
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes('image', { align: 'center' })
              .run()
          }
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Align image right"
          title="Align image right"
          className={buttonClass(
            imageSelected && editor.getAttributes('image').align === 'right',
          )}
          disabled={disabled || !imageSelected}
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes('image', { align: 'right' })
              .run()
          }
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 border-l border-gray-300" aria-hidden="true" />
        <button
          type="button"
          aria-label="Move block up"
          title="Move selected block up"
          className={buttonClass()}
          disabled={disabled}
          onClick={() => moveSelectedBlock(-1)}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Move block down"
          title="Move selected block down"
          className={buttonClass()}
          disabled={disabled}
          onClick={() => moveSelectedBlock(1)}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 border-l border-gray-300" aria-hidden="true" />
        <button
          type="button"
          aria-label="Undo"
          title="Undo"
          className={buttonClass()}
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo"
          className={buttonClass()}
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
      {imageSelected && selectedImageBox && !disabled && (
        <div
          aria-label="Resize selected image"
          className="pointer-events-none fixed z-50 border-2 border-[#8B0000]"
          style={{
            left: selectedImageBox.left,
            top: selectedImageBox.top,
            width: selectedImageBox.width,
            height: selectedImageBox.height,
          }}
        >
          {([
            {
              position: 'top-0 left-0',
              horizontal: -1,
              vertical: -1,
              cursorClass: 'cursor-nwse-resize',
              label: 'top left corner',
            },
            {
              position: 'top-0 right-0',
              horizontal: 1,
              vertical: -1,
              cursorClass: 'cursor-nesw-resize',
              label: 'top right corner',
            },
            {
              position: 'bottom-0 left-0',
              horizontal: -1,
              vertical: 1,
              cursorClass: 'cursor-nesw-resize',
              label: 'bottom left corner',
            },
            {
              position: 'bottom-0 right-0',
              horizontal: 1,
              vertical: 1,
              cursorClass: 'cursor-nwse-resize',
              label: 'bottom right corner',
            },
            {
              position: 'top-1/2 left-0',
              horizontal: -1,
              vertical: 0,
              cursorClass: 'cursor-ew-resize',
              label: 'left edge',
            },
            {
              position: 'top-1/2 right-0',
              horizontal: 1,
              vertical: 0,
              cursorClass: 'cursor-ew-resize',
              label: 'right edge',
            },
            {
              position: 'top-0 left-1/2',
              horizontal: 0,
              vertical: -1,
              cursorClass: 'cursor-ns-resize',
              label: 'top edge',
            },
            {
              position: 'bottom-0 left-1/2',
              horizontal: 0,
              vertical: 1,
              cursorClass: 'cursor-ns-resize',
              label: 'bottom edge',
            },
          ] as const).map(
            ({ position, horizontal, vertical, cursorClass, label }) => (
            <button
              key={position}
              type="button"
              aria-label={`Resize image from ${label}`}
              title="Drag to resize image"
              className={`pointer-events-auto absolute ${position} h-3 w-3 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-[#8B0000] bg-white ${cursorClass}`}
              onPointerDown={(event) =>
                resizeImage(event, horizontal, vertical)
              }
            />
            ),
          )}
        </div>
      )}
      {draggedBlock && !disabled && (
        <button
          type="button"
          draggable
          aria-label="Drag to reorder block"
          title="Drag to reorder this block"
          className="absolute left-1 z-10 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-[#8B0000] active:cursor-grabbing"
          style={{ top: `${draggedBlock.top}px` }}
          onMouseDown={(event) => event.preventDefault()}
          onDragStart={(event) => {
            event.dataTransfer.setData(
              'application/x-roomreview-blog-block',
              `${draggedBlock.index}`,
            );
            event.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            editor.view.dom
              .querySelectorAll('.ring-2')
              .forEach((element) =>
                element.classList.remove('ring-2', 'ring-[#8B0000]'),
              );
          }}
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <p className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        Drag blocks to reorder them or use the arrows. Side handles change width,
        top and bottom handles change height, and corner handles change both.
      </p>
    </div>
  );
};

export default BlogContentEditor;
