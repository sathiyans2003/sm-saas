import { useState } from 'react';
import { createTag } from '../../api/tagsApi';

const CreateTagModal = ({ show, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0d6efd');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Tag name required');
      return;
    }

    try {
      setLoading(true);
      const res = await createTag({ name, color });
      onCreated(res.data);   // 🔥 parent-ku new tag return
      onClose();
      setName('');
    } catch (err) {
      alert('Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Create Tag</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <label className="form-label">Tag Name</label>
              <input
                className="form-control mb-3"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <label className="form-label">Tag Color</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={color}
                onChange={e => setColor(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
};

export default CreateTagModal;
