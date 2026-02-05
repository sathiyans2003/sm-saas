import React, { useState, useEffect, useRef } from 'react';
import { createTag } from '../../api/tagsApi';
import { bulkAssignTag, removeTagFromContact } from '../../api/contactsApi';

const InlineTagSelect = ({ contact, allTags, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputVal, setInputVal] = useState('');
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsEditing(false);
                setInputVal(''); // Reset filter
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Filter tags that are NOT already assigned to this contact
    const assignedTagIds = new Set(contact.tags.map(t => t._id));
    const availableTags = allTags.filter(t =>
        !assignedTagIds.has(t._id) &&
        t.name.toLowerCase().includes(inputVal.toLowerCase())
    );

    const handleAssign = async (tag) => {
        try {
            await bulkAssignTag({
                contactIds: [contact._id],
                tagId: tag._id,
                allSelected: false
            });
            onUpdate(); // Reload contacts
            setInputVal('');
            // Keep editing open to add more? Or close? User didn't specify. 
            // Usually easy to add multiple is better.
            // But clearing filter is good.
        } catch (err) {
            console.error("Failed to assign tag", err);
            alert("Failed to assign tag");
        }
    };

    const handleCreate = async () => {
        if (!inputVal.trim()) return;
        try {
            // 1. Create Tag
            const res = await createTag({ name: inputVal.trim(), color: '#6c757d' }); // Default color
            const newTag = res.data; // Assuming response is the tag object

            // 2. Assign Tag
            await handleAssign(newTag);
        } catch (err) {
            console.error("Failed to create tag", err);
            // alert("Failed to create tag");
        }
    };

    const handleRemove = async (e, tagId) => {
        e.stopPropagation(); // Prevent opening edit mode if clicking 'x'
        if (!window.confirm("Remove tag?")) return;
        try {
            await removeTagFromContact(contact._id, tagId);
            onUpdate();
        } catch (err) {
            console.error("Failed to remove tag", err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If exact match exists, assign it? Or if it's new?
            // Use exact match first
            const exactMatch = availableTags.find(t => t.name.toLowerCase() === inputVal.trim().toLowerCase());
            if (exactMatch) {
                handleAssign(exactMatch);
            } else if (inputVal.trim()) {
                handleCreate();
            }
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <div
            className="position-relative"
            style={{ minWidth: '150px', cursor: isEditing ? 'default' : 'pointer' }}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            {/* 🏷 DISPLAY TAGS */}
            <div className="d-flex flex-wrap gap-1 align-items-center" style={{ minHeight: '32px' }}>
                {contact.tags && contact.tags.length > 0 ? (
                    contact.tags.map(tag => (
                        <span
                            key={tag._id}
                            className="badge d-inline-flex align-items-center"
                            style={{
                                backgroundColor: tag.color || '#6c757d',
                                gap: '4px',
                                fontSize: '0.85em',
                                padding: '5px 8px'
                            }}
                        >
                            {tag.name}
                            <span
                                style={{ cursor: 'pointer', marginLeft: '4px', opacity: 0.8 }}
                                onClick={(e) => handleRemove(e, tag._id)}
                                title="Remove tag"
                            >
                                ×
                            </span>
                        </span>
                    ))
                ) : (
                    !isEditing && <span className="text-muted small fst-italic">Click to add tags...</span>
                )}
            </div>

            {/* ✏️ EDIT DROPDOWN */}
            {isEditing && (
                <div
                    ref={wrapperRef}
                    className="position-absolute start-0 top-100 mt-1 bg-white border rounded shadow-sm p-2"
                    style={{ zIndex: 1000, width: '200px' }}
                >
                    <input
                        autoFocus
                        type="text"
                        className="form-control form-control-sm mb-2"
                        placeholder="Search or create..."
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <div className="list-group list-group-flush" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {availableTags.map(tag => (
                            <button
                                key={tag._id}
                                type="button"
                                className="list-group-item list-group-item-action py-1 px-2 small"
                                onClick={() => handleAssign(tag)}
                            >
                                {tag.name}
                            </button>
                        ))}

                        {inputVal && availableTags.length === 0 && (
                            <button
                                type="button"
                                className="list-group-item list-group-item-action py-1 px-2 small text-primary"
                                onClick={handleCreate}
                            >
                                + Create "{inputVal}"
                            </button>
                        )}

                        {availableTags.length === 0 && !inputVal && (
                            <div className="text-muted small text-center py-2">No tags found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineTagSelect;
