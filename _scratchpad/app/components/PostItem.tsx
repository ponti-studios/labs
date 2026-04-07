import { EditIcon, Loader2, Save, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import type { SearchResult, SocialPost } from '../types/vector-search';

interface PostItemProps {
  result: SearchResult;
  onUpdate: (postId: string, updates: Partial<SocialPost>) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}

export default function PostItem({ result, onUpdate, onDelete }: PostItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedContent, setEditedContent] = useState(result.post.content);
  const [editedAuthor, setEditedAuthor] = useState(result.post.author || '');
  const [editedPlatform, setEditedPlatform] = useState(result.post.platform || '');

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    if (!result.post.id) {
      console.error('Post ID is missing');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(result.post.id as string, {
        content: editedContent.trim(),
        author: editedAuthor.trim() || undefined,
        platform: editedPlatform.trim() || 'markdown',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete called');
    if (!confirm('Are you sure you want to delete this post?')) return;
    if (!result.post.id) {
      console.error('Post ID is missing');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(result.post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(result.post.content);
    setEditedAuthor(result.post.author || '');
    setEditedPlatform(result.post.platform || '');
  };

  const startEditing = () => {
    console.log('startEditing called');
    setIsEditing(true);
    setEditedContent(result.post.content);
    setEditedAuthor(result.post.author || '');
    setEditedPlatform(result.post.platform || '');
  };

  return (
    <Card className="space-y-0.5">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {result.post.platform} • {result.post.date}
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded bg-gray-100 px-2 py-1 text-xs">
              {Math.round(result.similarity * 100)}%
            </div>
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditing}
                  className="h-8 w-8 p-0"
                  title="Edit post"
                >
                  <EditIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                  title="Delete post"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="platform" className="block text-xs font-medium text-gray-700">
                  Platform
                </label>
                <Input
                  id="platform"
                  type="text"
                  value={editedPlatform}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditedPlatform(e.target.value)
                  }
                  className="mt-1"
                  placeholder="Platform"
                />
              </div>
              <div>
                <label htmlFor="author" className="block text-xs font-medium text-gray-700">
                  Author
                </label>
                <Input
                  id="author"
                  type="text"
                  value={editedAuthor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditedAuthor(e.target.value)
                  }
                  className="mt-1"
                  placeholder="Author"
                />
              </div>
            </div>
            <div>
              <label htmlFor="content" className="block text-xs font-medium text-gray-700">
                Content
              </label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditedContent(e.target.value)
                }
                rows={4}
                className="mt-1"
                placeholder="Post content"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isUpdating || !editedContent.trim()} size="sm">
                {isUpdating ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3 w-3" />
                )}
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isUpdating} size="sm">
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">{result.post.content}</p>
            {result.post.engagement && (
              <div className="mt-2 text-xs text-gray-500">Engagement: {result.post.engagement}</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
