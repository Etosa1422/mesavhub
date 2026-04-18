"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import { Highlight } from "@tiptap/extension-highlight"
import CodeBlock from "@tiptap/extension-code-block"
import Image from "@tiptap/extension-image"
import { 
  Mail, 
  Send, 
  AlertCircle, 
  X as XIcon, 
  Check as CheckIcon, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Image as ImageIcon 
} from "lucide-react"
import { getUserById, sendEmailToUser } from "../../services/adminService"

const SendEmailForm = ({ user: propUser, onCancel }) => {
  const params = useParams()
  const userId = params.id
  const [user, setUser] = useState(propUser || null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      CodeBlock,
      Image,
    ],
    content: message,
    onUpdate: ({ editor }) => {
      setMessage(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!propUser && userId) {
      const fetchUser = async () => {
        try {
          const userData = await getUserById(userId)
          setUser(userData)
        } catch (error) {
          toast.error("Failed to fetch user data")
        }
      }
      fetchUser()
    }
  }, [userId, propUser])

  const insertImage = () => {
    const url = window.prompt('Enter the URL of the image:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await sendEmailToUser(user.id, subject, message)
      toast.success(response.message || "Email sent successfully")
      setSubject("")
      setMessage("")
      editor.commands.clearContent()
      onCancel?.()
    } catch (error) {
      if (error.response) {
        if (error.response.data.errors) {
          const errors = error.response.data.errors
          Object.keys(errors).forEach((field) => {
            toast.error(`${field}: ${errors[field].join(', ')}`)
          })
        } else {
          toast.error(error.response.data.message || "Something went wrong.")
        }
      } else {
        toast.error("Network error. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <div className="border border-gray-300 rounded-md">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("bold") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("italic") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("underline") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("strike") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("bulletList") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("orderedList") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive("codeBlock") ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "left" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "center" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: "right" }) ? "bg-gray-100 text-green-500" : "text-gray-600"}`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Editor */}
            <EditorContent 
              editor={editor} 
              className="min-h-[200px] p-3 focus:outline-none" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SendEmailForm