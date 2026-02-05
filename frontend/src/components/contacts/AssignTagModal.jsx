import { useEffect, useState } from 'react';
import {
  fetchTags,
  bulkAssignTag,
  deleteTag
} from '../../api/tagsApi';
import CreateTagModal from './CreateTagModal';

const AssignTagModal = ({
  show,
  onClose,
  contactIds,
  isAllSelected
}) => {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  /* LOAD TAGS */
  useEffect(() => {
    if (show) {
      loadTags();
    }
  }, [show]);

  const loadTags = async () => {
    const res = await fetchTags();
    setTags(res.data);
  };

  /* ASSIGN TAG */
const handleAssign = async () => {
  if (!selectedTag) {
    alert('Please select a tag');
    return;
  }

  try {
    await bulkAssignTag({
      tagId: selectedTag,
      contactIds,
      allSelected: isAllSelected
    });

    onClose();
  } catch (err) {
    alert('Tag assign failed');
  }
};

  /* DELETE TAG */
  const handleDeleteTag = async (tagId, tagName) => {
    if (!window.confirm(`Delete tag "${tagName}"?`)) return;

    await deleteTag(tagId);

    setTags(prev => prev.filter(t => t._id !== tagId));
    if (selectedTag === tagId) setSelectedTag('');
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Assign Tag</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">

              {/* SELECT TAG */}
              <label className="form-label">Select Tag</label>
              <select
                className="form-select mb-3"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">-- Choose Tag --</option>
                {tags.map(tag => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>

              {/* TAG LIST WITH DELETE */}
              <div className="mb-3">
                <label className="form-label">Existing Tags</label>

                {tags.length === 0 && (
                  <div className="text-muted">No tags created</div>
                )}

                {tags.map(tag => (
                  <div
                    key={tag._id}
                    className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-2"
                  >
                    <span>{tag.name}</span>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteTag(tag._id, tag.name)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>

              {/* CREATE TAG */}
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowCreate(true)}
              >
                ➕ Create Tag
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleAssign}>
                Assign Tag
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CREATE TAG MODAL */}
      <CreateTagModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(newTag) => {
          setTags(prev => [...prev, newTag]);
          setSelectedTag(newTag._id);
        }}
      />

      <div className="modal-backdrop show" />
    </>
  );
};

export default AssignTagModal;
