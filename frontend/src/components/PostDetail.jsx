import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../App';
import toast from "react-hot-toast";

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    loadPost();
    loadComments();
  }, [slug]);

  const loadPost = async () => {
    try {
      const data = await api.getPost(slug);
      setPost(data);
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(slug);
      setComments(data.results || data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(slug);
      toast.success("Post Deleted successfully!");
      navigate('/');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.createComment({ post: post.id, body: newComment });
      setNewComment('');
      loadComments();
      toast.success("New comment added successfully!");
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editBody.trim()) return;
    try {
      await api.updateComment(commentId, { post: post.id, body: editBody });
      setEditingComment(null);
      setEditBody('');
      loadComments();
      toast.success("Comment updated successfully!");
    } catch (err) {
      console.log(err)
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      loadComments();
      toast.success("Comment deleted successfully!");
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-circle display-4 text-muted"></i>
        <h4 className="text-muted mt-2">Post not found</h4>
        <Link to="/" className="btn btn-primary mt-3">Back to Posts</Link>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          {post.image_url && (
            <img
              src={post.image_url}
              className="card-img-top"
              alt={post.title}
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          )}
          <div className="card-body p-4">
            <h2 className="fw-bold text-dark mb-2">{post.title}</h2>
            <div className="d-flex align-items-center text-muted small mb-3 pb-3 border-bottom">
              <i className="bi bi-person-circle me-1"></i>
              <span className="me-3">{post.author.username}</span>
              <i className="bi bi-calendar3 me-1"></i>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            {post.tags && (
              <div className="mb-3">
                {post.tags.split(',').map((tag, index) => (
                  <span key={index} className="badge bg-primary bg-opacity-10 text-primary me-1">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="post-content mb-4">{post.body}</div>

            {user && user.id === post.author.id && (
              <div className="d-flex gap-2 mb-4 pb-3 border-bottom">
                <Link to={`/posts/${slug}/edit`} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-pencil me-1"></i>Edit
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            )}

            <div className="comments-section">
              <h5 className="fw-semibold mb-3">
                <i className="bi bi-chat-dots me-2"></i>Comments ({comments.length})
              </h5>

              {user && (
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <form onSubmit={handleAddComment}>
                      <div className="mb-3">
                        <textarea
                          className="form-control"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          rows={3}
                        />
                      </div>
                      <button className="btn btn-primary btn-sm" type="submit">
                        <i className="bi bi-send me-1"></i>Add Comment
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {comments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-chat-left-text display-6 d-block mb-2"></i>
                  <p className="mb-0">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-item py-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="text-muted small">
                          <i className="bi bi-person-circle me-1"></i>
                          <strong className="text-dark">{comment.author.username}</strong>
                          <span className="mx-2">|</span>
                          <i className="bi bi-clock me-1"></i>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                        {user && user.id === comment.author.id && (
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-2"
                              onClick={() => { setEditingComment(comment.id); setEditBody(comment.body); }}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-2"
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment.id ? (
                        <div>
                          <textarea
                            className="form-control mb-2"
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={3}
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateComment(comment.id)}
                            >
                              <i className="bi bi-check-lg me-1"></i>Save
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => { setEditingComment(null); setEditBody(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-0 text-secondary">{comment.body}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
