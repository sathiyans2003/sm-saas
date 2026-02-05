import { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { importContacts } from '../../api/contactsApi';
const FIELD_OPTIONS = [
  { value: '', label: 'Do not import' },
  { value: 'name', label: 'Name' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'email', label: 'Email' },
  { value: 'tags', label: 'Tags' }
];

const ImportContactsModal = ({ show, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [sampleRow, setSampleRow] = useState({});
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  /* =====================
     FILE UPLOAD
  ===================== */
  const handleFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          setRows(res.data);
          setHeaders(Object.keys(res.data[0]));
          setSampleRow(res.data[0]);
          setStep(2);
        }
      });
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        setRows(json);
        setHeaders(Object.keys(json[0]));
        setSampleRow(json[0]);
        setStep(2);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  /* =====================
     IMPORT
  ===================== */
  const handleImport = async () => {
    if (!Object.values(mapping).includes('phone')) {
      alert('Phone number mapping is required');
      return;
    }

    const contacts = rows.map(row => {
      const obj = {};
      Object.keys(mapping).forEach(col => {
        if (mapping[col]) {
          if (mapping[col] === 'tags') {
            obj.tags = row[col]?.split(',') || [];
          } else {
            obj[mapping[col]] = row[col];
          }
        }
      });
      return obj;
    });

    try {
      setLoading(true);
      await importContacts({ contacts });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal show d-block">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Import Contacts</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <p className="text-muted">
                    Upload CSV or Excel file
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="form-control"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </>
              )}

              {/* STEP 2 – COLUMN MAPPING */}
              {step === 2 && (
                <>
                  <h6 className="mb-2">
                    Map CSV Columns to Contact Fields
                  </h6>

                  <div className="alert alert-info">
                    Phone Number mapping is required.
                  </div>

                  <table className="table">
                    <thead>
                      <tr>
                        <th>CSV Column</th>
                        <th>Contact Field</th>
                        <th>Sample Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headers.map(col => (
                        <tr key={col}>
                          <td>{col}</td>
                          <td>
                            <select
                              className="form-select"
                              value={mapping[col] || ''}
                              onChange={(e) =>
                                setMapping({
                                  ...mapping,
                                  [col]: e.target.value
                                })
                              }
                            >
                              {FIELD_OPTIONS.map(opt => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-muted">
                            {sampleRow[col]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

            </div>

            <div className="modal-footer">
              {step === 2 && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              )}

              {step === 2 && (
                <button
                  className="btn btn-success"
                  onClick={handleImport}
                  disabled={loading}
                >
                  {loading ? 'Importing...' : 'Import'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default ImportContactsModal;
