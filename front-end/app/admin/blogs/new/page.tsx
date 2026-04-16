import { BlogEditorForm } from '@/components/pickleball/blog-editor-form'

export const metadata = {
  title: 'Viết bài mới | PicklePro Admin',
}

export default function NewBlogPage() {
  return <BlogEditorForm mode="new" />
}
