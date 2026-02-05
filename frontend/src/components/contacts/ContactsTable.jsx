import React from 'react';

const ContactsTable = ({
  contacts,
  selected,
  toggleSelect,
  toggleSelectAll,
  formatDate,
  onDelete
}) => {
  return (
    <table className="table table-bordered table-hover">
      <thead>
        <tr>
          <th className="text-center">
            <input
              type="checkbox"
              checked={
                contacts.length > 0 &&
                selected.length === contacts.length
              }
              onChange={toggleSelectAll}
            />
          </th>
          <th>CONTACT NAME</th>
          <th>EMAIL</th>
          <th>PHONE</th>
          <th>CREATED AT</th>
          <th>TAGS</th>
          <th>ACTIONS</th>
        </tr>
      </thead>

      <tbody>
        {contacts.map(c => (
          <tr key={c._id}>
            <td className="text-center">
              <input
                type="checkbox"
                checked={selected.includes(c._id)}
                onChange={() => toggleSelect(c._id)}
              />
            </td>

            <td className="fw-medium">{c.name}</td>
            <td>{c.email || '-'}</td>
            <td>{c.phone}</td>
            <td>{formatDate(c.createdAt)}</td>

            <td>
              {Array.isArray(c.tags) && c.tags.length > 0 ? (
                c.tags.map((t, i) => (
                  <span key={i} className="badge bg-secondary me-1">
                    {typeof t === 'string' ? t : t.name}
                  </span>
                ))
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>

            <td className="text-center">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(c._id)}
              >
                🗑
              </button>
              
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContactsTable;
