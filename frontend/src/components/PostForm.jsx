import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import toast from "react-hot-toast";

const AVAILABLE_TAGS = [
  'Python', 'Django', 'JavaScript', 'React', 'Node.js',
  'HTML', 'CSS', 'Database', 'API', 'DevOps', 'AI/ML', 'Security'
];

export default function PostForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api.getPost(slug).then(data => {
        setTitle(data.title);
        setBody(data.body);
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
        if (data.tags) {
          setSelectedTags(data.tags.split(',').map(t => t.trim()).filter(t => t));
        }
      }).catch(() => setErrors({ detail: 'Failed to load post' }));
    }
  }, [slug, isEditing]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);

    const input = document.getElementById('imageInput');
    if (input) {
      input.value = '';
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setErrors(prev => ({ ...prev, tags: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', body.trim());
      formData.append('tags', selectedTags.join(', '));

      if (imageFile) {
        formData.append('image', imageFile);
      }
      if(removeImage){
        formData.append('remove_image', 'true');
      }

      if (isEditing) {
        await api.updatePost(slug, formData);
        toast.success("Post updated successfully!");
      } else {
        await api.createPost(formData);
        toast.success("Post created successfully!");
      }
      navigate('/');
    } catch (err) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h4 className="fw-semibold mb-4">
              <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h4>

            <form onSubmit={handleSubmit} className="needs-validation" encType="multipart/form-data">
              <div className="mb-3">
                <label className="form-label fw-medium">Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: null }));
                  }}
                />
                <div className="invalid-feedback">
                  {errors.title?.[0]}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Image</label>
                <div className={`border rounded p-3 ${errors.image ? 'border-danger' : ''}`}>
                  {imagePreview ? (
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: '200px' }}
                      />
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleRemoveImage}
                        >
                          <i className="bi bi-trash me-1"></i>Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-cloud-arrow-up display-4 text-muted"></i>
                      <p className="text-muted mb-2">Click to upload or drag and drop</p>
                      <input
                        type="file"
                        id="imageInput"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <small className="text-muted">JPG, PNG, GIF, or WebP (max 5MB)</small>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <div className="text-danger small mt-1">
                    {errors.image[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Tags</label>
                <div className={`border rounded p-3 ${errors.tags ? 'border-danger' : ''}`}>
                  <div className="d-flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <div key={tag} className="form-check">
                        <input
                          type="checkbox"
                          className="btn-check"
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                        />
                        <label
                          className={`btn btn-outline-primary btn-sm ${selectedTags.includes(tag) ? 'active' : ''}`}
                          htmlFor={`tag-${tag}`}
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.tags && (
                  <div className="text-danger small mt-1">
                    {errors.tags[0]}
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">Selected: {selectedTags.join(', ')}</small>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Body</label>
                <textarea
                  className={`form-control ${errors.body ? 'is-invalid' : ''}`}
                  rows={12}
                  placeholder="Write your post content here..."
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setErrors(prev => ({ ...prev, body: null }));
                  }}
                />
                <div className="invalid-feedback">
                  {errors.body?.[0]}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary px-4"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
