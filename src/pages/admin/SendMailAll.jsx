"use client"
import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import { Highlight } from "@tiptap/extension-highlight"
import CodeBlock from "@tiptap/extension-code-block"
import { Send, AlertCircle, X, Check, Loader2, ChevronDown, ChevronUp, Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Code, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { sendEmailToAllUsers } from "../../services/adminService"

// Toolbar for text formatting
const MenuBar = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 mb-2 border-b border-gray-200 pb-2 px-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("underline") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("strike") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("bulletList") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("orderedList") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("codeBlock") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function SendMailAll() {
  const [subject, setSubject] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(null)
  const [sendError, setSendError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      CodeBlock,
    ],
    content: "<p>Write your message here...</p>",
    editable: !isSending,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editor || !subject) return

    setIsSending(true)
    setSendSuccess(null)
    setSendError(null)

    try {
      const message = editor.getHTML()
      const response = await sendEmailToAllUsers(subject, message)
      setSendSuccess(response.message || "Email sent successfully!")
      setSubject("")
      editor.commands.setContent("<p></p>")
    } catch (err) {
      setSendError(err.response?.data?.message || "Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Email To All Users</h1>
      </div>

      {/* Status Alerts */}
      {sendSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r-lg flex items-center">
          <Check className="h-5 w-5 text-emerald-500 mr-2" />
          <p className="text-sm text-emerald-700 flex-1">{sendSuccess}</p>
          <button onClick={() => setSendSuccess(null)} className="p-1 text-emerald-500 hover:bg-emerald-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {sendError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700 flex-1">{sendError}</p>
          <button onClick={() => setSendError(null)} className="p-1 text-red-500 hover:bg-red-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Email Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="font-medium text-gray-700">Send Email</h2>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {isExpanded && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Write Subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
                disabled={isSending}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <MenuBar editor={editor} />
                <EditorContent
                  editor={editor}
                  className="min-h-[300px] p-4 prose prose-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSending || !editor || !subject}
                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
