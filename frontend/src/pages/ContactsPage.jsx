import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchContacts,
  deleteContact,
  bulkDelete,
  deleteAllContacts
} from '../api/contactsApi';
import { startChat } from '../api/chatsApi';
import { fetchTags } from '../api/tagsApi';

import BulkActionBar from '../components/contacts/BulkActionBar';
import AddContactModal from '../components/contacts/AddContactModal';
import ImportContactsModal from '../components/contacts/ImportContactsModal';
import EditContactModal from '../components/contacts/EditContactModal';
import AssignTagModal from '../components/contacts/AssignTagModal';
import InlineTagSelect from '../components/contacts/InlineTagSelect';

const ContactsPage = () => {
  const navigate = useNavigate();

  /* =====================
     STATE
  ====================== */
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showAssignTag, setShowAssignTag] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const [tags, setTags] = useState([]);
  const [filterTag, setFilterTag] = useState('');

  /* =====================
     LOAD TAGS
  ====================== */
  useEffect(() => {
    fetchTags().then(res => setTags(res.data));
  }, []);

  /* =====================
     LOAD CONTACTS
  ====================== */
  const loadContacts = useCallback(async (pageNo = page) => {
    try {
      const res = await fetchContacts(pageNo, limit, filterTag);
      setContacts(res.data.contacts);
      setTotal(res.data.total);
      if (!allSelected) setSelected([]);
    } catch (err) {
      console.error("Failed to load contacts");
    }
  }, [page, limit, filterTag, allSelected]);

  useEffect(() => {
    loadContacts(page);
  }, [loadContacts, page]);

  /* 🔥 reload when tag filter changes */
  useEffect(() => {
    loadContacts(1);
    setPage(1);
  }, [loadContacts, filterTag]);

  /* =====================
     SELECTION
  ====================== */
  const toggleSelect = (id) => {
    if (allSelected) {
      setAllSelected(false);
      setSelected([id]);
      return;
    }

    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectCurrentPage = () => {
    setSelected(contacts.map(c => c._id));
    setAllSelected(false);
  };

  const selectAllRecords = () => {
    setAllSelected(true);
    setSelected([]);
  };

  const clearSelection = () => {
    setSelected([]);
    setAllSelected(false);
  };

  /* =====================
     BULK DELETE
  ====================== */
  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected contacts?')) return;

    if (allSelected) {
      await deleteAllContacts();
    } else {
      await bulkDelete(selected);
    }

    clearSelection();
    loadContacts(page);
  };

  /* =====================
     CHAT HANDLER
  ====================== */
  const handleChat = async (contactId) => {
    try {
      const res = await startChat(contactId);
      navigate('/chats', { state: { chat: res.data } });
    } catch (err) {
      alert("Failed to start chat");
    }
  };

  const formatDate = d => new Date(d).toLocaleString();
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-fluid">

      <h4 className="mb-3">Contacts</h4>

      {/* 🔥 BULK ACTION BAR */}
      <BulkActionBar
        selectedCount={allSelected ? total : selected.length}
        totalCount={total}
        isAllSelected={allSelected}
        onSelectAll={selectAllRecords}
        onClear={clearSelection}
        onDelete={handleBulkDelete}
        onAssignTag={() => setShowAssignTag(true)}
      />

      {/* ACTION BUTTONS */}
      <div className="mb-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Contact
        </button>

        <button className="btn btn-outline-secondary" onClick={() => setShowImport(true)}>
          Import
        </button>

        {/* 🔍 TAG FILTER */}
        <select
          className="form-select w-auto"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag._id} value={tag._id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th className="text-center">
              <input
                type="checkbox"
                checked={
                  allSelected ||
                  (contacts.length > 0 && selected.length === contacts.length)
                }
                onChange={() => {
                  if (allSelected) clearSelection();
                  else selectCurrentPage();
                }}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map(c => (
            <tr key={c._id}>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={allSelected || selected.includes(c._id)}
                  onChange={() => toggleSelect(c._id)}
                />
              </td>

              <td>{c.name}</td>
              <td>{c.email || '-'}</td>
              <td>{c.phone}</td>
              <td>{formatDate(c.createdAt)}</td>

              {/* 🏷 TAGS */}
              <td>
                <InlineTagSelect
                  contact={c}
                  allTags={tags}
                  onUpdate={() => loadContacts(page)}
                />
              </td>

              <td>
                <button
                  className="btn btn-sm btn-outline-success me-2"
                  onClick={() => handleChat(c._id)}
                  title="Chat"
                >
                  <i className="bi bi-chat-dots-fill"></i>
                </button>

                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => setEditContact(c)}
                >
                  ✏️
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={async () => {
                    if (window.confirm('Delete this contact?')) {
                      await deleteContact(c._id);
                      loadContacts(page);
                    }
                  }}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between mt-3">
        <span>
          Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total}
        </span>

        <div className="btn-group">
          <button
            disabled={page === 1}
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>

          <button className="btn btn-sm btn-outline-secondary disabled">
            Page {page}
          </button>

          <button
            disabled={page === totalPages}
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}
      <AddContactModal show={showAdd} onClose={() => setShowAdd(false)} onSuccess={loadContacts} />
      <ImportContactsModal show={showImport} onClose={() => setShowImport(false)} onSuccess={loadContacts} />
      <EditContactModal contact={editContact} onClose={() => setEditContact(null)} onSuccess={loadContacts} />

      {/* ASSIGN TAG MODAL */}
      <AssignTagModal
        show={showAssignTag}
        contactIds={allSelected ? [] : selected}
        isAllSelected={allSelected}
        onClose={() => setShowAssignTag(false)}
        onSuccess={() => {
          setShowAssignTag(false);
          loadContacts(page);
        }}
      />
    </div>
  );
};

export default ContactsPage;
