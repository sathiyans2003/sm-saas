const BulkActionBar = ({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClear,
  onDelete,
  onAssignTag
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="alert alert-light border d-flex justify-content-between align-items-center mb-3">

      {/* LEFT TEXT */}
      <div className="fw-medium">
        {isAllSelected ? (
          <>Selected all <strong>{totalCount}</strong> contacts</>
        ) : (
          <>
            <strong>{selectedCount}</strong> contact{selectedCount > 1 ? 's' : ''} selected
            {selectedCount < totalCount && (
              <>
                {' '}·{' '}
                <button className="btn btn-link btn-sm p-0" onClick={onSelectAll}>
                  Select all {totalCount}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={onAssignTag}>
          🏷 Tag
        </button>

        <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>
          🗑 Delete
        </button>

        <button className="btn btn-sm btn-link" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
