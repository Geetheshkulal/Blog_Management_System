import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../App';
import toast from "react-hot-toast";

export default function PostList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (query = '') => {
    setLoading(true);
    try {
      const params = query ? { search: query } : {};
      const data = await api.getPosts(params);
      setPosts(data.results || data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPosts(search);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(slug);
      setPosts(posts.filter(p => p.slug !== slug));
      toast.success("Post deleted successfully!");
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Loading posts...</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search posts by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary px-4" type="submit">
            Search
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-journal-x empty-state-icon"></i>
            <h5 className="text-muted">No posts found</h5>
            <p className="text-muted mb-3">
              {search ? 'Try a different search term' : 'Be the first to create a post!'}
            </p>
            {user && (
              <Link to="/posts/new" className="btn btn-primary">
                <i className="bi bi-plus-circle me-1"></i>Create Post
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {posts.map(post => (
            <div key={post.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100 post-card">
                <Link to={`/posts/${post.slug}`} className="text-decoration-none">
                  <div className="post-image-container">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        className="card-img-top post-image"
                        alt={post.title}
                      />
                    ) : (
                      <div className="card-img-top post-image-placeholder d-flex align-items-center justify-content-center bg-light">
                        <i className="bi bi-image display-4 text-muted"></i>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="text-decoration-none"
                    >
                      <h5 className="card-title fw-semibold text-dark mb-0">
                        {post.title}
                      </h5>
                    </Link>
                    {user && user.id === post.author.id && (
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light rounded-circle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                          <li>
                            <Link to={`/posts/${post.slug}/edit`} className="dropdown-item">
                              <i className="bi bi-pencil me-2"></i>Edit
                            </Link>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(post.slug)}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="card-text text-muted mb-3 flex-grow-1">
                    {post.body.substring(0, 100)}{post.body.length > 100 ? '...' : ''}
                  </p>

                  {post.tags && (
                    <div className="mb-3">
                      {post.tags.split(',').slice(0, 3).map((tag, index) => (
                        <span key={index} className="badge bg-primary bg-opacity-10 text-primary me-1">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="d-flex align-items-center text-muted small border-top pt-3">
                    <i className="bi bi-person-circle me-1"></i>
                    <span className="me-3">{post.author.username}</span>
                    <i className="bi bi-calendar3 me-1"></i>
                    <span className="me-3">{new Date(post.created_at).toLocaleDateString()}</span>
                    <i className="bi bi-chat-dots me-1"></i>
                    <span>{post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
